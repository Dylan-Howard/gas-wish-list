import { config } from '../config';
import type { AppMode } from './types';

/**
 * Reads ?token=XXX from the URL and resolves the app mode.
 *
 * Share ?token=VIEW_TOKEN  → read-only viewer
 * Use  ?token=EDIT_TOKEN   → full editor (owner only)
 * No token / wrong token   → unauthorized
 */
export function getAppMode(): AppMode {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? '';

    if (!token) return 'unauthorized';
    if (token === config.editToken) return 'editor';
    if (token === config.viewToken) return 'viewer';
    return 'unauthorized';
  } catch {
    return 'unauthorized';
  }
}
