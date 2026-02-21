/* eslint-disable @typescript-eslint/no-explicit-any */

const CACHE_KEY = 'WISHLIST_DATA';
const SHEET_NAME = 'Products';
const AUTH_KEY = 'REPLACE_WITH_YOUR_32_CHAR_KEY_HERE';
const ADMIN_KEY = 'REPLACE_WITH_YOUR_ADMIN_KEY_HERE';

function getCache() {
  return CacheService.getScriptCache();
}

/**
 * Core Helper: Fetch and Format Data
 */
export function getWishlistData(): any[] {
  const cachedData = getCache().get(CACHE_KEY);
  if (cachedData) return JSON.parse(cachedData);

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const products = rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    obj.tags = obj.tags
      ? String(obj.tags)
          .split(',')
          .map(t => t.trim())
      : [];
    obj.purchased = obj.purchased === true || obj.purchased === 'TRUE';
    return obj;
  });

  getCache().put(CACHE_KEY, JSON.stringify(products), 900);
  return products;
}

/**
 * Core Helper: Handle Product Updates
 */
export function handleProductUpdate(product: any, action: string): boolean {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === product.id) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error('Product not found');

  if (action === 'MARK_PURCHASED') {
    const purIndex = headers.indexOf('purchased') + 1;
    sheet.getRange(rowIndex, purIndex).setValue(true);
  } else {
    const updateRow = headers.map(h => {
      if (h === 'tags')
        return Array.isArray(product.tags) ? product.tags.join(',') : '';
      return product[h] !== undefined ? product[h] : '';
    });
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updateRow]);
  }

  getCache().remove(CACHE_KEY);
  return true;
}

/**
 * Core Helper: Send Email Invite
 */
export function sendGmailInvite(email: string, url: string): boolean {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }

  const subject = 'Check out my Wishlist!';
  const htmlBody = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>You've been invited to view my Wishlist</h2>
      <p>Click the button below to view it securely:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Wishlist</a>
    </div>
  `;

  GmailApp.sendEmail(email, subject, 'Enable HTML to view.', {htmlBody});
  return true;
}

// --- Entry Points ---

export function doGet(e: any) {
  const isAdmin = e.parameter.key === ADMIN_KEY;
  if (e.parameter.key !== AUTH_KEY && !isAdmin)
    return buildResponse({error: 'Unauthorized'});

  if (e.parameter.action === 'getData') {
    return buildResponse({
      source: 'auto',
      data: getWishlistData(),
      isAdmin: isAdmin,
    });
  }

  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('My Wishlist')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

export function doPost(e: any) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const isAdmin = payload.key === ADMIN_KEY;
    if (payload.key !== AUTH_KEY && !isAdmin)
      return buildResponse({error: 'Unauthorized'});

    let result;
    if (payload.action === 'SEND_INVITE') {
      result = sendGmailInvite(payload.email, payload.url);
    } else {
      result = handleProductUpdate(payload.product, payload.action);
    }
    return buildResponse({success: true, data: result});
  } catch (err: any) {
    return buildResponse({error: err.message});
  }
}

export function doGetAsApi(params: any) {
  try {
    const isAdmin = params.key === ADMIN_KEY;
    if (params.key !== AUTH_KEY && !isAdmin) throw new Error('Unauthorized');
    let result;
    switch (params.action) {
      case 'getData':
        result = getWishlistData();
        break;
      case 'UPDATE':
      case 'MARK_PURCHASED':
        result = handleProductUpdate(params.product, params.action);
        break;
      case 'SEND_INVITE':
        result = sendGmailInvite(params.email, params.url);
        break;
      default:
        throw new Error('Invalid Action');
    }
    return JSON.stringify({success: true, data: result});
  } catch (e: any) {
    return JSON.stringify({success: false, error: e.message});
  }
}

/**
 * Core Helper: Get Sheet Instance
 */
export function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet with name "${SHEET_NAME}" not found.`);
  return sheet;
}

/**
 * Core Helper: Build JSON Response for Web App
 */
export function buildResponse(data: any): GoogleAppsScript.HTML.HtmlOutput {
  const json = JSON.stringify(data);
  return HtmlService.createHtmlOutput(json).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL,
  );
}
