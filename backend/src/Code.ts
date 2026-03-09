/**
 * Wishlist — Google Apps Script Backend (TypeScript)
 * ────────────────────────────────────────────────────
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

// ── Constants ─────────────────────────────────────────────────────────────────

const CACHE_KEY = 'WISHLIST_DATA';
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
  if (!viewToken && !editToken) return true;
  if (editToken && token === editToken) return true;
  return !viewToken || token === viewToken;
}

function isValidEditToken(token: string): boolean {
  const editToken = getScriptProp(PROP_EDIT_TOKEN);
  if (!editToken) return true;
  return token === editToken;
}

// ── HTTP handlers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function doGet(e: any): GoogleAppsScript.Content.TextOutput {
  try {
    const action = e.parameter.action ?? 'getItems';
    const token  = e.parameter.token  ?? e.parameter.viewToken ?? e.parameter.editToken ?? '';

    if (action === 'getItems' || action === 'getData') {
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
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const token = body.token ?? body.editToken ?? '';

    if (!isValidEditToken(token)) {
      return err('Unauthorized');
    }

    switch (action) {
      case 'saveItem':
      case 'UPDATE': {
        const item = body.data ?? body.product;
        if (!item) return err('Missing data payload');
        saveItem(item);
        return ok();
      }
      case 'deleteItem': {
        if (!body.id) return err('Missing id');
        deleteItem(body.id);
        return ok();
      }
      case 'markPurchased':
      case 'MARK_PURCHASED': {
        const id = body.id ?? (body.product ? body.product.id : null);
        if (!id) return err('Missing id');
        markPurchased(id, body.purchased ?? true);
        return ok();
      }
      case 'SEND_INVITE': {
        sendGmailInvite(body.email, body.url);
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
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rowToItem(row: any[]): WishItem {
  return {
    id:          String(row[COL.id]          ?? ''),
    title:       String(row[COL.title]       ?? ''),
    description: String(row[COL.description] ?? ''),
    imageUrl:    String(row[COL.imageUrl]    ?? ''),
    link:        String(row[COL.link]        ?? ''),
    price:       row[COL.price] ? Number(row[COL.price]) : undefined,
    tags:        row[COL.tags] ? String(row[COL.tags]).split(',').map(t => t.trim()) : [],
    purchased:   row[COL.purchased] === true || row[COL.purchased] === 'TRUE',
    createdAt:   String(row[COL.createdAt] ?? new Date().toISOString()),
    sortOrder:   Number(row[COL.sortOrder]  ?? 0),
  };
}

function itemToRow(item: WishItem): any[] {
  return [
    item.id,
    item.title,
    item.description,
    item.imageUrl,
    item.link,
    item.price ?? '',
    item.tags.join(', '),
    item.purchased,
    item.createdAt,
    item.sortOrder,
  ];
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function getItems(): WishItem[] {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  return data
    .slice(1)
    .filter((row) => !!row[COL.id])
    .map(rowToItem);
}

function saveItem(item: WishItem): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const rowIdx = data.findIndex(r => String(r[COL.id]) === String(item.id));

  const newRow = itemToRow(item);
  if (rowIdx >= 1) {
    sheet.getRange(rowIdx + 1, 1, 1, NUM_COLS).setValues([newRow]);
  } else {
    sheet.appendRow(newRow);
  }
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function deleteItem(id: string): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][COL.id]) === id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function markPurchased(id: string, purchased: boolean): void {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.id]) === id) {
      sheet.getRange(i + 1, COL.purchased + 1).setValue(purchased);
      break;
    }
  }
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function sendGmailInvite(email: string, url: string): void {
  const subject = 'Check out my Wishlist!';
  const htmlBody = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>You've been invited to view my Wishlist</h2>
      <p>Click the button below to view it securely:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Wishlist</a>
    </div>
  `;
  GmailApp.sendEmail(email, subject, 'Enable HTML to view.', {htmlBody});
}
