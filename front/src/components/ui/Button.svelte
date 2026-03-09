<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let fullWidth: boolean = false;
</script>

<button
  {type}
  disabled={disabled || loading}
  class="btn btn--{variant} btn--{size}"
  class:btn--full={fullWidth}
  class:btn--loading={loading}
  on:click
>
  {#if loading}
    <span class="btn__spinner" aria-hidden="true" />
  {/if}
  <span class="btn__label">
    <slot />
  </span>
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    font-family: var(--font-ui);
    font-weight: 500;
    border: 1.5px solid transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition:
      background var(--t-fast),
      border-color var(--t-fast),
      color var(--t-fast),
      box-shadow var(--t-fast),
      opacity var(--t-fast);
    white-space: nowrap;
    user-select: none;
    text-decoration: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .btn--loading {
    pointer-events: none;
  }

  .btn--full { width: 100%; }

  /* Sizes */
  .btn--sm { height: 30px; padding: 0 var(--sp-3); font-size: 0.8125rem; }
  .btn--md { height: 36px; padding: 0 var(--sp-4); font-size: 0.875rem; }
  .btn--lg { height: 44px; padding: 0 var(--sp-6); font-size: 0.9375rem; }

  /* Variants */
  .btn--primary {
    background: var(--c-accent);
    border-color: var(--c-accent);
    color: var(--c-accent-fg);
  }
  .btn--primary:hover:not(:disabled) {
    background: var(--c-accent-hover);
    border-color: var(--c-accent-hover);
  }

  .btn--secondary {
    background: var(--c-surface);
    border-color: var(--c-border-strong);
    color: var(--c-text-primary);
  }
  .btn--secondary:hover:not(:disabled) {
    background: var(--c-bg);
    border-color: var(--c-text-muted);
  }

  .btn--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--c-text-secondary);
  }
  .btn--ghost:hover:not(:disabled) {
    background: var(--c-bg);
    color: var(--c-text-primary);
  }

  .btn--danger {
    background: var(--c-danger);
    border-color: var(--c-danger);
    color: var(--c-danger-fg);
  }
  .btn--danger:hover:not(:disabled) {
    background: var(--c-danger-hover);
    border-color: var(--c-danger-hover);
  }

  .btn--danger-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--c-danger);
  }
  .btn--danger-ghost:hover:not(:disabled) {
    background: var(--c-danger-light);
    border-color: transparent;
  }

  /* Spinner */
  .btn__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
