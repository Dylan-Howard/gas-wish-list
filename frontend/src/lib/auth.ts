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
