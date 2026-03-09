import { writable, derived } from 'svelte/store';
import type { WishItem, SortConfig, FilterConfig, ViewMode, AuthMode, Toast } from './types';
import { api } from './api';

// ── Auth ────────────────────────────────────────────────────────────────────────
/** Initial mode is unauthorized until backend verifies the token. */
export const authMode = writable<AuthMode>('unauthorized');

// ── Remote data ─────────────────────────────────────────────────────────────────
export const items   = writable<WishItem[]>([]);
export const loading = writable(false);
export const error   = writable<string | null>(null);

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

// ── Toasts ──────────────────────────────────────────────────────────────────────
export const toasts = writable<Toast[]>([]);

export function addToast(message: string, type: Toast['type'] = 'info', duration = 3000): void {
  const id = Math.random().toString(36).substring(2, 9);
  toasts.update((all) => [...all, { id, message, type, duration }]);
}

export function removeToast(id: string): void {
  toasts.update((all) => all.filter((t) => t.id !== id));
}

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aVal = (a as any)[$sort.field] ?? '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bVal = (b as any)[$sort.field] ?? '';
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

  if (result.success) {
    if (result.mode) {
      authMode.set(result.mode);
    }
    if (result.data) {
      items.set(result.data);
    }
  } else {
    const msg = result.error ?? 'Failed to load items';
    error.set(msg);
    if (msg === 'Unauthorized') {
      authMode.set('unauthorized');
    }
  }
}

export async function markItemPurchased(id: string): Promise<void> {
  let previous: WishItem | null = null;
  items.update((list) =>
    list.map((i) => {
      if (i.id !== id) return i;
      previous = i;
      return { ...i, purchased: true };
    })
  );

  const result = await api.markPurchased(id, true);
  if (!result.success) {
    // Revert on failure
    if (previous) {
      items.update((list) =>
        list.map((i) => (i.id === id ? previous as WishItem : i))
      );
    }
    addToast(result.error ?? 'Failed to mark item as purchased', 'error');
  }
}

export async function saveItem(item: WishItem): Promise<boolean> {
  let previous: WishItem[] = [];
  items.update((list) => {
    previous = [...list];
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      const updated = [...list];
      updated[idx] = item;
      return updated;
    }
    return [...list, item];
  });

  const result = await api.saveItem(item);
  if (result.success) {
    return true;
  }
  items.set(previous);
  addToast(result.error ?? 'Failed to save item', 'error');
  return false;
}

export async function deleteItem(id: string): Promise<boolean> {
  let previous: WishItem[] = [];
  items.update((list) => {
    previous = [...list];
    return list.filter((i) => i.id !== id);
  });

  const result = await api.deleteItem(id);
  if (result.success) {
    return true;
  }
  items.set(previous);
  addToast(result.error ?? 'Failed to delete item', 'error');
  return false;
}
