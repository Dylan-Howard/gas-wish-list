<script lang="ts">
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { toasts, removeToast } from '../../lib/store';
</script>

<div class="toast-region" aria-live="polite" aria-atomic="false">
  {#each $toasts as toast (toast.id)}
    <div
      class="toast toast--{toast.type}"
      role="status"
      animate:flip={{ duration: 200 }}
      in:fly={{ y: 16, duration: 250 }}
      out:fly={{ y: -8, duration: 200 }}
    >
      <span class="toast__icon" aria-hidden="true">
        {#if toast.type === 'success'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else if toast.type === 'error'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
            <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
            <path d="M8 7v4M8 5.5h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {/if}
      </span>
      <span class="toast__message">{toast.message}</span>
      <button
        class="toast__close"
        aria-label="Dismiss notification"
        on:click={() => removeToast(toast.id)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-region {
    position: fixed;
    bottom: var(--sp-6);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    z-index: 200;
    pointer-events: none;
    align-items: center;
    min-width: 280px;
    max-width: min(480px, calc(100vw - 32px));
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    padding: var(--sp-3) var(--sp-4);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-lg);
    font-size: 0.875rem;
    font-weight: 500;
    pointer-events: all;
    width: 100%;
    border: 1px solid transparent;
  }

  .toast--success {
    background: var(--c-success-light);
    color: #1A7A44;
    border-color: #B5E0C8;
  }

  .toast--error {
    background: var(--c-danger-light);
    color: var(--c-danger);
    border-color: #F2C4C4;
  }

  .toast--info {
    background: var(--c-surface);
    color: var(--c-text-primary);
    border-color: var(--c-border);
  }

  .toast__icon { flex-shrink: 0; display: flex; }

  .toast__message { flex: 1; line-height: 1.4; }

  .toast__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.5;
    border-radius: var(--r-sm);
    transition: opacity var(--t-fast);
    padding: 0;
  }

  .toast__close:hover { opacity: 1; }
</style>
