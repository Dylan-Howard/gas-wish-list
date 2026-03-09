import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMode, loadItems, items, toasts, addToast, removeToast } from './stores';
import { api } from './api';
import { get } from 'svelte/store';

vi.mock('./api', () => ({
  api: {
    getItems: vi.fn(),
  },
}));

describe('Frontend Stores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMode.set('unauthorized');
    items.set([]);
    toasts.set([]);
  });

  describe('Toasts', () => {
    it('should add a toast', () => {
      addToast('Test message', 'success');
      const currentToasts = get(toasts);
      expect(currentToasts).toHaveLength(1);
      expect(currentToasts[0].message).toBe('Test message');
      expect(currentToasts[0].type).toBe('success');
      expect(currentToasts[0].id).toBeDefined();
    });

    it('should remove a toast', () => {
      addToast('Test message');
      const id = get(toasts)[0].id;
      removeToast(id);
      expect(get(toasts)).toHaveLength(0);
    });
  });

  it('should initialize as unauthorized', () => {
    expect(get(authMode)).toBe('unauthorized');
  });

  it('should update authMode to editor upon successful editor response', async () => {
    (api.getItems as any).mockResolvedValue({
      success: true,
      data: [{ id: '1', title: 'Test' }],
      mode: 'editor',
    });

    await loadItems();

    expect(get(authMode)).toBe('editor');
    expect(get(items)).toHaveLength(1);
  });

  it('should update authMode to viewer upon successful viewer response', async () => {
    (api.getItems as any).mockResolvedValue({
      success: true,
      data: [{ id: '1', title: 'Test' }],
      mode: 'viewer',
    });

    await loadItems();

    expect(get(authMode)).toBe('viewer');
  });

  it('should handle obscured authentication (invalid token)', async () => {
    // Backend returns success: true, mode: viewer, data: [] for invalid tokens
    (api.getItems as any).mockResolvedValue({
      success: true,
      data: [],
      mode: 'viewer',
    });

    await loadItems();

    expect(get(authMode)).toBe('viewer');
    expect(get(items)).toHaveLength(0);
  });

  it('should remain unauthorized if API returns explicit error', async () => {
    (api.getItems as any).mockResolvedValue({
      success: false,
      error: 'Unauthorized',
    });

    await loadItems();

    expect(get(authMode)).toBe('unauthorized');
  });
});
