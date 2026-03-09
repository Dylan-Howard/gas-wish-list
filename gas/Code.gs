/**
 * Wishlist — Google Apps Script Backend
 * ──────────────────────────────────────
 * Deploy as: Web App → Execute as "Me" → Who has access: "Anyone"
 *
 * Sheet structure (auto-created on first run):
 * Columns: id | title | description | imageUrl | link | price | tags | purchased | createdAt | sortOrder
 */

const SHEET_NAME = 'WishList';

// ── Optional server-side token validation ────────────────────────────────────
// Set these Script Properties (Project Settings → Script Properties) for extra
// security. Leave them blank to disable server-side token checking.
const PROP_VIEW_TOKEN = 'VIEW_TOKEN';
const PROP_EDIT_TOKEN = 'EDIT_TOKEN';

// Column indices (0-based)
const COL = {
  id:          0,
  title:       1,
  description: 2,
  imageUrl:    3,
  link:        4,
  price:       5,
  tags:        6,
  purchased:   7,
  createdAt:   8,
  sortOrder:   9,
};

// ── CORS response helper ─────────────────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function corsHeaders(output) {
  // GAS does not support setting arbitrary headers on GET/POST via ContentService,
  // but returning JSON with no-cookie credentials from a public exec URL is
  // sufficient for browser fetch() when the front-end is on GitHub Pages.
  return output;
}

// ── GET handler ──────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action || 'getItems';
    const token  = e.parameter.token  || '';

    if (action === 'getItems') {
      // Validate view token if configured
      const viewToken = PropertiesService.getScriptProperties().getProperty(PROP_VIEW_TOKEN);
      if (viewToken && token !== viewToken) {
        const editToken = PropertiesService.getScriptProperties().getProperty(PROP_EDIT_TOKEN);
        if (editToken && token !== editToken) {
          return jsonResponse({ success: false, error: 'Unauthorized' });
        }
      }
      return corsHeaders(jsonResponse({ success: true, data: getItems() }));
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── POST handler ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';
    const token  = body.token  || '';

    // Validate edit token if configured
    const editToken = PropertiesService.getScriptProperties().getProperty(PROP_EDIT_TOKEN);
    if (editToken && token !== editToken) {
      return jsonResponse({ success: false, error: 'Unauthorized' });
    }

    if (action === 'saveItem') {
      saveItem(body.data);
      return corsHeaders(jsonResponse({ success: true }));
    }

    if (action === 'deleteItem') {
      deleteItem(body.id);
      return corsHeaders(jsonResponse({ success: true }));
    }

    if (action === 'markPurchased') {
      markPurchased(body.id, body.purchased);
      return corsHeaders(jsonResponse({ success: true }));
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Sheet helpers ─────────────────────────────────────────────────────────────
function getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Write header row
    sheet.appendRow([
      'id', 'title', 'description', 'imageUrl', 'link',
      'price', 'tags', 'purchased', 'createdAt', 'sortOrder'
    ]);
    // Format header
    const header = sheet.getRange(1, 1, 1, 10);
    header.setFontWeight('bold');
    header.setBackground('#f3f3f0');
  }

  return sheet;
}

function rowToItem(row) {
  return {
    id:          String(row[COL.id]          || ''),
    title:       String(row[COL.title]       || ''),
    description: String(row[COL.description] || ''),
    imageUrl:    String(row[COL.imageUrl]    || ''),
    link:        String(row[COL.link]        || ''),
    price:       row[COL.price] !== '' && row[COL.price] !== null
                   ? Number(row[COL.price])
                   : undefined,
    tags:        row[COL.tags]
                   ? String(row[COL.tags]).split(',').map(t => t.trim()).filter(Boolean)
                   : [],
    purchased:   row[COL.purchased] === true || row[COL.purchased] === 'TRUE',
    createdAt:   String(row[COL.createdAt]   || new Date().toISOString()),
    sortOrder:   Number(row[COL.sortOrder]   || 0),
  };
}

// ── CRUD operations ───────────────────────────────────────────────────────────
function getItems() {
  const sheet  = getSheet();
  const data   = sheet.getDataRange().getValues();
  const rows   = data.slice(1); // skip header

  return rows
    .filter(row => row[COL.id]) // skip blank rows
    .map(rowToItem);
}

function saveItem(item) {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const rows  = data.slice(1);

  // Find existing row by id
  const rowIdx = rows.findIndex(r => String(r[COL.id]) === String(item.id));

  const newRow = [
    item.id,
    item.title,
    item.description,
    item.imageUrl,
    item.link,
    item.price !== undefined ? item.price : '',
    Array.isArray(item.tags) ? item.tags.join(', ') : '',
    item.purchased ? true : false,
    item.createdAt || new Date().toISOString(),
    item.sortOrder || 0,
  ];

  if (rowIdx >= 0) {
    // Update existing row (sheet rows are 1-indexed, +1 for header)
    sheet.getRange(rowIdx + 2, 1, 1, newRow.length).setValues([newRow]);
  } else {
    // Append new row
    sheet.appendRow(newRow);
  }
}

function deleteItem(id) {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][COL.id]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function markPurchased(id, purchased) {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.id]) === String(id)) {
      sheet.getRange(i + 1, COL.purchased + 1).setValue(purchased ? true : false);
      break;
    }
  }
}
