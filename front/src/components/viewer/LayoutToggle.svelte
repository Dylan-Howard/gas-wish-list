<script lang="ts">
  import type { LayoutMode } from '../../lib/types';
  import { createEventDispatcher } from 'svelte';

  export let value: LayoutMode = 'grid';

  const dispatch = createEventDispatcher<{ change: LayoutMode }>();

  function set(mode: LayoutMode) {
    if (mode !== value) dispatch('change', mode);
  }
</script>

<div class="toggle" role="group" aria-label="View layout">
  <button
    class="toggle__btn"
    class:toggle__btn--active={value === 'grid'}
    aria-label="Grid view"
    aria-pressed={value === 'grid'}
    on:click={() => set('grid')}
  >
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.4"/>
    </svg>
  </button>

  <button
    class="toggle__btn"
    class:toggle__btn--active={value === 'list'}
    aria-label="List view"
    aria-pressed={value === 'list'}
    on:click={() => set('list')}
  >
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M1 3h13M1 7.5h13M1 12h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>
  </button>
</div>

<style>
  .toggle {
    display: flex;
    background: var(--c-bg);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    padding: 2px;
    gap: 2px;
  }

  .toggle__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 28px;
    border: none;
    background: transparent;
    border-radius: 3px;
    cursor: pointer;
    color: var(--c-text-muted);
    transition: background var(--t-fast), color var(--t-fast);
  }

  .toggle__btn:hover:not(.toggle__btn--active) {
    background: var(--c-surface);
    color: var(--c-text-secondary);
  }

  .toggle__btn--active {
    background: var(--c-surface);
    color: var(--c-text-primary);
    box-shadow: var(--shadow-sm);
  }

  .toggle__btn:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }
</style>
