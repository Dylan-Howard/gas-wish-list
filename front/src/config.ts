/**
 * ┌────────────────────────────────────────────────┐
 *  CONFIGURE BEFORE DEPLOYING
 *  See README.md for full setup instructions.
 * └────────────────────────────────────────────────┘
 */
export const config = {
  /**
   * Your published Google Apps Script Web App URL.
   * Deploy → Manage deployments → copy the Web App URL.
   */
  gasUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',

  /**
   * Share the view token URL with friends/family:
   *   https://your-gas-url?token=YOUR_VIEW_TOKEN
   *
   * Keep the edit token private — only for the list owner:
   *   https://your-gas-url?token=YOUR_EDIT_TOKEN
   */
  viewToken: 'YOUR_VIEW_TOKEN',
  editToken: 'YOUR_EDIT_TOKEN',

  /** Display name shown in the header. */
  listTitle: "My Wish List",
  listOwner: "Your Name",

  /** ISO 4217 default currency code. */
  defaultCurrency: 'USD',
} as const;
