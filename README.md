# Wish List App

A clean, minimal wish list app. Viewers browse items, guests mark things as purchased, you manage everything via Google Sheets.

---

## Project Structure

- **`frontend/`**: Svelte 4 + Vite + TypeScript application.
- **`backend/`**: Google Apps Script (TypeScript) backend.
- **`bookmarklet/`**: Scraper script for adding items from any website.

---

## Setup

### 1. Backend (Google Apps Script)

1. Go to `backend/`.
2. Create a new Google Spreadsheet.
3. Open **Extensions → Apps Script**.
4. You can use `clasp` to push the code or manually copy the contents of `backend/src/Code.ts` (removing `export` keywords).
5. Deploy as a **Web App**:
   - Execute as: **Me**
   - Access: **Anyone**
6. Copy the Web App URL for the frontend config.

### 2. Frontend

1. Go to `frontend/`.
2. Copy `.env.example` to `.env` (in the root or frontend dir) and fill in:
   - `VITE_GAS_URL`: Your deployed Web App URL.
   - `VITE_VIEW_TOKEN`: A secret string for viewers.
   - `VITE_EDIT_TOKEN`: A secret string for editing.
3. Run `npm install` and `npm run dev`.

---

## Production Deployment (Quick Steps)

### 1. Backend (Google Apps Script)
1. **Prepare:** Run `npm install` in `backend/`.
2. **Push:** Run `npm run deploy` (requires `clasp login` and a valid `.clasp.json`).
3. **Configure:** In the Apps Script editor, go to **Project Settings** → **Script Properties** and add:
   - `VIEW_TOKEN`: Your secret viewer token.
   - `EDIT_TOKEN`: Your secret editor token.
4. **Deploy:** Click **Deploy** → **New Deployment** (Web App, Me, Anyone). Copy the URL.

### 2. Frontend (GitHub Pages)
1. **Prepare:** Run `npm install` in `frontend/`.
2. **Build:** Ensure `.env` contains `VITE_GAS_URL` (the Apps Script URL), `VITE_VIEW_TOKEN`, and `VITE_EDIT_TOKEN`.
3. **Generate:** Run `npm run build`. This creates a `dist/` folder.
4. **Publish:** Deploy the contents of `frontend/dist/` to your hosting provider (e.g., GitHub Pages).

---

## Access URLs

| Role | URL |
|------|-----|
| **Viewer** | `?token=YOUR_VIEW_TOKEN` OR `?viewToken=YOUR_VIEW_TOKEN` |
| **Editor** | `?token=YOUR_EDIT_TOKEN` OR `?editToken=YOUR_EDIT_TOKEN` |
| **Unauthorized** | (No token provided) |
