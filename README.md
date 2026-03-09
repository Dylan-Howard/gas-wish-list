# Wish List App

A clean, minimal wish list app. Viewers browse items, guests mark things as purchased, you manage everything via Google Sheets.

**Live at:** `wishlist.dylanlhoward.com`

---

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Svelte 4 + Vite + TypeScript |
| Hosting  | GitHub Pages (custom subdomain) |
| Backend  | Google Apps Script Web App |
| Database | Google Sheets |

---

## Setup

### 1. Google Sheets + Apps Script backend

1. Create a new Google Spreadsheet (any name).
2. Open **Extensions → Apps Script**.
3. Delete the default `myFunction` code and paste in the contents of `gas/Code.gs`.
4. Click **Deploy → New deployment**:
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL — you'll need it as `VITE_GAS_URL`.

> The sheet named `WishList` is auto-created on the first request. You can edit rows directly in Sheets any time.

### 2. GitHub repository secrets

In your repo: **Settings → Secrets and variables → Actions**

Add these **Secrets**:
| Secret | Value |
|--------|-------|
| `VITE_GAS_URL` | Your GAS Web App URL |
| `VITE_VIEW_TOKEN` | Any secret string (e.g. `summer-2025`) |
| `VITE_EDIT_TOKEN` | A different secret string (e.g. `edit-abc123`) |

Add these **Variables** (not secret):
| Variable | Value |
|----------|-------|
| `VITE_APP_NAME` | e.g. `Dylan's Wish List` |
| `VITE_APP_SUBTITLE` | e.g. `A curated collection of things I love` |

### 3. Enable GitHub Pages

In your repo: **Settings → Pages**
- Source: **GitHub Actions**

### 4. Custom subdomain DNS

At your domain registrar (wherever `dylanlhoward.com` is managed), add:

| Type | Host | Value |
|------|------|-------|
| `CNAME` | `wishlist` | `<yourgithubusername>.github.io` |

DNS propagation takes 5–30 minutes. GitHub will automatically provision an HTTPS certificate.

### 5. Deploy

Push to `main` — GitHub Actions builds and deploys automatically.

---

## Access URLs

| Role | URL |
|------|-----|
| **Viewer** (friends/family) | `https://wishlist.dylanlhoward.com?viewToken=your-view-token` |
| **Editor** (you) | `https://wishlist.dylanlhoward.com?editToken=your-edit-token` |
| **Unauthorized** | `https://wishlist.dylanlhoward.com` (shows lock screen) |

---

## Local development

```bash
cp .env.example .env
# fill in your .env values

npm install
npm run dev
```

In dev mode with no `VITE_GAS_URL` set, the app uses built-in mock data automatically.

---

## Project structure

```
src/
├── app.css              # Design tokens + global reset
├── main.ts              # Entry point
├── App.svelte           # Root — auth routing
├── lib/
│   ├── types.ts         # TypeScript interfaces
│   ├── config.ts        # Env var config
│   ├── auth.ts          # URL token auth
│   ├── api.ts           # GAS API client (with dev mock)
│   ├── stores.ts        # Svelte stores + async actions
│   └── utils.ts         # Tag colors, price format, etc.
├── components/
│   ├── ui/              # Primitives: Button, Badge, Dialog, Input, Toggle, Spinner
│   ├── layout/          # Header, UnauthorizedPage
│   ├── viewer/          # ViewerPage, WishCard, WishRow, TagFilter, SortControl, SearchBar, PurchaseDialog
│   └── editor/          # EditorPage, EditorRow, ItemForm, TagInput, DeleteDialog
gas/
└── Code.gs              # Google Apps Script backend
public/
└── CNAME                # Custom domain for GitHub Pages
.github/
└── workflows/
    └── deploy.yml       # CI/CD pipeline
```

---

## Bookmarklet (Quick-Add from any product page)

After building the app, a drag-to-install page is generated at `wishlist.dylanlhoward.com/bookmarklet-install.html`.

**How it works:**
1. Navigate to `wishlist.dylanlhoward.com/bookmarklet-install.html`
2. Drag the "⭐ Add to Wish List" button to your bookmarks bar
3. On any Amazon listing (or any product page), click the bookmark
4. A panel slides in from the right with auto-filled title, description, price, and a thumbnail grid to pick an image
5. Adjust anything, add tags, hit **Add to list** — done

**What gets scraped:**
- Title — Open Graph, Twitter Card, Amazon `#productTitle`, or `<h1>`
- Description — OG description, Amazon feature bullets, meta description
- Price — JSON-LD structured data, OG price, Amazon `.a-price` elements
- Images — OG image, all large images on the page; Amazon gallery images are de-thumbnailed to full-res automatically

**Build the bookmarklet separately:**
```bash
npm run build:bookmarklet
```
This reads your `.env`, injects `VITE_GAS_URL` and `VITE_EDIT_TOKEN`, minifies the source, and writes `public/bookmarklet-install.html`. The full `npm run build` runs this automatically first.

---

## GAS TypeScript + clasp

The backend is now fully typed TypeScript. To use clasp:

```bash
npm install                  # installs @claspjs/clasp and @types/google-apps-script
npm run gas:login            # authenticate once
# Set your scriptId in .clasp.json
npm run gas:push             # compile + push Code.ts to GAS
npm run gas:deploy           # publish a new Web App deployment
npm run gas:open             # open project in browser to copy exec URL
```

Set server-side token validation by adding Script Properties in your GAS project:
- `VIEW_TOKEN` → same value as `VITE_VIEW_TOKEN`
- `EDIT_TOKEN` → same value as `VITE_EDIT_TOKEN`
