import { writable, derived } from 'svelte/store';
import type {
  WishItem,
  SortConfig,
  FilterConfig,
  LayoutMode,
  ToastMessage,
  ToastType,
} from './types';
import { generateId } from './utils';

// ─── Data ────────────────────────────────────────────────────────────────────

export const items = writable<WishItem[]>([]);
export const isLoading = writable<boolean>(false);
export const loadError = writable<string | null>(null);

// ─── UI State ─────────────────────────────────────────────────────────────────

export const sortConfig = writable<SortConfig>({
  field: 'createdAt',
  direction: 'desc',
});

export const filterConfig = writable<FilterConfig>({
  tags: [],
  showPurchased: false,
  search: '',
});

export const layout = writable<LayoutMode>('grid');

// ─── Derived: all tags from items ────────────────────────────────────────────

export const allTags = derived(items, ($items) => {
  const set = new Set<string>();
  $items.forEach(item => item.tags.forEach(tag => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

// ─── Derived: filtered + sorted items ────────────────────────────────────────

export const displayItems = derived(
  [items, sortConfig, filterConfig],
  ([$items, $sort, $filter]) => {
    let result = $items.filter((item) => {
      // Purchased filter
      if (!$filter.showPurchased && item.purchased) return false;

      // Tag filter (all selected tags must be present)
      if ($filter.tags.length > 0) {
        const hasAll = $filter.tags.every(tag => item.tags.includes(tag));
        if (!hasAll) return false;
      }

      // Search filter
      if ($filter.search.trim()) {
        const q = $filter.search.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inTags = item.tags.some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch ($sort.field) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'price': {
          const pa = a.price ?? Infinity;
          const pb = b.price ?? Infinity;
          cmp = pa - pb;
          break;
        }
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return $sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }
);

// ─── Toasts ──────────────────────────────────────────────────────────────────

export const toasts = writable<ToastMessage[]>([]);

export function addToast(message: string, type: ToastType = 'info', duration = 3500): void {
  const id = generateId();
  toasts.update(t => [...t, { id, message, type }]);
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id: string): void {
  toasts.update(t => t.filter(toast => toast.id !== id));
}
