<script lang="ts">
  import { filterConfig } from '$lib/stores';

  let inputEl: HTMLInputElement;

  function onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    filterConfig.update((f) => ({ ...f, search: val }));
  }

  function clear() {
    filterConfig.update((f) => ({ ...f, search: '' }));
    inputEl?.focus();
  }
</script>

<div class="search-wrap">
  <svg class="icon-search" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4"/>
    <path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>

  <input
    bind:this={inputEl}
    class="search-input"
    type="search"
    placeholder="Search items…"
    value={$filterConfig.search}
    on:input={onInput}
    aria-label="Search wish list items"
  />

  {#if $filterConfig.search}
    <button class="clear-btn" type="button" on:click={clear} aria-label="Clear search">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 280px;
  }

  .icon-search {
    position: absolute;
    left: 11px;
    color: var(--color-text-tertiary);
    pointer-events: none;
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    padding: 8px 34px 8px 33px;
    font-size: 13.5px;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    outline: none;
    transition: all var(--transition-fast);
    appearance: none;
    -webkit-appearance: none;
  }

  .search-input::placeholder { color: var(--color-text-tertiary); }

  .search-input:focus {
    border-color: var(--color-text-primary);
    box-shadow: 0 0 0 3px rgba(28, 28, 26, 0.07);
  }

  /* hide browser's built-in X */
  .search-input::-webkit-search-cancel-button { display: none; }

  .clear-btn {
    position: absolute;
    right: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: var(--color-bg);
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .clear-btn:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }
</style>
