<script lang="ts">
  export let label = '';
  export let value: string | number = '';
  export let type: 'text' | 'number' | 'url' | 'email' = 'text';
  export let placeholder = '';
  export let error = '';
  export let hint = '';
  export let required = false;
  export let disabled = false;

  // Generate a stable unique id for label association
  const uid = `input-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="field">
  {#if label}
    <label class="label" for={uid}>
      {label}
      {#if required}<span class="required" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  {#if type === 'number'}
    <input
      id={uid}
      type="number"
      {placeholder}
      {required}
      {disabled}
      bind:value
      class="input"
      class:input--error={!!error}
      on:input
      on:change
      on:blur
      on:focus
      {...$$restProps}
    />
  {:else if type === 'url'}
    <input
      id={uid}
      type="url"
      {placeholder}
      {required}
      {disabled}
      bind:value
      class="input"
      class:input--error={!!error}
      on:input
      on:change
      on:blur
      on:focus
      {...$$restProps}
    />
  {:else if type === 'email'}
    <input
      id={uid}
      type="email"
      {placeholder}
      {required}
      {disabled}
      bind:value
      class="input"
      class:input--error={!!error}
      on:input
      on:change
      on:blur
      on:focus
      {...$$restProps}
    />
  {:else}
    <input
      id={uid}
      type="text"
      {placeholder}
      {required}
      {disabled}
      bind:value
      class="input"
      class:input--error={!!error}
      on:input
      on:change
      on:blur
      on:focus
      {...$$restProps}
    />
  {/if}

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
    letter-spacing: 0.01em;
  }

  .required {
    color: var(--color-danger);
    margin-left: 3px;
  }

  .input {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    outline: none;
    appearance: none;
  }

  .input::placeholder { color: var(--color-text-tertiary); }

  .input:focus {
    border-color: var(--color-text-primary);
    box-shadow: 0 0 0 3px rgba(28, 28, 26, 0.08);
  }

  .input--error { border-color: var(--color-danger); }
  .input--error:focus { box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08); }

  .input:disabled {
    background: var(--color-bg);
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Remove spinner arrows from number inputs */
  .input[type='number'] {
    -moz-appearance: textfield;
  }
  .input[type='number']::-webkit-outer-spin-button,
  .input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
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
