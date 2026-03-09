import { writable, derived } from 'svelte/store';
import type { WishItem, SortConfig, FilterConfig, ViewMode, AuthMode } from './types';
import { getAuthMode } from './auth';
import { api } from './api';

// ── Auth ────────────────────────────────────────────────────────────────────────
export const authMode = writable<AuthMode>(getAuthMode());

// ── Remote data ─────────────────────────────────────────────────────────────────
export const items   = writable<WishItem[]>([]);
export const loading = writable(false);
export const error   = writable<string | null>(null);

// ── Toasts ──────────────────────────────────────────────────────────────────────
export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const toasts = writable<ToastData[]>([]);

export function addToast(message: string, type: ToastData['type'] = 'info', duration = 4000) {
  const id = Math.random().toString(36).substring(2, 9);
  toasts.update((t) => [...t, { id, message, type, duration }]);
}

export function removeToast(id: string) {
  toasts.update((t) => t.filter((toast) => toast.id !== id));
}

// ── View preferences ─────────────────────────────────────────────────────────────
export const viewMode = writable<ViewMode>('grid');

export const filterConfig = writable<FilterConfig>({
  tags: [],
  showPurchased: false,
  search: '',
});

export const sortConfig = writable<SortConfig>({
  field: 'sortOrder',
  direction: 'asc',
});

// ── Derived stores ───────────────────────────────────────────────────────────────

/** All unique tags across all items, alphabetically sorted. */
export const allTags = derived(items, ($items) => {
  const set = new Set<string>();
  $items.forEach((i) => i.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
});

/** Items after applying filters and sort. */
export const filteredItems = derived(
  [items, filterConfig, sortConfig],
  ([$items, $filter, $sort]) => {
    let result = [...$items];

    // Purchased visibility
    if (!$filter.showPurchased) {
      result = result.filter((i) => !i.purchased);
    }

    // Tag filtering (AND logic — item must have ALL selected tags)
    if ($filter.tags.length > 0) {
      result = result.filter((i) =>
        $filter.tags.every((t) => i.tags.includes(t))
      );
    }

    // Full-text search on title + description
    const q = $filter.search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if ($sort.field === 'price') {
        aVal = a.price ?? Infinity;
        bVal = b.price ?? Infinity;
      } else {
        aVal = (a[$sort.field] as string | number) ?? '';
        bVal = (b[$sort.field] as string | number) ?? '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return $sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }
);

// ── Async actions ────────────────────────────────────────────────────────────────

export async function loadItems(): Promise<void> {
  loading.set(true);
  error.set(null);
  const result = await api.getItems();
  loading.set(false);

  if (result.success && result.data) {
    items.set(result.data);
  } else {
    error.set(result.error ?? 'Failed to load items. Please check your connection.');
  }
}

export async function markItemPurchased(id: string): Promise<void> {
  // Optimistic update
  items.update((list) =>
    list.map((i) => (i.id === id ? { ...i, purchased: true } : i))
  );

  const result = await api.markPurchased(id, true);
  if (!result.success) {
    // Revert on failure
    items.update((list) =>
      list.map((i) => (i.id === id ? { ...i, purchased: false } : i))
    );
    addToast(result.error ?? 'Failed to mark item as purchased', 'error');
  } else {
    addToast('Item marked as purchased', 'success');
  }
}

export async function saveItem(item: WishItem): Promise<boolean> {
  const result = await api.saveItem(item);
  if (result.success) {
    items.update((list) => {
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = item;
        return updated;
      }
      return [...list, item];
    });
    addToast('Item saved successfully', 'success');
    return true;
  }
  addToast(result.error ?? 'Failed to save item', 'error');
  return false;
}

export async function deleteItem(id: string): Promise<boolean> {
  const result = await api.deleteItem(id);
  if (result.success) {
    items.update((list) => list.filter((i) => i.id !== id));
    addToast('Item deleted', 'info');
    return true;
  }
  addToast(result.error ?? 'Failed to delete item', 'error');
  return false;
}
