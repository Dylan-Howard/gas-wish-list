<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';

  export let title = 'Something went wrong';
  export let message = '';
  export let showRetry = false;
  export let variant: 'full-page' | 'inline' = 'full-page';

  const dispatch = createEventDispatcher();

  function onRetry() {
    dispatch('retry');
  }
</script>

<div class="error-container error-container--{variant}" role="alert">
  <div class="icon-wrapper">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  
  <div class="content">
    <h3 class="title">{title}</h3>
    {#if message}
      <p class="message">{message}</p>
    {/if}
    
    {#if showRetry}
      <div class="actions">
        <Button variant="secondary" size="sm" on:click={onRetry}>
          Try again
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    color: var(--color-danger);
  }

  .error-container--full-page {
    padding: 80px 24px;
  }

  .error-container--inline {
    padding: 24px;
    background: var(--color-danger-light);
    border: 1px solid #fca5a5;
    border-radius: var(--radius-lg);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--color-danger-light);
    border-radius: var(--radius-full);
    color: var(--color-danger);
  }

  .error-container--inline .icon-wrapper {
    width: 40px;
    height: 40px;
    background: white;
  }

  .title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 4px;
    color: var(--color-text-primary);
  }

  .message {
    font-size: 14px;
    color: var(--color-text-secondary);
    max-width: 400px;
    margin: 0 auto;
  }

  .actions {
    margin-top: 16px;
  }

  .error-container--inline .title {
    font-size: 16px;
  }
</style>
