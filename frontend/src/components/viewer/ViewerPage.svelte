<script lang="ts">
  import { onMount } from 'svelte';
  import WishCard from './WishCard.svelte';
  import WishRow from './WishRow.svelte';
  import ViewerToolbar from './ViewerToolbar.svelte';
  import PurchaseDialog from './PurchaseDialog.svelte';
  import Spinner from '$components/ui/Spinner.svelte';
  import { filteredItems, allTags, items, loading, error, viewMode, loadItems, markItemPurchased } from '$lib/stores';
  import type { WishItem } from '$lib/types';

  export let isViewer = true;

  let purchaseTarget: WishItem | null = null;
  let dialogOpen = false;

  onMount(() => {
    loadItems();
  });

  function onPurchase(item: WishItem) {
    purchaseTarget = item;
    dialogOpen = true;
  }

  async function onConfirmPurchase(e: CustomEvent<string>) {
    dialogOpen = false;
    await markItemPurchased(e.detail);
    purchaseTarget = null;
  }

  function onCancelPurchase() {
    dialogOpen = false;
    purchaseTarget = null;
  }
</script>

<div class="page">
  <ViewerToolbar
    allTags={$allTags}
    totalItems={$items.filter((i) => !i.purchased).length}
    filteredCount={$filteredItems.length}
  />

  <!-- States -->
  {#if $loading}
    <div class="state">
      <Spinner size="lg" />
      <p>Loading wish list…</p>
    </div>

  {:else if $error}
    <div class="state state--error">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p>{$error}</p>
      <button class="retry" on:click={loadItems}>Try again</button>
    </div>

  {:else if $filteredItems.length === 0}
    <div class="state">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="18" stroke="var(--color-border-strong)" stroke-width="1.5"/>
        <path d="M13 20h14M20 13v14" stroke="var(--color-border-strong)" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      </svg>
      <p class="state-title">Nothing here yet</p>
      <p class="state-sub">No items match your current filters.</p>
    </div>

  {:else if $viewMode === 'grid'}
    <ul class="grid" role="list">
      {#each $filteredItems as item (item.id)}
        <li>
          <WishCard {item} {isViewer} on:purchase={(e) => onPurchase(e.detail)} />
        </li>
      {/each}
    </ul>

  {:else}
    <ul class="list" role="list">
      {#each $filteredItems as item (item.id)}
        <li>
          <WishRow {item} {isViewer} on:purchase={(e) => onPurchase(e.detail)} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<PurchaseDialog
  item={purchaseTarget}
  open={dialogOpen}
  on:confirm={onConfirmPurchase}
  on:cancel={onCancelPurchase}
/>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px 64px;
  }

  /* Grid layout */
  .grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    animation: fade-in 0.2s ease;
  }

  /* List layout */
  .list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fade-in 0.2s ease;
  }

  /* States */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 80px 20px;
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .state--error { color: var(--color-danger); }

  .state p { font-size: 14px; }

  .state-title {
    font-family: var(--font-display);
    font-size: 18px !important;
    color: var(--color-text-secondary) !important;
  }

  .state-sub {
    color: var(--color-text-tertiary) !important;
  }

  .retry {
    margin-top: 4px;
    padding: 7px 16px;
    font-size: 13px;
    font-family: var(--font-body);
    font-weight: 500;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text-primary);
    transition: all var(--transition-fast);
  }

  .retry:hover {
    background: var(--color-bg);
    border-color: var(--color-border-strong);
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .page { padding: 0 16px 48px; }
    .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
  }
</style>
