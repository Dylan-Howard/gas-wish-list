/**
 * Bookmarklet Build Script
 * ────────────────────────
 * Reads .env (or process.env), replaces __GAS_URL__ / __EDIT_TOKEN__ placeholders,
 * minifies with esbuild, then writes:
 *   - public/bookmarklet-install.html   (drag-to-bookmarks install page)
 *   - bookmarklet/bookmarklet.min.js    (minified source for inspection)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

// ── Load .env ─────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(ROOT, '.env'), 'utf8');
    raw.split('\n').forEach((line) => {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim();
    });
  } catch {
    // .env not required — fall back to process.env only
  }
  return env;
}

const env = loadEnv();

const GAS_URL    = env.VITE_GAS_URL    || '';
const EDIT_TOKEN = env.VITE_EDIT_TOKEN || '';
const APP_NAME   = env.VITE_APP_NAME   || 'My Wish List';

if (!GAS_URL)    console.warn('[bookmarklet] ⚠  VITE_GAS_URL is not set  — bookmarklet will not be able to save items');
if (!EDIT_TOKEN) console.warn('[bookmarklet] ⚠  VITE_EDIT_TOKEN is not set — bookmarklet will submit without a token');

// ── Inject config into source ────────────────────────────────────────────────
const src = readFileSync(resolve(__dirname, 'bookmarklet.src.js'), 'utf8')
  .replace(/__GAS_URL__/g,    GAS_URL)
  .replace(/__EDIT_TOKEN__/g, EDIT_TOKEN);

const tmpSrc = resolve(__dirname, '_tmp.js');
writeFileSync(tmpSrc, src);

// ── Minify with esbuild ────────────────────────────────────────────────────────
const result = await build({
  entryPoints: [tmpSrc],
  bundle:      false,
  minify:      true,
  format:      'iife',
  write:       false,
  platform:    'browser',
  target:      'es2017',
});

import { unlinkSync } from 'fs';
unlinkSync(tmpSrc);

const minified = result.outputFiles[0].text.trim();

// ── Write minified source ──────────────────────────────────────────────────────
writeFileSync(resolve(__dirname, 'bookmarklet.min.js'), minified, 'utf8');
console.log('[bookmarklet] Wrote bookmarklet/bookmarklet.min.js (' + minified.length + ' bytes)');

// ── Build javascript: URL ──────────────────────────────────────────────────────
// Strip the IIFE wrapper added by esbuild (it wraps our own IIFE)
// The output is already an IIFE so we encode as-is
const bookmarkletHref = 'javascript:' + encodeURIComponent(minified);

// ── Generate install page ──────────────────────────────────────────────────────
mkdirSync(resolve(ROOT, 'public'), { recursive: true });

const installHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
  <title>Install Bookmarklet — ${APP_NAME}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', system-ui, sans-serif;
      background: #FAFAF8;
      color: #1C1C1A;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      background: #fff;
      border: 1px solid #E8E8E4;
      border-radius: 16px;
      padding: 48px 44px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .icon {
      width: 52px; height: 52px;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      font-size: 24px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px; font-weight: 500;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 15px; color: #737370;
      line-height: 1.6; margin-bottom: 32px;
    }

    /* Bookmarklet link button */
    .bookmarklet-link {
      display: block;
      background: #1C1C1A;
      color: #fff;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      text-align: center;
      cursor: grab;
      transition: background 0.15s;
      margin-bottom: 14px;
      border: 2px dashed transparent;
      user-select: none;
    }
    .bookmarklet-link:hover {
      background: #333;
    }
    .bookmarklet-link:active {
      cursor: grabbing;
    }

    .drag-hint {
      font-size: 13px;
      color: #A8A8A4;
      text-align: center;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }

    .step {
      display: flex; gap: 12px; align-items: flex-start;
    }

    .step-num {
      width: 24px; height: 24px;
      background: #F3F3F0; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      color: #737370; flex-shrink: 0; margin-top: 1px;
    }

    .step-text { font-size: 14px; color: #737370; line-height: 1.5; }
    .step-text strong { color: #1C1C1A; font-weight: 500; }

    .divider {
      border: none; border-top: 1px solid #E8E8E4;
      margin: 28px 0;
    }

    .usage-title {
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: #A8A8A4; margin-bottom: 12px;
    }

    .usage-list { display: flex; flex-direction: column; gap: 8px; }

    .usage-item {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 13.5px; color: #737370; line-height: 1.5;
    }

    .usage-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #D97706; flex-shrink: 0; margin-top: 7px;
    }

    @media (max-width: 560px) {
      .card { padding: 32px 24px; }
      h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⭐</div>
    <h1>Quick-Add Bookmarklet</h1>
    <p class="subtitle">
      Save any product to <strong>${APP_NAME}</strong> in seconds — straight from
      Amazon, any shop, or any page with a product image.
    </p>

    <!-- THE BOOKMARKLET LINK — users drag this to their bookmarks bar -->
    <a class="bookmarklet-link" href="${bookmarkletHref}" onclick="return false;">
      ⭐ Add to ${APP_NAME}
    </a>

    <p class="drag-hint">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1v12M7 1L4 4M7 1l3 3M1 7h12M1 7l3-3M1 7l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Drag the button above to your bookmarks bar
    </p>

    <div class="steps">
      <div class="step">
        <span class="step-num">1</span>
        <p class="step-text">
          <strong>Show your bookmarks bar</strong> — in Chrome: <kbd>⌘⇧B</kbd> &nbsp;/&nbsp; Firefox: <kbd>⌘⇧B</kbd>
        </p>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <p class="step-text">
          <strong>Drag the button above</strong> to your bookmarks bar and drop it there.
        </p>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <p class="step-text">
          <strong>On any product page</strong>, click the bookmark — a panel slides in with everything pre-filled.
        </p>
      </div>
    </div>

    <hr class="divider">

    <p class="usage-title">What gets auto-filled</p>
    <div class="usage-list">
      <div class="usage-item"><span class="usage-dot"></span>Product title, description, and link from the page</div>
      <div class="usage-item"><span class="usage-dot"></span>Price extracted from Open Graph tags, JSON-LD, or Amazon price elements</div>
      <div class="usage-item"><span class="usage-dot"></span>All product images shown as a thumbnail grid — click to choose one</div>
      <div class="usage-item"><span class="usage-dot"></span>Clicking the bookmark again closes and removes the panel</div>
    </div>
  </div>
</body>
</html>`;

writeFileSync(resolve(ROOT, 'public', 'bookmarklet-install.html'), installHtml, 'utf8');
console.log('[bookmarklet] Wrote public/bookmarklet-install.html');
console.log('[bookmarklet] Done ✓');
