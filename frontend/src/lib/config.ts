/**
 * App configuration — all values come from .env at build time.
 */
export const config = {
  /** Google Apps Script Web App URL */
  gasUrl: (import.meta.env.VITE_GAS_URL as string) ?? '',

  /** View/Edit auth tokens */
  viewToken: (import.meta.env.VITE_VIEW_TOKEN as string) ?? '',
  editToken: (import.meta.env.VITE_EDIT_TOKEN as string) ?? '',

  /** Displayed in the header */
  appName: (import.meta.env.VITE_APP_NAME as string) ?? 'My Wish List',

  /** Subtitle shown beneath the app name */
  appSubtitle:
    (import.meta.env.VITE_APP_SUBTITLE as string) ??
    'A curated collection of things I love',
} as const;
