<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SortConfig, SortField, SortDirection } from '../../lib/types';

  export let value: SortConfig = { field: 'createdAt', direction: 'desc' };

  const dispatch = createEventDispatcher<{ change: SortConfig }>();

  const fields: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Date added' },
    { value: 'title',     label: 'Name' },
    { value: 'price',     label: 'Price' },
  ];

  function setField(e: Event) {
    const field = (e.target as HTMLSelectElement).value as SortField;
    dispatch('change', { ...value, field });
  }

  function toggleDirection() {
    const direction: SortDirection = value.direction === 'asc' ? 'desc' : 'asc';
    dispatch('change', { ...value, direction });
  }
</script>

<div class="sort-control" aria-label="Sort options">
  <span class="sort-control__label">Sort:</span>

  <select
    class="sort-control__select"
    value={value.field}
    on:change={setField}
    aria-label="Sort by"
  >
    {#each fields as f}
      <option value={f.value}>{f.label}</option>
    {/each}
  </select>

  <button
    class="sort-control__dir"
    on:click={toggleDirection}
    title={value.direction === 'asc' ? 'Ascending — click to reverse' : 'Descending — click to reverse'}
    aria-label="Direction: {value.direction === 'asc' ? 'ascending' : 'descending'}, click to toggle"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      {#if value.direction === 'asc'}
        <path d="M7 2v10M3 6l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      {:else}
        <path d="M7 12V2M3 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      {/if}
    </svg>
  </button>
</div>

<style>
  .sort-control {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }

  .sort-control__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-muted);
    white-space: nowrap;
  }

  .sort-control__select {
    height: 30px;
    padding: 0 var(--sp-3);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-primary);
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239C9C98' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 24px;
    transition: border-color var(--t-fast);
  }

  .sort-control__select:focus {
    outline: none;
    border-color: var(--c-accent);
  }

  .sort-control__dir {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    background: var(--c-surface);
    cursor: pointer;
    color: var(--c-text-secondary);
    transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
  }

  .sort-control__dir:hover {
    border-color: var(--c-text-muted);
    color: var(--c-text-primary);
    background: var(--c-bg);
  }

  .sort-control__dir:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }
</style>
