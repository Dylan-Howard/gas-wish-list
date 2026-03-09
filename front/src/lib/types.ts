// ─── Domain ──────────────────────────────────────────────────────────────────

export interface WishItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  price?: number;
  currency: string;
  tags: string[];
  purchased: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type WishItemDraft = Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'purchased'>;

// ─── UI State ─────────────────────────────────────────────────────────────────

export type SortField = 'title' | 'price' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  tags: string[];
  showPurchased: boolean;
  search: string;
}

export type LayoutMode = 'grid' | 'list';

export type AppMode = 'viewer' | 'editor' | 'unauthorized' | 'loading';

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface GasResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
