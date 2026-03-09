/**
 * Wishlist — Google Apps Script Backend (TypeScript)
 * ────────────────────────────────────────────────────
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface WishItem {
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

export type AuthMode = 'viewer' | 'editor' | 'unauthorized';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  mode?: AuthMode;
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

export function jsonResponse<T>(
  data: ApiResponse<T>
): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

export function ok<T>(data?: T, mode?: AuthMode): GoogleAppsScript.Content.TextOutput {
  return jsonResponse<T>({ 
    success: true, 
    ...(data !== undefined ? { data } : {}),
    ...(mode ? { mode } : {})
  });
}

export function err(message: string): GoogleAppsScript.Content.TextOutput {
  return jsonResponse({ success: false, error: message });
}

// ── Token validation ──────────────────────────────────────────────────────────

export function getScriptProp(key: string): string {
  return PropertiesService.getScriptProperties().getProperty(key) ?? '';
}

// ── HTTP handlers ─────────────────────────────────────────────────────────────

type PostBody = {
  action?: string;
  token?: string;
  editToken?: string;
  data?: WishItem;
  product?: WishItem;
  id?: string;
  purchased?: boolean;
  email?: string;
  url?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function doGet(e: any): GoogleAppsScript.Content.TextOutput {
  try {
    const action = e.parameter.action ?? 'getItems';
    const token  = e.parameter.token  ?? e.parameter.viewToken ?? e.parameter.editToken ?? '';

    if (!token) {
      return err('Unauthorized');
    }

    const editToken = getScriptProp(PROP_EDIT_TOKEN);
    const viewToken = getScriptProp(PROP_VIEW_TOKEN);

    if (action === 'getItems' || action === 'getData') {
      // 1. Check Editor
      if (editToken && token === editToken) {
        return ok<WishItem[]>(getItems(), 'editor');
      }
      
      // 2. Check Viewer
      if (!viewToken || token === viewToken) {
        return ok<WishItem[]>(getItems(), 'viewer');
      }

      // 3. Invalid token: Return obscured empty list
      return ok<WishItem[]>([], 'viewer');
    }

    return err(`Unknown action: ${action}`);
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function doPost(
  e: GoogleAppsScript.Events.DoPost
): GoogleAppsScript.Content.TextOutput {
  try {
    const rawBody = e.postData?.contents ?? '';
    let parsed: Record<string, unknown> = {};
    if (rawBody) {
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        // Fallback for x-www-form-urlencoded or plain text key=value
        parsed = rawBody.split('&').reduce<Record<string, unknown>>((acc, pair) => {
          const [rawKey, rawValue] = pair.split('=');
          if (!rawKey) return acc;
          const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
          const value = decodeURIComponent((rawValue ?? '').replace(/\+/g, ' '));
          acc[key] = value;
          return acc;
        }, {});
      }
    }
    const body = parsed as PostBody;
    const action = body.action;
    const token = body.token ?? body.editToken ?? '';

    const editToken = getScriptProp(PROP_EDIT_TOKEN);
    if (editToken && token !== editToken) {
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
        const id = body.id;
        if (!id) return err('Missing id');
        deleteItem(id);
        return ok();
      }
      case 'markPurchased':
      case 'MARK_PURCHASED': {
        const id = body.id ?? body.product?.id ?? null;
        if (!id) return err('Missing id');
        const purchased = typeof body.purchased === 'boolean' ? body.purchased : true;
        markPurchased(id, purchased);
        return ok();
      }
      case 'SEND_INVITE': {
        const email = body.email;
        const url = body.url;
        if (!email || !url) return err('Missing email or url');
        sendGmailInvite(email, url);
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

export function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
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

export function rowToItem(row: any[]): WishItem {
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

export function itemToRow(item: WishItem): any[] {
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

export function getItems(): WishItem[] {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore parse error and fetch from sheet
    }
  }

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const items = data
    .slice(1)
    .filter((row) => !!row[COL.id])
    .map(rowToItem);

  try {
    cache.put(CACHE_KEY, JSON.stringify(items), 21600); // 6 hours
  } catch (e) {
    // ignore cache write error (e.g. data too large)
  }

  return items;
}

export function saveItem(item: WishItem): void {
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

export function sendGmailInvite(email: string, url: string): void {
  // Simple validation
  if (!email.includes('@')) throw new Error('Invalid email format');

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
