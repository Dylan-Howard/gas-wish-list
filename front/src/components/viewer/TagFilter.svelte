<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TagBadge from '../ui/TagBadge.svelte';

  export let tags: string[] = [];       // all available tags
  export let selected: string[] = [];   // currently active filters

  const dispatch = createEventDispatcher<{ change: string[] }>();

  function toggle(tag: string) {
    const next = selected.includes(tag)
      ? selected.filter(t => t !== tag)
      : [...selected, tag];
    dispatch('change', next);
  }

  function clearAll() {
    dispatch('change', []);
  }
</script>

{#if tags.length > 0}
  <div class="filter-bar" role="group" aria-label="Filter by tag">
    <span class="filter-bar__label">Filter:</span>
    <div class="filter-bar__chips">
      {#each tags as tag (tag)}
        <TagBadge
          {tag}
          interactive
          active={selected.includes(tag)}
          on:click={() => toggle(tag)}
        />
      {/each}
    </div>
    {#if selected.length > 0}
      <button class="filter-bar__clear" on:click={clearAll} aria-label="Clear all filters">
        Clear
      </button>
    {/if}
  </div>
{/if}

<style>
  .filter-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sp-2);
  }

  .filter-bar__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-muted);
    white-space: nowrap;
  }

  .filter-bar__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
  }

  .filter-bar__clear {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: var(--r-sm);
    transition: color var(--t-fast), background var(--t-fast);
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
  }

  .filter-bar__clear:hover {
    color: var(--c-text-primary);
  }

  .filter-bar__clear:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }
</style>
