<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Button from './Button.svelte';

  export let open: boolean = false;
  export let title: string = 'Are you sure?';
  export let message: string = '';
  export let confirmLabel: string = 'Confirm';
  export let cancelLabel: string = 'Cancel';
  export let variant: 'danger' | 'primary' = 'danger';
  export let loading: boolean = false;

  const dispatch = createEventDispatcher<{ confirm: void; cancel: void }>();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      dispatch('cancel');
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="backdrop"
    on:click={() => dispatch('cancel')}
    transition:fade={{ duration: 200 }}
  />

  <!-- Dialog -->
  <div
    class="dialog-wrap"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
  >
    <div
      class="dialog"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Icon -->
      <div class="dialog__icon dialog__icon--{variant}" aria-hidden="true">
        {#if variant === 'danger'}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 7v5M11 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9.172 3.172a2.667 2.667 0 0 1 3.656 0L20.828 11.17a2.667 2.667 0 0 1 0 3.656l-8 8a2.667 2.667 0 0 1-3.656 0L1.172 14.828a2.667 2.667 0 0 1 0-3.656l8-8Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        {:else}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M11 7v4M11 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        {/if}
      </div>

      <h2 id="dialog-title" class="dialog__title">{title}</h2>

      {#if message}
        <p class="dialog__message">{message}</p>
      {/if}

      <div class="dialog__actions">
        <Button
          variant="secondary"
          on:click={() => dispatch('cancel')}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          {loading}
          on:click={() => dispatch('confirm')}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 100;
    backdrop-filter: blur(2px);
  }

  .dialog-wrap {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
    padding: var(--sp-4);
    pointer-events: none;
  }

  .dialog {
    background: var(--c-surface);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-dialog);
    padding: var(--sp-8);
    width: 100%;
    max-width: 400px;
    pointer-events: all;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--sp-3);
  }

  .dialog__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--sp-1);
  }

  .dialog__icon--danger {
    background: var(--c-danger-light);
    color: var(--c-danger);
  }

  .dialog__icon--primary {
    background: var(--c-accent-light);
    color: var(--c-accent);
  }

  .dialog__title {
    font-family: var(--font-display);
    font-size: 1.375rem;
    color: var(--c-text-primary);
  }

  .dialog__message {
    font-size: 0.9rem;
    color: var(--c-text-secondary);
    line-height: 1.6;
    max-width: 300px;
  }

  .dialog__actions {
    display: flex;
    gap: var(--sp-3);
    margin-top: var(--sp-2);
    width: 100%;
    justify-content: center;
  }

  .dialog__actions :global(.btn) {
    flex: 1;
    max-width: 140px;
  }
</style>
