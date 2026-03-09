<script lang="ts">
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let error = '';
  export let hint = '';
  export let required = false;
  export let disabled = false;
  export let rows = 3;

  const uid = `textarea-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="field">
  {#if label}
    <label class="label" for={uid}>
      {label}
      {#if required}<span class="required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <textarea
    id={uid}
    {placeholder}
    {required}
    {disabled}
    {rows}
    bind:value
    class="textarea"
    class:textarea--error={!!error}
    on:input
    on:change
    on:blur
    on:focus
    {...$$restProps}
  />

  {#if error}
    <p class="field-error" role="alert">{error}</p>
  {:else if hint}
    <p class="field-hint">{hint}</p>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .required { color: var(--color-danger); margin-left: 3px; }

  .textarea {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    resize: vertical;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    outline: none;
    line-height: 1.5;
    min-height: 80px;
  }

  .textarea::placeholder { color: var(--color-text-tertiary); }

  .textarea:focus {
    border-color: var(--color-text-primary);
    box-shadow: 0 0 0 3px rgba(28, 28, 26, 0.08);
  }

  .textarea--error { border-color: var(--color-danger); }

  .textarea:disabled {
    background: var(--color-bg);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .field-error {
    font-size: 12px;
    color: var(--color-danger);
  }

  .field-hint {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
</style>
