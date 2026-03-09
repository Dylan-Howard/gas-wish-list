import { config } from './config';
import type { AuthMode } from './types';

/**
 * Reads URL params on page load and returns the current auth mode.
 *
 * View-only:  ?viewToken=<token>
 * Editor:     ?editToken=<token>
 * Denied:     (no valid token)
 */
export function getAuthMode(): AuthMode {
  const params = new URLSearchParams(window.location.search);

  const editToken = params.get('editToken');
  if (editToken && editToken === config.editToken) return 'editor';

  const viewToken = params.get('viewToken');
  if (viewToken && viewToken === config.viewToken) return 'viewer';

  return 'unauthorized';
}
