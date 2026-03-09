<script lang="ts">
  import { sortConfig } from '$lib/stores';
  import type { SortField } from '$lib/types';

  const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: 'sortOrder', label: 'Default' },
    { value: 'title',     label: 'Name' },
    { value: 'price',     label: 'Price' },
    { value: 'createdAt', label: 'Date added' },
  ];

  function setField(field: SortField) {
    sortConfig.update((s) => {
      if (s.field === field) {
        return { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  }
</script>

<div class="sort-control" role="group" aria-label="Sort items">
  <span class="label">Sort</span>
  <div class="options">
    {#each SORT_OPTIONS as opt (opt.value)}
      {@const active = $sortConfig.field === opt.value}
      <button
        class="opt"
        class:opt--active={active}
        type="button"
        on:click={() => setField(opt.value)}
        aria-pressed={active}
      >
        {opt.label}
        {#if active}
          <svg
            class="arrow"
            class:arrow--desc={$sortConfig.direction === 'desc'}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 1.5v7M2 5.5l3 3 3-3"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .sort-control {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .options {
    display: flex;
    gap: 4px;
  }

  .opt {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 12.5px;
    font-weight: 400;
    font-family: var(--font-body);
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
    line-height: 1;
  }

  .opt:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

  .opt--active {
    background: var(--color-bg);
    color: var(--color-text-primary);
    font-weight: 500;
    border-color: var(--color-border);
  }

  .arrow {
    transition: transform var(--transition-fast);
  }

  .arrow--desc {
    transform: rotate(180deg);
  }
</style>
