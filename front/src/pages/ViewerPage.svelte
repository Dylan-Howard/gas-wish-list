<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import {
    items, displayItems, allTags,
    isLoading, loadError,
    sortConfig, filterConfig, layout,
    addToast,
  } from '../lib/store';
  import { api } from '../lib/api';
  import type { WishItem } from '../lib/types';
  import { config } from '../config';

  import LayoutToggle from '../components/viewer/LayoutToggle.svelte';
  import TagFilter    from '../components/viewer/TagFilter.svelte';
  import SortControl  from '../components/viewer/SortControl.svelte';
  import WishItemCard from '../components/viewer/WishItemCard.svelte';
  import WishItemRow  from '../components/viewer/WishItemRow.svelte';
  import ConfirmDialog from '../components/ui/ConfirmDialog.svelte';
  import LoadingSpinner from '../components/ui/LoadingSpinner.svelte';
  import EmptyState from '../components/ui/EmptyState.svelte';

  // ── Purchase confirmation state ─────────────────────────────────────────────
  let confirmOpen = false;
  let confirmItem: WishItem | null = null;
  let purchasing = false;

  // ── Search state ────────────────────────────────────────────────────────────
  let searchValue = '';
  $: filterConfig.update(f => ({ ...f, search: searchValue }));

  // ── Show purchased toggle ───────────────────────────────────────────────────
  $: showPurchased = $filterConfig.showPurchased;

  // ── Load data ───────────────────────────────────────────────────────────────
  onMount(async () => {
    isLoading.set(true);
    loadError.set(null);
    try {
      const data = await api.getItems();
      items.set(data);
    } catch (e) {
      loadError.set(e instanceof Error ? e.message : 'Failed to load items.');
      addToast('Could not load wish list. Please try again.', 'error');
    } finally {
      isLoading.set(false);
    }
  });

  // ── Purchase flow ────────────────────────────────────────────────────────────
  function openPurchaseDialog(item: WishItem) {
    confirmItem = item;
    confirmOpen = true;
  }

  async function confirmPurchase() {
    if (!confirmItem) return;
    purchasing = true;
    try {
      await api.markPurchased(confirmItem.id);
      items.update(all => all.filter(i => i.id !== confirmItem!.id));
      addToast(`"${confirmItem.title}" marked as purchased! 🎉`, 'success');
    } catch (e) {
      addToast('Could not update item. Please try again.', 'error');
    } finally {
      purchasing = false;
      confirmOpen = false;
      confirmItem = null;
    }
  }

  function cancelPurchase() {
    confirmOpen = false;
    confirmItem = null;
  }
</script>

