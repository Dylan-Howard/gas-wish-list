# Wish List App

A clean, minimal wish list app built with Svelte + TypeScript, backed by Google Sheets, deployable on Google Apps Script.

---

## Project Structure

```
src/
├── config.ts                  ← 🔧 Configure before deploying
├── App.svelte                 ← Auth guard + page router
├── lib/
│   ├── types.ts               ← TypeScript interfaces
│   ├── auth.ts                ← URL token → viewer/editor/unauthorized
│   ├── api.ts                 ← google.script.run wrapper
│   ├── store.ts               ← Svelte stores + derived state
│   └── utils.ts               ← Tag colors, price format, ID gen
├── components/
│   ├── ui/
│   │   ├── Button.svelte
│   │   ├── TagBadge.svelte
│   │   ├── LoadingSpinner.svelte
│   │   ├── EmptyState.svelte
│   │   ├── ConfirmDialog.svelte
│   │   └── ToastContainer.svelte
│   ├── viewer/
│   │   ├── LayoutToggle.svelte
│   │   ├── TagFilter.svelte
│   │   ├── SortControl.svelte
│   │   ├── WishItemCard.svelte     ← Grid card
│   │   └── WishItemRow.svelte      ← List row
│   └── editor/
│       ├── TagInput.svelte
│       ├── ItemFormModal.svelte
│       └── EditorItemCard.svelte
└── pages/
    ├── ViewerPage.svelte
    ├── EditorPage.svelte
    └── UnauthorizedPage.svelte
gas/
└── Code.gs                    ← Google Apps Script backend
```

---

## Auth Model

| URL                             | Mode         | Can do                        |
|---------------------------------|--------------|-------------------------------|
| `?token=YOUR_VIEW_TOKEN`        | **Viewer**   | Browse, filter, mark purchased|
| `?token=YOUR_EDIT_TOKEN`        | **Editor**   | Add, edit, delete items       |
| (no token / wrong token)        | Unauthorized | Locked page                   |

---

## Setup & Deployment

### 1. Configure `src/config.ts`

Choose two random secret strings for your tokens (e.g. use `openssl rand -hex 16`):

```ts
export const config = {
  gasUrl:    'https://script.google.com/macros/s/YOUR_ID/exec',
  viewToken: 'abc123yourviewtoken',
  editToken: 'xyz789youredittoken',
  listTitle: 'My Birthday Wish List',
  listOwner: 'Alex',
  defaultCurrency: 'USD',
};
```

### 2. Create the Google Sheet

1. Create a new Google Sheet.
2. Rename the first tab to `Items`.
3. Add these headers in row 1:

   `id | title | description | imageUrl | link | price | currency | tags | purchased | createdAt | updatedAt`

### 3. Set up Google Apps Script

1. In the Sheet: **Extensions → Apps Script**
2. Replace any existing code with the contents of `gas/Code.gs`
3. Go to **Project Settings → Script Properties** and add:

   | Property         | Value                        |
   |------------------|------------------------------|
   | `SPREADSHEET_ID` | Your Sheet's ID (from URL)   |
   | `SHEET_NAME`     | `Items`                      |
   | `VIEW_TOKEN`     | Your chosen view token       |
   | `EDIT_TOKEN`     | Your chosen edit token       |

### 4. Build the Svelte App

```bash
npm install
npm run build
```

This generates `dist/index.html` — a single self-contained HTML file.

### 5. Deploy to Apps Script

1. In Apps Script editor: **+ New file → HTML**, name it `index` (no extension)
2. Delete the placeholder content
3. Paste the entire contents of `dist/index.html`
4. **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL back into `src/config.ts` → `gasUrl`
6. Rebuild (`npm run build`) and update the `index.html` file in Apps Script

### 6. Share

- **Viewer link** (share with friends/family):
  `https://script.google.com/macros/s/YOUR_ID/exec?token=YOUR_VIEW_TOKEN`

- **Editor link** (keep private — you only):
  `https://script.google.com/macros/s/YOUR_ID/exec?token=YOUR_EDIT_TOKEN`

---

## Development

```bash
npm run dev     # Vite dev server at http://localhost:5173
                # Add ?token=YOUR_VIEW_TOKEN or ?token=YOUR_EDIT_TOKEN to the URL
```

In dev mode, `api.ts` falls back to `fetch()` against the GAS URL — make sure CORS is allowed or use mock data.

---

## Design Tokens

| Token              | Value      | Usage                         |
|--------------------|------------|-------------------------------|
| `--font-display`   | Cormorant Garamond | Page title, item titles |
| `--font-ui`        | Outfit     | All UI text                   |
| `--c-accent`       | `#1B4332`  | Primary actions, prices       |
| `--c-bg`           | `#F8F8F6`  | Page background               |
| `--c-surface`      | `#FFFFFF`  | Cards, modals                 |
| `--c-border`       | `#E4E4E0`  | Default borders               |
| `--c-danger`       | `#B83232`  | Destructive actions           |

Tag colors are deterministically assigned from an 8-color palette via `getTagColor(tag)` in `src/lib/utils.ts`.
