<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  export let message = '';
  export let type: 'success' | 'error' | 'info' = 'info';
  export let duration = 4000;

  const dispatch = createEventDispatcher();

  onMount(() => {
    const timer = setTimeout(() => {
      dispatch('close');
    }, duration);

    return () => clearTimeout(timer);
  });
</script>

<div
  class="toast toast--{type}"
  in:fly={{ y: 20, duration: 300 }}
  out:fade={{ duration: 200 }}
  role="status"
>
  <div class="icon">
    {#if type === 'success'}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    {:else if type === 'error'}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
      </svg>
    {:else}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round"/>
      </svg>
    {/if}
  </div>
  <p class="message">{message}</p>
  <button class="close" on:click={() => dispatch('close')} aria-label="Close">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>

<style>
  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 280px;
    max-width: 420px;
    pointer-events: auto;
  }

  .toast--success { border-left: 4px solid var(--color-success); }
  .toast--error { border-left: 4px solid var(--color-danger); }
  .toast--info { border-left: 4px solid var(--color-accent); }

  .icon { flex-shrink: 0; }
  .toast--success .icon { color: var(--color-success); }
  .toast--error .icon { color: var(--color-danger); }
  .toast--info .icon { color: var(--color-accent); }

  .message {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    flex-grow: 1;
    line-height: 1.4;
  }

  .close {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .close:hover {
    background: var(--color-bg);
    color: var(--color-text-secondary);
  }
</style>
