<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = '';
  export let maxWidth = '480px';

  const dispatch = createEventDispatcher<{ close: void }>();

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) dispatch('close');
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') dispatch('close');
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
  <div class="backdrop" on:click={onBackdropClick} on:keydown={onBackdropClick} role="presentation">
    <div
      class="dialog"
      style="max-width: {maxWidth};"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {#if title}
        <div class="dialog-header">
          <h3 id="dialog-title" class="dialog-title">{title}</h3>
          <button
            class="dialog-close"
            type="button"
            on:click={() => dispatch('close')}
            aria-label="Close dialog"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M2 2l11 11M13 2L2 13"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      {/if}
      <div class="dialog-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fade-in 0.15s ease;
  }

  .dialog {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slide-up 0.2s ease;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 0;
    gap: 12px;
  }

  .dialog-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .dialog-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border: none;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .dialog-close:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }

  .dialog-body {
    padding: 20px 24px 24px;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
</style>
