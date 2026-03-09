<script lang="ts">
  import type { ViewMode } from '$lib/types';
  export let mode: ViewMode = 'grid';
</script>

<div class="toggle" role="group" aria-label="View mode">
  <button
    class="toggle-btn"
    class:toggle-btn--active={mode === 'grid'}
    type="button"
    on:click={() => (mode = 'grid')}
    aria-pressed={mode === 'grid'}
    title="Grid view"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1"   y="1"   width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="8"   y="1"   width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="1"   y="8"   width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/>
      <rect x="8"   y="8"   width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/>
    </svg>
  </button>

  <button
    class="toggle-btn"
    class:toggle-btn--active={mode === 'list'}
    type="button"
    on:click={() => (mode = 'list')}
    aria-pressed={mode === 'list'}
    title="List view"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2"   width="12" height="2.5" rx="1" stroke="currentColor" stroke-width="1.3"/>
      <rect x="1" y="5.8" width="12" height="2.5" rx="1" stroke="currentColor" stroke-width="1.3"/>
      <rect x="1" y="9.5" width="12" height="2.5" rx="1" stroke="currentColor" stroke-width="1.3"/>
    </svg>
  </button>
</div>

<style>
  .toggle {
    display: inline-flex;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 2px;
    gap: 2px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 30px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .toggle-btn:hover { color: var(--color-text-primary); }

  .toggle-btn--active {
    background: var(--color-surface);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-sm);
  }
</style>
