/**
 * App configuration — all values come from .env at build time.
 * Copy .env.example → .env and fill in your values before running `npm run build`.
 */
export const config = {
  /** Google Apps Script Web App URL */
  gasUrl: (import.meta.env.VITE_GAS_URL as string) ?? '',

  /** URL token that grants view-only access */
  viewToken: (import.meta.env.VITE_VIEW_TOKEN as string) ?? 'view-token',

  /** URL token that grants editor access */
  editToken: (import.meta.env.VITE_EDIT_TOKEN as string) ?? 'edit-token',

  /** Displayed in the header */
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'My Wish List',

  /** Subtitle shown beneath the app name */
  appSubtitle:
    (import.meta.env.VITE_APP_SUBTITLE as string) ??
    'A curated collection of things I love',
} as const;