<div class="page">
  <!-- ── Header ────────────────────────────────────────────────────────────── -->
  <header class="page-header">
    <div class="page-header__inner">
      <div>
        <p class="page-header__eyebrow">{config.listOwner}'s</p>
        <h1 class="page-header__title">{config.listTitle}</h1>
      </div>
      <div class="page-header__count">
        {#if !$isLoading}
          <span>{$items.filter(i => !i.purchased).length} items</span>
        {/if}
      </div>
    </div>
  </header>

  <!-- ── Toolbar ───────────────────────────────────────────────────────────── -->
  <div class="toolbar">
    <!-- Search -->
    <div class="toolbar__search">
      <span class="toolbar__search-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M10 10l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </span>
      <input
        class="toolbar__search-input"
        type="search"
        placeholder="Search…"
        bind:value={searchValue}
        aria-label="Search items"
      />
    </div>

    <div class="toolbar__right">
      <!-- Purchased toggle -->
      <label class="toggle-label">
        <input
          type="checkbox"
          class="toggle-label__checkbox"
          checked={showPurchased}
          on:change={(e) => filterConfig.update(f => ({ ...f, showPurchased: e.currentTarget.checked }))}
          aria-label="Show purchased items"
        />
        <span class="toggle-label__text">Show purchased</span>
      </label>

      <!-- Sort -->
      <SortControl
        value={$sortConfig}
        on:change={(e) => sortConfig.set(e.detail)}
      />

      <!-- Layout toggle -->
      <LayoutToggle
        value={$layout}
        on:change={(e) => layout.set(e.detail)}
      />
    </div>
  </div>

  <!-- ── Tag Filter ────────────────────────────────────────────────────────── -->
  {#if $allTags.length > 0}
    <div class="tag-filter-wrap">
      <TagFilter
        tags={$allTags}
        selected={$filterConfig.tags}
        on:change={(e) => filterConfig.update(f => ({ ...f, tags: e.detail }))}
      />
    </div>
  {/if}

  <!-- ── Content ───────────────────────────────────────────────────────────── -->
  <main class="content">
    {#if $isLoading}
      <div class="state-center">
        <LoadingSpinner size={36} label="Loading wish list…" />
        <p class="state-label">Loading wish list…</p>
      </div>

    {:else if $loadError}
      <div class="state-center">
        <EmptyState
          title="Could not load items"
          message={$loadError}
        />
      </div>

    {:else if $displayItems.length === 0}
      {#if $filterConfig.tags.length > 0 || searchValue}
        <EmptyState
          title="No matches"
          message="Try adjusting your search or tag filters."
        />
      {:else}
        <EmptyState
          title="The wish list is empty"
          message="Check back later for gift ideas!"
        />
      {/if}

    {:else if $layout === 'grid'}
      <div class="grid" role="list">
        {#each $displayItems as item (item.id)}
          <div role="listitem" animate:flip={{ duration: 280 }} in:fade={{ duration: 200 }}>
            <WishItemCard
              {item}
              on:purchase={(e) => openPurchaseDialog(e.detail)}
            />
          </div>
        {/each}
      </div>

    {:else}
      <div class="list" role="list">
        {#each $displayItems as item (item.id)}
          <div role="listitem" animate:flip={{ duration: 280 }} in:fade={{ duration: 200 }}>
            <WishItemRow
              {item}
              on:purchase={(e) => openPurchaseDialog(e.detail)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- ── Confirm Purchase Dialog ──────────────────────────────────────────────── -->
<ConfirmDialog
  open={confirmOpen}
  title="Mark as purchased?"
  message={confirmItem
    ? `This will remove "${confirmItem.title}" from the wish list for everyone.`
    : ''}
  confirmLabel="Yes, purchased!"
  cancelLabel="Cancel"
  variant="primary"
  loading={purchasing}
  on:confirm={confirmPurchase}
  on:cancel={cancelPurchase}
/>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--sp-8) var(--sp-6);
    display: flex;
    flex-direction: column;
    gap: var(--sp-5);
  }

  /* Header */
  .page-header__inner {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--sp-4);
    padding-bottom: var(--sp-5);
    border-bottom: 1.5px solid var(--c-border);
  }

  .page-header__eyebrow {
    font-size: 0.875rem;
    color: var(--c-text-muted);
    font-weight: 400;
    letter-spacing: 0.02em;
    margin-bottom: 2px;
  }

  .page-header__title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .page-header__count {
    font-size: 0.875rem;
    color: var(--c-text-muted);
    white-space: nowrap;
    padding-bottom: 4px;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    flex-wrap: wrap;
  }

  .toolbar__search {
    position: relative;
    flex: 1;
    min-width: 180px;
    max-width: 300px;
  }

  .toolbar__search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--c-text-muted);
    pointer-events: none;
    display: flex;
  }

  .toolbar__search-input {
    width: 100%;
    height: 34px;
    padding: 0 var(--sp-3) 0 32px;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    font-size: 0.875rem;
    color: var(--c-text-primary);
    background: var(--c-surface);
    transition: border-color var(--t-fast);
    font-family: var(--font-ui);
  }

  .toolbar__search-input:focus {
    outline: none;
    border-color: var(--c-accent);
  }

  .toolbar__search-input::placeholder {
    color: var(--c-text-muted);
  }

  .toolbar__right {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    flex-wrap: wrap;
    margin-left: auto;
  }

  /* Purchased toggle */
  .toggle-label {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    cursor: pointer;
    user-select: none;
  }

  .toggle-label__checkbox {
    width: 16px;
    height: 16px;
    accent-color: var(--c-accent);
    cursor: pointer;
  }

  .toggle-label__text {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-secondary);
    white-space: nowrap;
  }

  /* Tag filter */
  .tag-filter-wrap {
    padding: var(--sp-3) 0;
    border-top: 1px solid var(--c-border);
    border-bottom: 1px solid var(--c-border);
  }

  /* Content */
  .content {
    min-height: 300px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--sp-5);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
  }

  .state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--sp-16) 0;
    gap: var(--sp-3);
  }

  .state-label {
    font-size: 0.875rem;
    color: var(--c-text-muted);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @media (max-width: 640px) {
    .page { padding: var(--sp-5) var(--sp-4); }
    .toolbar__right { width: 100%; }
    .toolbar__search { max-width: none; }
    .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--sp-3); }
  }
</style>
