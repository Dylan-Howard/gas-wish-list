import { config } from './config';
import type { AuthMode } from './types';

/**
 * Reads URL params on page load and returns the current auth mode.
 *
 * View-only:  ?viewToken=<token> OR ?token=<VIEW_TOKEN>
 * Editor:     ?editToken=<token> OR ?token=<EDIT_TOKEN>
 * Denied:     (no valid token)
 */
export function getAuthMode(): AuthMode {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const editToken = params.get('editToken');
  const viewToken = params.get('viewToken');

  if (import.meta.env.DEV) {
    console.info('[Auth Debug] URL Token:', token);
    console.info('[Auth Debug] Config View Token:', config.viewToken);
    console.info('[Auth Debug] Config Edit Token:', config.editToken);
  }

  // Check for Editor access
  if ((editToken && editToken === config.editToken) || (token && token === config.editToken)) {
    return 'editor';
  }

  // Check for Viewer access
  if ((viewToken && viewToken === config.viewToken) || (token && token === config.viewToken)) {
    return 'viewer';
  }

  return 'unauthorized';
}

/**
 * Returns the raw token from the URL (if any).
 */
export function getActiveToken(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || params.get('viewToken') || params.get('editToken') || '';
}

