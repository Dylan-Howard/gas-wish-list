export interface WishItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  price?: number;
  tags: string[];
  purchased: boolean;
  createdAt: string; // ISO date string
  sortOrder: number;
}

export type SortField = 'title' | 'price' | 'createdAt' | 'sortOrder';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export type ViewMode = 'grid' | 'list';
export type AuthMode = 'viewer' | 'editor' | 'unauthorized';

export interface FilterConfig {
  tags: string[];
  showPurchased: boolean;
  search: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}
