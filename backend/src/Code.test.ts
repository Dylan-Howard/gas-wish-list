import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  getItems,
  saveItem,
  sendGmailInvite,
  doGet,
} from './Code';
import type { WishItem } from './Code';

// 1. Mock the Google Apps Script Environment
const mockSheet = {
  getDataRange: vi.fn(() => ({
    getValues: vi.fn(() => [
      ['id', 'title', 'description', 'imageUrl', 'link', 'price', 'tags', 'purchased', 'createdAt', 'sortOrder'],
      ['1', 'Test Item', 'Desc', 'http://img', 'http://link', 10, 'tag1,tag2', false, '2024-01-01', 0],
    ]),
  })),
  getRange: vi.fn(() => ({
    setValue: vi.fn(),
    setValues: vi.fn(),
  })),
  appendRow: vi.fn(),
  deleteRow: vi.fn(),
};

const mockSpreadsheet = {
  getSheetByName: vi.fn(() => mockSheet),
  insertSheet: vi.fn(() => mockSheet),
};

const mockCache = {
  get: vi.fn(),
  put: vi.fn(),
  remove: vi.fn(),
};

const mockProperties = {
  getProperty: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).SpreadsheetApp = {
  getActiveSpreadsheet: vi.fn(() => mockSpreadsheet),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).CacheService = {
  getScriptCache: vi.fn(() => mockCache),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).PropertiesService = {
  getScriptProperties: vi.fn(() => mockProperties),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).GmailApp = {
  sendEmail: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ContentService = {
  createTextOutput: vi.fn((text: string) => ({
    setMimeType: vi.fn(() => text),
  })),
  MimeType: { JSON: 'JSON' },
};

// 2. Tests
describe('GAS Backend Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getItems should format sheet rows into objects and use cache', () => {
    mockCache.get.mockReturnValue(null);
    const data = getItems();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe('1');
    expect(data[0].title).toBe('Test Item');
    expect(data[0].tags).toContain('tag1');
    expect(mockCache.put).toHaveBeenCalled();
  });

  it('getItems should return cached data if available', () => {
    const cachedData = [{ id: 'cached-1', title: 'Cached' }];
    mockCache.get.mockReturnValue(JSON.stringify(cachedData));
    
    const data = getItems();
    expect(data).toEqual(cachedData);
    expect(mockSheet.getDataRange).not.toHaveBeenCalled();
  });

  it('saveItem should update existing row', () => {
    const item: WishItem = {
      id: '1',
      title: 'Updated',
      description: '',
      imageUrl: '',
      link: '',
      tags: [],
      purchased: false,
      createdAt: '',
      sortOrder: 0
    };
    saveItem(item);

    expect(mockSheet.getRange).toHaveBeenCalled();
    expect(mockCache.remove).toHaveBeenCalled();
  });

  it('sendGmailInvite should validate email formats', () => {
    expect(() => sendGmailInvite('bad-email', 'url')).toThrow(
      'Invalid email format',
    );

    sendGmailInvite('test@example.com', 'https://wishlist.com');
    expect(global.GmailApp.sendEmail).toHaveBeenCalled();
  });

  describe('Authentication (doGet)', () => {
    beforeEach(() => {
      mockProperties.getProperty.mockImplementation((key: string) => {
        if (key === 'VIEW_TOKEN') return 'view-123';
        if (key === 'EDIT_TOKEN') return 'edit-123';
        return null;
      });
    });

    it('should return error if no token is provided', () => {
      const e = { parameter: { action: 'getItems' } };
      const response = doGet(e);
      const result = JSON.parse(response as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return editor mode if edit token matches', () => {
      const e = { parameter: { action: 'getItems', token: 'edit-123' } };
      const response = doGet(e);
      const result = JSON.parse(response as any);
      expect(result.success).toBe(true);
      expect(result.mode).toBe('editor');
      expect(result.data).toHaveLength(1); // Real items
    });

    it('should return viewer mode if view token matches', () => {
      const e = { parameter: { action: 'getItems', token: 'view-123' } };
      const response = doGet(e);
      const result = JSON.parse(response as any);
      expect(result.success).toBe(true);
      expect(result.mode).toBe('viewer');
      expect(result.data).toHaveLength(1); // Real items
    });

    it('should return empty list and viewer mode if token is invalid (Obscured)', () => {
      const e = { parameter: { action: 'getItems', token: 'wrong-token' } };
      const response = doGet(e);
      const result = JSON.parse(response as any);
      expect(result.success).toBe(true);
      expect(result.mode).toBe('viewer');
      expect(result.data).toHaveLength(0); // Empty list
    });
  });
});
