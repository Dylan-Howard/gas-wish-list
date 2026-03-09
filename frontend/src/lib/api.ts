import { config } from './config';
import { getActiveToken } from './auth';
import type { WishItem, ApiResponse } from './types';

// ── Dev mock data (used when VITE_GAS_URL is not set) ──────────────────────────
const MOCK_ITEMS: WishItem[] = [
  {
    id: 'mock-1',
    title: 'AirPods Pro (2nd Gen)',
    description:
      'Active noise cancellation, Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.',
    imageUrl:
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
    link: 'https://apple.com/airpods-pro',
    price: 249,
    tags: ['tech', 'audio'],
    purchased: false,
    createdAt: new Date('2024-11-01').toISOString(),
    sortOrder: 0,
  },
  {
    id: 'mock-2',
    title: 'French Linen Duvet Cover',
    description:
      'Pure stonewashed French linen. Gets softer with every wash. Available in a warm palette of earth tones.',
    imageUrl:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    link: 'https://example.com/linen-duvet',
    price: 185,
    tags: ['home', 'bedroom', 'linen'],
    purchased: false,
    createdAt: new Date('2024-11-05').toISOString(),
    sortOrder: 1,
  },
  {
    id: 'mock-3',
    title: 'The Art of Simple Food',
    description:
      "Alice Waters' timeless guide to cooking with the freshest seasonal ingredients. A genuine kitchen staple.",
    imageUrl:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    link: 'https://example.com/book',
    tags: ['books', 'cooking'],
    purchased: false,
    createdAt: new Date('2024-11-10').toISOString(),
    sortOrder: 2,
  },
  {
    id: 'mock-4',
    title: 'Aesop Resurrection Aromatique Hand Balm',
    description:
      'A rich, fast-absorbing hand balm with mandarin rind and rosemary leaf for intensely nourished hands.',
    imageUrl:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
    link: 'https://example.com/aesop',
    price: 45,
    tags: ['beauty', 'skincare'],
    purchased: false,
    createdAt: new Date('2024-11-15').toISOString(),
    sortOrder: 3,
  },
];

// ── HTTP helpers ────────────────────────────────────────────────────────────────
async function gasGet<T>(action: string): Promise<ApiResponse<T>> {
  try {
    const url = new URL(config.gasUrl);
    url.searchParams.set('action', action);
    url.searchParams.set('token', getActiveToken());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err) {
    console.error('[API Error]', err);
    let message = 'An unexpected error occurred';
    if (err instanceof TypeError && err.message.includes('fetch')) {
      message = 'Network error. Please check your internet connection.';
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

async function gasPost<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(config.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action,
        token: getActiveToken(),
        ...payload
      }),
    });
    if (!res.ok) throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err) {
    console.error('[API Error]', err);
    let message = 'An unexpected error occurred';
    if (err instanceof TypeError && err.message.includes('fetch')) {
      message = 'Network error. Please check your internet connection.';
    } else if (err instanceof Error) {
      message = err.message;
    }
    return { success: false, error: message };
  }
}

// ── Public API ──────────────────────────────────────────────────────────────────
export const api = {
  async getItems(): Promise<ApiResponse<WishItem[]>> {
    if (!config.gasUrl) {
      console.info('[dev] Using mock data — set VITE_GAS_URL to use Google Sheets');
      return { success: true, data: MOCK_ITEMS };
    }
    return gasGet<WishItem[]>('getItems');
  },

  async saveItem(item: WishItem): Promise<ApiResponse<void>> {
    if (!config.gasUrl) {
      console.info('[dev] saveItem', item);
      return { success: true };
    }
    return gasPost<void>('saveItem', { data: item });
  },

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    if (!config.gasUrl) {
      console.info('[dev] deleteItem', id);
      return { success: true };
    }
    return gasPost<void>('deleteItem', { id });
  },

  async markPurchased(id: string, purchased: boolean): Promise<ApiResponse<void>> {
    if (!config.gasUrl) {
      console.info('[dev] markPurchased', id, purchased);
      return { success: true };
    }
    return gasPost<void>('markPurchased', { id, purchased });
  },
};
