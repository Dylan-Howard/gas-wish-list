<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let fullWidth = false;
</script>

<button
  {type}
  disabled={disabled || loading}
  class="btn btn--{variant} btn--{size}"
  class:btn--full={fullWidth}
  on:click
  {...$$restProps}
>
  {#if loading}
    <span class="btn-spinner" aria-hidden="true" />
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: var(--font-body);
    font-weight: 500;
    letter-spacing: 0.01em;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    line-height: 1;
    position: relative;
    text-decoration: none;
    outline: none;
  }

  .btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn--full { width: 100%; }

  .btn--sm { padding: 6px 12px;  font-size: 12.5px; }
  .btn--md { padding: 9px 16px;  font-size: 13.5px; }
  .btn--lg { padding: 12px 22px; font-size: 15px; }

  /* Variants */
  .btn--primary {
    background: var(--color-text-primary);
    color: #fff;
    border-color: var(--color-text-primary);
  }
  .btn--primary:hover:not(:disabled) { background: #333; border-color: #333; }

  .btn--secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }
  .btn--secondary:hover:not(:disabled) {
    background: var(--color-bg);
    border-color: var(--color-border-strong);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text-secondary);
    border-color: transparent;
  }
  .btn--ghost:hover:not(:disabled) {
    background: var(--color-bg);
    color: var(--color-text-primary);
  }

  .btn--accent {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
  }
  .btn--accent:hover:not(:disabled) {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .btn--danger {
    background: var(--color-danger-light);
    color: var(--color-danger);
    border-color: #fca5a5;
  }
  .btn--danger:hover:not(:disabled) { background: #fecaca; }

  /* Spinner */
  .btn-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
