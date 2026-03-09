import { config } from '../config';
import type { WishItem, GasResponse } from './types';

// ─── google.script.run type declarations ─────────────────────────────────────

declare global {
  interface Window {
    google?: {
      script: {
        run: GoogleScriptRun;
      };
    };
  }
}

interface GoogleScriptRun {
  withSuccessHandler(fn: (result: unknown) => void): GoogleScriptRun;
  withFailureHandler(fn: (error: { message: string }) => void): GoogleScriptRun;
  getItems(): void;
  saveItem(item: WishItem): void;
  deleteItem(id: string): void;
  markPurchased(id: string): void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isGasContext(): boolean {
  return typeof window !== 'undefined'
    && typeof window.google !== 'undefined'
    && !!window.google?.script?.run;
}

/** Wraps google.script.run in a promise. */
function gasRun<T>(method: keyof GoogleScriptRun, ...args: unknown[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const runner = window.google!.script.run
      .withSuccessHandler((result: unknown) => resolve(result as T))
      .withFailureHandler((err: { message: string }) => reject(new Error(err.message)));

    // Dynamically invoke the named GAS function
    (runner[method] as (...a: unknown[]) => void)(...args);
  });
}

/** Fetch-based fallback for development / external CORS-enabled GAS. */
async function fetchGas<T>(action: string, body?: Record<string, unknown>): Promise<T> {
  if (body) {
    const res = await fetch(config.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: GasResponse<T> = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Unknown error');
    return json.data as T;
  } else {
    const url = new URL(config.gasUrl);
    url.searchParams.set('action', action);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: GasResponse<T> = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Unknown error');
    return json.data as T;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  /** Fetch all wish list items from the Google Sheet. */
  async getItems(): Promise<WishItem[]> {
    if (isGasContext()) {
      return gasRun<WishItem[]>('getItems');
    }
    return fetchGas<WishItem[]>('getItems');
  },

  /** Create or update an item (upsert by id). */
  async saveItem(item: WishItem): Promise<WishItem> {
    if (isGasContext()) {
      return gasRun<WishItem>('saveItem', item);
    }
    return fetchGas<WishItem>('saveItem', { item });
  },

  /** Delete an item by id. */
  async deleteItem(id: string): Promise<void> {
    if (isGasContext()) {
      return gasRun<void>('deleteItem', id);
    }
    return fetchGas<void>('deleteItem', { id });
  },

  /** Mark an item as purchased (removes it from the active list). */
  async markPurchased(id: string): Promise<void> {
    if (isGasContext()) {
      return gasRun<void>('markPurchased', id);
    }
    return fetchGas<void>('markPurchased', { id });
  },
};
