/**
 * Wishlist — Google Apps Script Backend (TypeScript)
 * ────────────────────────────────────────────────────
 * Deploy via clasp:
 *   npm run gas:push        (push code to GAS)
 *   npm run gas:deploy      (create new deployment)
 *
 * Or manually: paste into the Apps Script editor, deploy as a Web App.
 *   Execute as: Me  |  Who has access: Anyone
 *
 * Sheet columns (auto-created):
 *   id | title | description | imageUrl | link | price | tags | purchased | createdAt | sortOrder
 */

// ── Types ────────────────────────────────────────────────────────────────────

interface WishItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  price?: number;
  tags: string[];
  purchased: boolean;
  createdAt: string;
  sortOrder: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface GetParams extends GoogleAppsScript.Events.DoGet {
  parameter: {
    action?: string;
    token?: string;
  };
}

interface PostBody {
  action: string;
  token?: string;
  data?: WishItem;
  id?: string;
  purchased?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SHEET_NAME = 'WishList' as const;

const PROP_VIEW_TOKEN = 'VIEW_TOKEN' as const;
const PROP_EDIT_TOKEN = 'EDIT_TOKEN' as const;

/** Column indices (0-based) matching the sheet layout */
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
} as const;

const NUM_COLS = 10 as const;

// ── Response helpers ──────────────────────────────────────────────────────────

function jsonResponse<T>(
  data: ApiResponse<T>
): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function ok<T>(data?: T): GoogleAppsScript.Content.TextOutput {
  return jsonResponse<T>({ success: true, ...(data !== undefined ? { data } : {}) });
}

function err(message: string): GoogleAppsScript.Content.TextOutput {
  return jsonResponse({ success: false, error: message });
}

// ── Token validation ──────────────────────────────────────────────────────────

function getScriptProp(key: string): string {
  return PropertiesService.getScriptProperties().getProperty(key) ?? '';
}

function isValidViewToken(token: string): boolean {
  const viewToken = getScriptProp(PROP_VIEW_TOKEN);
  const editToken = getScriptProp(PROP_EDIT_TOKEN);

  // If no tokens are configured, allow all requests
  if (!viewToken && !editToken) return true;

  // Edit token also grants read access
  if (editToken && token === editToken) return true;

  return !viewToken || token === viewToken;
}

function isValidEditToken(token: string): boolean {
  const editToken = getScriptProp(PROP_EDIT_TOKEN);

  // If no edit token configured, allow all write requests
  if (!editToken) return true;

  return token === editToken;
}

// ── HTTP handlers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doGet(e: GetParams): GoogleAppsScript.Content.TextOutput {
  try {
    const action = e.parameter.action ?? 'getItems';
    const token  = e.parameter.token  ?? '';

    if (action === 'getItems') {
      if (!isValidViewToken(token)) {
        return err('Unauthorized');
      }
      return ok<WishItem[]>(getItems());
    }

    return err(`Unknown action: ${action}`);
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doPost(
  e: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput {
  try {
    const body: PostBody = JSON.parse(e.postData.contents) as PostBody;
    const { action, token = '' } = body;

    if (!isValidEditToken(token)) {
      return err('Unauthorized');
    }

    switch (action) {
      case 'saveItem': {
        if (!body.data) return err('Missing data payload');
        saveItem(body.data);
        return ok();
      }
      case 'deleteItem': {
        if (!body.id) return err('Missing id');
        deleteItem(body.id);
        return ok();
      }
      case 'markPurchased': {
        if (!body.id) return err('Missing id');
        markPurchased(body.id, body.purchased ?? false);
        return ok();
      }
      default:
        return err(`Unknown action: ${action}`);
    }
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

// ── Sheet helpers ─────────────────────────────────────────────────────────────

function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    const headers: string[] = [
      'id', 'title', 'description', 'imageUrl', 'link',
      'price', 'tags', 'purchased', 'createdAt', 'sortOrder',
    ];
    sheet.appendRow(headers);

    const headerRange = sheet.getRange(1, 1, 1, NUM_COLS);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f0');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1,  180); // id
    sheet.setColumnWidth(2,  200); // title
    sheet.setColumnWidth(3,  280); // description
    sheet.setColumnWidth(4,  300); // imageUrl
    sheet.setColumnWidth(5,  300); // link
  }

  return sheet;
}

function rowToItem(row: unknown[]): WishItem {
  const rawPrice = row[COL.price];
  const rawTags  = row[COL.tags];

  return {
    id:          String(row[COL.id]          ?? ''),
    title:       String(row[COL.title]       ?? ''),
    description: String(row[COL.description] ?? ''),
    imageUrl:    String(row[COL.imageUrl]    ?? ''),
    link:        String(row[COL.link]        ?? ''),
    price:
      rawPrice !== '' && rawPrice !== null && rawPrice !== undefined
        ? Number(rawPrice)
        : undefined,
    tags:
      rawTags
        ? String(rawTags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    purchased:
      row[COL.purchased] === true || row[COL.purchased] === 'TRUE',
    createdAt: String(row[COL.createdAt] ?? new Date().toISOString()),
    sortOrder: Number(row[COL.sortOrder]  ?? 0),
  };
}

function itemToRow(item: WishItem): unknown[] {
  return [
    item.id,
    item.title,
    item.description,
    item.imageUrl,
    item.link,
    item.price !== undefined ? item.price : '',
    item.tags.join(', '),
    item.purchased,
    item.createdAt,
    item.sortOrder,
  ];
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function getItems(): WishItem[] {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues() as unknown[][];
  return data
    .slice(1)                        // skip header
    .filter((row) => !!row[COL.id])  // skip blank rows
    .map(rowToItem);
}

function saveItem(item: WishItem): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues() as unknown[][];
  const rows  = data.slice(1);

  const rowIdx = rows.findIndex(
    (r) => String(r[COL.id]) === String(item.id)
  );

  const newRow = itemToRow(item);

  if (rowIdx >= 0) {
    // +1 for 0-index, +1 for header → sheet row is rowIdx + 2
    sheet.getRange(rowIdx + 2, 1, 1, NUM_COLS).setValues([newRow]);
  } else {
    sheet.appendRow(newRow);
  }
}

function deleteItem(id: string): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues() as unknown[][];

  // Iterate in reverse so row deletion doesn't shift indices
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][COL.id]) === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function markPurchased(id: string, purchased: boolean): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues() as unknown[][];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.id]) === id) {
      sheet.getRange(i + 1, COL.purchased + 1).setValue(purchased);
      break;
    }
  }
}
