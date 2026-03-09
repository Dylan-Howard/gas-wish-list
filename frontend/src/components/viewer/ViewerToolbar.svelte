<script lang="ts">
  import SearchBar from './SearchBar.svelte';
  import TagFilter from './TagFilter.svelte';
  import SortControl from './SortControl.svelte';
  import Toggle from '$components/ui/Toggle.svelte';
  import { filterConfig, viewMode } from '$lib/stores';
  import type { ViewMode } from '$lib/types';

  export let allTags: string[] = [];
  export let totalItems: number = 0;
  export let filteredCount: number = 0;

  function togglePurchased() {
    filterConfig.update((f) => ({ ...f, showPurchased: !f.showPurchased }));
  }

  function onViewModeChange(e: CustomEvent<ViewMode>) {
    viewMode.set(e.detail);
  }
</script>

<div class="toolbar">
  <!-- Top row: search + view toggle + item count -->
  <div class="top-row">
    <SearchBar />

    <div class="right-controls">
      <span class="count" aria-live="polite">
        {#if filteredCount !== totalItems}
          {filteredCount} of {totalItems}
        {:else}
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        {/if}
      </span>

      <button
        class="purchased-toggle"
        class:purchased-toggle--active={$filterConfig.showPurchased}
        type="button"
        on:click={togglePurchased}
        aria-pressed={$filterConfig.showPurchased}
        title={$filterConfig.showPurchased ? 'Hide purchased' : 'Show purchased'}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path d="M1.5 7l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {$filterConfig.showPurchased ? 'Hide' : 'Show'} purchased
      </button>

      <Toggle bind:mode={$viewMode} />
    </div>
  </div>

  <!-- Bottom row: tags + sort -->
  {#if allTags.length > 0}
    <div class="bottom-row">
      <TagFilter {allTags} />
      <div class="divider" aria-hidden="true" />
      <SortControl />
    </div>
  {:else}
    <div class="bottom-row bottom-row--sort-only">
      <SortControl />
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 0;
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .count {
    font-size: 12.5px;
    color: var(--color-text-tertiary);
    white-space: nowrap;
  }

  .purchased-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    font-size: 12.5px;
    font-weight: 400;
    font-family: var(--font-body);
    border-radius: var(--radius-full);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }

  .purchased-toggle:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
  }

  .purchased-toggle--active {
    background: var(--color-success-light);
    color: var(--color-success);
    border-color: #a7f3d0;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .bottom-row--sort-only {
    justify-content: flex-end;
  }

  .divider {
    width: 1px;
    height: 18px;
    background: var(--color-border);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .right-controls { gap: 8px; }
    .count { display: none; }
  }
</style>
