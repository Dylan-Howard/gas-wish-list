/**
 * Wish List Bookmarklet — Source
 * ══════════════════════════════
 * Build with: npm run build:bookmarklet
 *
 * Placeholders replaced at build time:
 *   __GAS_URL__    → VITE_GAS_URL from .env
 *   __EDIT_TOKEN__ → VITE_EDIT_TOKEN from .env
 *
 * Shadow DOM is used for full style isolation — nothing on the host page
 * is affected, and the host page's CSS cannot bleed into the panel.
 */

(function () {
  'use strict';

  // ── Config (replaced at build time) ────────────────────────────────────────
  var GAS_URL    = '__GAS_URL__';
  var EDIT_TOKEN = '__EDIT_TOKEN__';
  var HOST_ID    = '__wl_bookmarklet_host__';

  // ── Prevent double-injection ────────────────────────────────────────────────
  if (document.getElementById(HOST_ID)) {
    var existing = document.getElementById(HOST_ID);
    if (existing) existing.remove();
    return;
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  function uid() {
    return Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function metaContent(selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var val = el.getAttribute('content') || el.getAttribute('href') || el.textContent;
        if (val && val.trim()) return val.trim();
      }
    }
    return '';
  }

  function parsePrice(str) {
    if (!str) return '';
    var match = str.match(/[\d,]+\.?\d*/);
    return match ? match[0].replace(/,/g, '') : '';
  }

  // ── Page scraper ─────────────────────────────────────────────────────────────
  function scrapePage() {
    var result = {
      title:       '',
      description: '',
      imageUrl:    '',
      link:        '',
      price:       '',
      images:      [],
    };

    // ── URL ──────────────────────────────────────────────────────────────────
    result.link =
      metaContent(['link[rel="canonical"]', 'meta[property="og:url"]']) ||
      window.location.href;

    // ── Title ────────────────────────────────────────────────────────────────
    result.title =
      metaContent([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ]) ||
      // Amazon
      (document.getElementById('productTitle')
        ? document.getElementById('productTitle').textContent.trim()
        : '') ||
      // Generic h1
      (document.querySelector('h1')
        ? document.querySelector('h1').textContent.trim().slice(0, 120)
        : '') ||
      document.title.split(' - ')[0].split(' | ')[0].trim();

    // ── Description ──────────────────────────────────────────────────────────
    result.description =
      metaContent([
        'meta[property="og:description"]',
        'meta[name="description"]',
        'meta[name="twitter:description"]',
      ]) ||
      // Amazon feature bullets
      (document.querySelector('#feature-bullets ul')
        ? document.querySelector('#feature-bullets ul').innerText
            .split('\n')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s && s !== '\u200e'; })
            .slice(0, 3)
            .join(' · ')
        : '') ||
      // Amazon product description
      (document.querySelector('#productDescription p')
        ? document.querySelector('#productDescription p').textContent.trim().slice(0, 300)
        : '');

    // ── Price ─────────────────────────────────────────────────────────────────
    var rawPrice =
      // JSON-LD structured data
      (function () {
        var scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (var i = 0; i < scripts.length; i++) {
          try {
            var json = JSON.parse(scripts[i].textContent);
            var offers = json.offers || (json['@graph'] && json['@graph'].find(function(g){ return g.offers; }) && json['@graph'].find(function(g){ return g.offers; }).offers);
            if (offers) {
              var price = offers.price || (Array.isArray(offers) && offers[0] && offers[0].price);
              if (price) return String(price);
            }
          } catch (e) {}
        }
        return '';
      })() ||
      // Open Graph price
      metaContent(['meta[property="product:price:amount"]', 'meta[property="og:price:amount"]']) ||
      // Amazon
      (document.querySelector('.a-price .a-offscreen')
        ? document.querySelector('.a-price .a-offscreen').textContent
        : '') ||
      (document.querySelector('#priceblock_ourprice, #priceblock_dealprice, .apexPriceToPay .a-offscreen')
        ? document.querySelector('#priceblock_ourprice, #priceblock_dealprice, .apexPriceToPay .a-offscreen').textContent
        : '');

    result.price = parsePrice(rawPrice);

    // ── Images ────────────────────────────────────────────────────────────────
    var imageSet = [];
    var seen = {};

    function addImage(url) {
      if (!url || typeof url !== 'string') return;
      // Clean Amazon thumbnail URLs → full-size
      url = url
        .replace(/\._[A-Z0-9_,]+_\./g, '.')   // remove resize directives
        .replace(/\?.*$/, '');                   // strip query string
      if (!url.startsWith('http')) return;
      if (url.length < 10) return;
      if (seen[url]) return;
      seen[url] = true;
      imageSet.push(url);
    }

    // OG image first (highest priority)
    var ogImg = metaContent(['meta[property="og:image"]', 'meta[name="twitter:image"]']);
    if (ogImg) addImage(ogImg);

    // Amazon main image (high-res from data attribute)
    var landingImg = document.getElementById('landingImage') || document.getElementById('imgTagWrapperId img');
    if (landingImg) {
      addImage(
        landingImg.getAttribute('data-old-hires') ||
        landingImg.getAttribute('data-a-dynamic-image') && Object.keys(JSON.parse(landingImg.getAttribute('data-a-dynamic-image') || '{}')).pop() ||
        landingImg.src
      );
    }

    // Amazon alternate images
    var altImgs = document.querySelectorAll('#altImages .a-button-thumbnail img, #imageBlock .imgTagWrapper img');
    altImgs.forEach(function (img) {
      var src = img.getAttribute('data-old-hires') || img.src;
      addImage(src);
    });

    // Generic product images: look for large imgs on the page
    var allImgs = document.querySelectorAll('img');
    allImgs.forEach(function (img) {
      if (img.naturalWidth >= 300 || img.width >= 200) {
        addImage(img.getAttribute('data-src') || img.getAttribute('data-lazy') || img.src);
      }
    });

    result.images = imageSet.slice(0, 12);
    result.imageUrl = result.images[0] || '';

    return result;
  }

  // ── Shadow DOM + panel ───────────────────────────────────────────────────────
  var data     = scrapePage();
  var selected = data.imageUrl;
  var panelId  = 'panel';

  var host = document.createElement('div');
  host.id  = HOST_ID;
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    zIndex: '2147483647',
    display: 'block',
  });
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });

  // ── Styles (scoped inside Shadow DOM) ────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap");',

    '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',

    ':host { all: initial; }',

    '#panel {',
    '  position: fixed;',
    '  top: 0; right: 0; bottom: 0;',
    '  width: 400px;',
    '  background: #FAFAF8;',
    '  border-left: 1px solid #E8E8E4;',
    '  box-shadow: -8px 0 32px rgba(0,0,0,0.10);',
    '  display: flex; flex-direction: column;',
    '  font-family: "Outfit", system-ui, sans-serif;',
    '  font-size: 14px;',
    '  color: #1C1C1A;',
    '  transform: translateX(100%);',
    '  transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);',
    '  overflow: hidden;',
    '  z-index: 2147483647;',
    '}',

    '#panel.open { transform: translateX(0); }',

    '.header {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  padding: 16px 20px;',
    '  border-bottom: 1px solid #E8E8E4;',
    '  background: #fff;',
    '  flex-shrink: 0;',
    '}',

    '.header-title {',
    '  font-family: "Playfair Display", Georgia, serif;',
    '  font-size: 18px; font-weight: 500;',
    '  letter-spacing: -0.01em; color: #1C1C1A;',
    '}',

    '.close-btn {',
    '  width: 32px; height: 32px;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: #F3F3F0; border: none; border-radius: 8px;',
    '  cursor: pointer; color: #737370;',
    '  transition: background 0.12s, color 0.12s;',
    '}',
    '.close-btn:hover { background: #E8E8E4; color: #1C1C1A; }',

    '.body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }',

    '.section-label {',
    '  font-size: 11px; font-weight: 500; letter-spacing: 0.07em;',
    '  text-transform: uppercase; color: #A8A8A4; margin-bottom: 8px;',
    '}',

    /* Image picker */
    '.img-grid {',
    '  display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;',
    '}',

    '.img-opt {',
    '  aspect-ratio: 1; border-radius: 6px; overflow: hidden;',
    '  border: 2px solid transparent; cursor: pointer;',
    '  background: #E8E8E4; transition: border-color 0.12s;',
    '  padding: 0;',
    '}',
    '.img-opt img { width: 100%; height: 100%; object-fit: cover; display: block; }',
    '.img-opt.selected { border-color: #D97706; }',
    '.img-opt:hover { border-color: #D0D0CB; }',
    '.img-opt.selected:hover { border-color: #D97706; }',

    '.no-images { font-size: 12.5px; color: #A8A8A4; text-align: center; padding: 12px; }',

    /* Form fields */
    '.field { display: flex; flex-direction: column; gap: 5px; }',
    '.label { font-size: 12.5px; font-weight: 500; color: #1C1C1A; }',
    '.label .req { color: #DC2626; margin-left: 2px; }',
    '.hint { font-size: 11.5px; color: #A8A8A4; }',

    '.input, .textarea {',
    '  width: 100%; padding: 8px 12px;',
    '  font-size: 13.5px; font-family: "Outfit", system-ui, sans-serif;',
    '  color: #1C1C1A; background: #fff;',
    '  border: 1px solid #E8E8E4; border-radius: 8px;',
    '  outline: none; transition: border-color 0.12s, box-shadow 0.12s;',
    '  appearance: none;',
    '}',
    '.input:focus, .textarea:focus {',
    '  border-color: #1C1C1A;',
    '  box-shadow: 0 0 0 3px rgba(28,28,26,0.08);',
    '}',
    '.input.err { border-color: #DC2626; }',
    '.textarea { resize: vertical; min-height: 72px; line-height: 1.5; }',
    '.input[type="number"] { -moz-appearance: textfield; }',
    '.input[type="number"]::-webkit-outer-spin-button,',
    '.input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }',

    /* Tag chips */
    '.tag-wrap {',
    '  display: flex; flex-wrap: wrap; gap: 5px; align-items: center;',
    '  padding: 6px 10px; background: #fff; border: 1px solid #E8E8E4;',
    '  border-radius: 8px; min-height: 38px; cursor: text;',
    '  transition: border-color 0.12s, box-shadow 0.12s;',
    '}',
    '.tag-wrap:focus-within {',
    '  border-color: #1C1C1A;',
    '  box-shadow: 0 0 0 3px rgba(28,28,26,0.08);',
    '}',
    '.tag-chip {',
    '  display: inline-flex; align-items: center; gap: 4px;',
    '  padding: 2px 8px; border-radius: 9999px;',
    '  background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD;',
    '  font-size: 11.5px; font-weight: 500; white-space: nowrap;',
    '}',
    '.tag-chip button {',
    '  background: none; border: none; cursor: pointer;',
    '  color: #0369A1; opacity: 0.6; padding: 0; line-height: 0;',
    '  transition: opacity 0.1s;',
    '}',
    '.tag-chip button:hover { opacity: 1; }',
    '.tag-input-inner {',
    '  border: none; outline: none; background: transparent;',
    '  font-size: 13px; font-family: "Outfit", system-ui, sans-serif;',
    '  color: #1C1C1A; min-width: 80px; flex: 1; padding: 1px 0;',
    '}',

    /* Footer */
    '.footer {',
    '  padding: 14px 20px; border-top: 1px solid #E8E8E4;',
    '  background: #fff; flex-shrink: 0;',
    '  display: flex; align-items: center; justify-content: space-between; gap: 10px;',
    '}',

    '.err-msg {',
    '  font-size: 12px; color: #DC2626; flex: 1;',
    '}',

    '.btn-row { display: flex; gap: 8px; margin-left: auto; }',

    '.btn {',
    '  display: inline-flex; align-items: center; gap: 6px;',
    '  padding: 8px 16px; font-size: 13px; font-weight: 500;',
    '  font-family: "Outfit", system-ui, sans-serif;',
    '  border-radius: 8px; border: 1px solid transparent;',
    '  cursor: pointer; transition: all 0.12s; white-space: nowrap; line-height: 1;',
    '}',
    '.btn:disabled { opacity: 0.45; cursor: not-allowed; }',

    '.btn-ghost {',
    '  background: transparent; color: #737370; border-color: transparent;',
    '}',
    '.btn-ghost:hover:not(:disabled) { background: #F3F3F0; color: #1C1C1A; }',

    '.btn-primary {',
    '  background: #1C1C1A; color: #fff; border-color: #1C1C1A;',
    '}',
    '.btn-primary:hover:not(:disabled) { background: #333; }',

    /* Toast */
    '.toast {',
    '  position: fixed; bottom: 24px; right: 24px;',
    '  padding: 12px 18px; border-radius: 10px;',
    '  font-size: 13.5px; font-weight: 500; font-family: "Outfit", system-ui, sans-serif;',
    '  box-shadow: 0 4px 16px rgba(0,0,0,0.12);',
    '  transform: translateY(8px); opacity: 0;',
    '  transition: all 0.2s ease;',
    '  pointer-events: none; z-index: 10;',
    '}',
    '.toast.show { transform: translateY(0); opacity: 1; }',
    '.toast.success { background: #DCFCE7; color: #16A34A; border: 1px solid #a7f3d0; }',
    '.toast.error   { background: #FEE2E2; color: #DC2626; border: 1px solid #fca5a5; }',

    /* Spinner inside button */
    '.spinner {',
    '  width: 13px; height: 13px;',
    '  border: 2px solid currentColor; border-top-color: transparent;',
    '  border-radius: 50%; animation: spin 0.65s linear infinite; flex-shrink: 0;',
    '}',
    '@keyframes spin { to { transform: rotate(360deg); } }',
  ].join('\n');

  shadow.appendChild(style);

  // ── Build HTML ────────────────────────────────────────────────────────────────
  var tags = [];

  function renderImages() {
    if (!data.images.length) {
      return '<p class="no-images">No images detected on this page</p>';
    }
    return (
      '<div class="img-grid">' +
      data.images.map(function (url, i) {
        var isSel = url === selected ? ' selected' : '';
        return (
          '<button class="img-opt' + isSel + '" data-url="' + esc(url) + '" type="button" title="Select image">' +
          '<img src="' + esc(url) + '" loading="lazy" alt="Option ' + (i + 1) + '">' +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  }

  function renderTagChips() {
    return tags.map(function (t) {
      return (
        '<span class="tag-chip">' + esc(t) +
        '<button type="button" data-tag="' + esc(t) + '" aria-label="Remove ' + esc(t) + '">' +
        '<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1l7 7M8 1L1 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button></span>'
      );
    }).join('');
  }

  var panel = document.createElement('div');
  panel.id = panelId;
  panel.innerHTML = [
    '<div class="header">',
    '  <span class="header-title">Add to Wish List</span>',
    '  <button class="close-btn" id="wl-close" type="button" aria-label="Close">',
    '    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    '  </button>',
    '</div>',

    '<div class="body">',

    /* Image picker */
    '  <div>',
    '    <div class="section-label">Select image</div>',
    '    <div id="wl-img-grid">' + renderImages() + '</div>',
    '  </div>',

    /* Selected image URL (hidden input — updated on selection) */
    '  <div class="field">',
    '    <label class="label" for="wl-imageUrl">Image URL<span class="req">*</span></label>',
    '    <input id="wl-imageUrl" class="input" type="url" placeholder="https://..." value="' + esc(data.imageUrl) + '">',
    '  </div>',

    /* Title */
    '  <div class="field">',
    '    <label class="label" for="wl-title">Title<span class="req">*</span></label>',
    '    <input id="wl-title" class="input" type="text" placeholder="Product name" value="' + esc(data.title) + '">',
    '  </div>',

    /* Link */
    '  <div class="field">',
    '    <label class="label" for="wl-link">Product link<span class="req">*</span></label>',
    '    <input id="wl-link" class="input" type="url" placeholder="https://..." value="' + esc(data.link) + '">',
    '  </div>',

    /* Price */
    '  <div class="field">',
    '    <label class="label" for="wl-price">Price</label>',
    '    <input id="wl-price" class="input" type="number" placeholder="e.g. 49.99" value="' + esc(data.price) + '" step="0.01" min="0">',
    '    <span class="hint">Leave blank to hide price</span>',
    '  </div>',

    /* Description */
    '  <div class="field">',
    '    <label class="label" for="wl-desc">Description</label>',
    '    <textarea id="wl-desc" class="textarea" placeholder="Why you want this…" rows="3">' + esc(data.description) + '</textarea>',
    '  </div>',

    /* Tags */
    '  <div class="field">',
    '    <label class="label" for="wl-tag-input">Tags</label>',
    '    <div class="tag-wrap" id="wl-tag-wrap">',
    '      <span id="wl-tag-chips"></span>',
    '      <input id="wl-tag-input" class="tag-input-inner" type="text" placeholder="Add tags…" autocomplete="off">',
    '    </div>',
    '    <span class="hint">Enter or comma to add</span>',
    '  </div>',

    '</div>', // .body

    '<div class="footer">',
    '  <span class="err-msg" id="wl-err"></span>',
    '  <div class="btn-row">',
    '    <button class="btn btn-ghost" id="wl-cancel" type="button">Cancel</button>',
    '    <button class="btn btn-primary" id="wl-submit" type="button">',
    '      Add to list',
    '    </button>',
    '  </div>',
    '</div>',

    '<div class="toast" id="wl-toast"></div>',
  ].join('');

  shadow.appendChild(panel);

  // ── Wire up events ─────────────────────────────────────────────────────────

  function close() {
    panel.classList.remove('open');
    setTimeout(function () { host.remove(); }, 320);
  }

  shadow.getElementById('wl-close').addEventListener('click', close);
  shadow.getElementById('wl-cancel').addEventListener('click', close);

  // Close on Escape
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });

  // Image selection
  shadow.getElementById('wl-img-grid').addEventListener('click', function (e) {
    var btn = e.target.closest('.img-opt');
    if (!btn) return;
    shadow.querySelectorAll('.img-opt').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    selected = btn.dataset.url;
    shadow.getElementById('wl-imageUrl').value = selected;
  });

  // Tag input
  var tagInput = shadow.getElementById('wl-tag-input');
  var tagChips = shadow.getElementById('wl-tag-chips');

  function refreshChips() {
    tagChips.innerHTML = renderTagChips();
    tagChips.querySelectorAll('[data-tag]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tags = tags.filter(function (t) { return t !== btn.dataset.tag; });
        refreshChips();
      });
    });
  }

  tagInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      var val = tagInput.value.trim().toLowerCase();
      if (val && !tags.includes(val)) { tags.push(val); refreshChips(); }
      tagInput.value = '';
    }
    if (e.key === 'Backspace' && !tagInput.value && tags.length) {
      tags.pop(); refreshChips();
    }
  });

  // Click tag-wrap → focus input
  shadow.getElementById('wl-tag-wrap').addEventListener('click', function () {
    tagInput.focus();
  });

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg, type) {
    var toast = shadow.getElementById('wl-toast');
    toast.textContent = msg;
    toast.className = 'toast ' + type;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('show'); });
    });
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  shadow.getElementById('wl-submit').addEventListener('click', function () {
    var titleEl    = shadow.getElementById('wl-title');
    var linkEl     = shadow.getElementById('wl-link');
    var imageEl    = shadow.getElementById('wl-imageUrl');
    var priceEl    = shadow.getElementById('wl-price');
    var descEl     = shadow.getElementById('wl-desc');
    var errEl      = shadow.getElementById('wl-err');
    var submitBtn  = shadow.getElementById('wl-submit');

    errEl.textContent = '';
    [titleEl, linkEl, imageEl].forEach(function (el) { el.classList.remove('err'); });

    var hasErr = false;
    if (!titleEl.value.trim()) { titleEl.classList.add('err'); hasErr = true; }
    if (!linkEl.value.trim())  { linkEl.classList.add('err');  hasErr = true; }
    if (!imageEl.value.trim()) { imageEl.classList.add('err'); hasErr = true; }

    if (hasErr) { errEl.textContent = 'Please fill in required fields.'; return; }

    var item = {
      id:          uid(),
      title:       titleEl.value.trim(),
      description: descEl.value.trim(),
      imageUrl:    imageEl.value.trim(),
      link:        linkEl.value.trim(),
      price:       priceEl.value ? Number(priceEl.value) : undefined,
      tags:        tags.slice(),
      purchased:   false,
      createdAt:   new Date().toISOString(),
      sortOrder:   Date.now(),
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving…';

    fetch(GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'saveItem', token: EDIT_TOKEN, data: item }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json.success) throw new Error(json.error || 'Save failed');
        showToast('✓ Added to wish list!', 'success');
        setTimeout(close, 1400);
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add to list';
        errEl.textContent = 'Error: ' + (err.message || 'Could not save. Check your GAS URL.');
        showToast('Failed to save item', 'error');
      });
  });

  // ── Open panel ────────────────────────────────────────────────────────────
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      panel.classList.add('open');
    });
  });

  refreshChips(); // initial (empty) chips
}());
