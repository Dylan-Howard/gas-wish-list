import {describe, it, expect, vi} from 'vitest';
import {
  getWishlistData,
  handleProductUpdate,
  sendGmailInvite,
  doGetAsApi,
} from './Code';

// 1. Mock the Google Apps Script Environment
const mockSheet = {
  getDataRange: vi.fn(() => ({
    getValues: vi.fn(() => [
      ['id', 'name', 'tags', 'purchased'],
      ['1', 'Test Item', 'tag1,tag2', false],
    ]),
  })),
  getRange: vi.fn(() => ({
    setValue: vi.fn(),
    setValues: vi.fn(),
  })),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).SpreadsheetApp = {
  getActiveSpreadsheet: vi.fn(() => ({
    getSheetByName: vi.fn(() => mockSheet),
  })),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).CacheService = {
  getScriptCache: vi.fn(() => ({
    get: vi.fn(),
    put: vi.fn(),
    remove: vi.fn(),
  })),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).GmailApp = {
  sendEmail: vi.fn(),
};

// 2. Tests
describe('GAS Backend Logic', () => {
  it('getWishlistData should format sheet rows into objects', () => {
    const data = getWishlistData();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('1');
    expect(data[0].tags).toContain('tag1');
  });

  it('handleProductUpdate should find and update correct row', () => {
    const product = {id: '1', name: 'Updated', tags: ['new'], purchased: false};
    const result = handleProductUpdate(product, 'UPDATE');

    expect(result).toBe(true);
    expect(mockSheet.getRange).toHaveBeenCalled();
  });

  it('handleProductUpdate should throw error if ID not found', () => {
    const product = {id: '999'};
    expect(() => handleProductUpdate(product, 'UPDATE')).toThrow(
      'Product not found',
    );
  });

  it('sendGmailInvite should validate email formats', () => {
    expect(() => sendGmailInvite('bad-email', 'url')).toThrow(
      'Invalid email format',
    );

    const result = sendGmailInvite('test@example.com', 'https://wishlist.com');
    expect(result).toBe(true);
    expect(global.GmailApp.sendEmail).toHaveBeenCalled();
  });

  it('doGetAsApi should block unauthorized requests', () => {
    const responseJson = doGetAsApi({key: 'wrong-key', action: 'getData'});
    const response = JSON.parse(responseJson);
    expect(response.success).toBe(false);
    expect(response.error).toBe('Unauthorized');
  });
});
