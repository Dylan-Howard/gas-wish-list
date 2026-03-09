<script lang="ts">
  import Badge from '$components/ui/Badge.svelte';
  import { allTags as suggestedTags } from '$lib/stores';

  export let value: string[] = [];

  let inputVal = '';
  let showSuggestions = false;

  $: suggestions = $suggestedTags.filter(
    (t) => !value.includes(t) && t.toLowerCase().includes(inputVal.toLowerCase().trim())
  );

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (t && !value.includes(t)) {
      value = [...value, t];
    }
    inputVal = '';
    showSuggestions = false;
  }

  function removeTag(tag: string) {
    value = value.filter((t) => t !== tag);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputVal.trim()) addTag(inputVal);
    }
    if (e.key === 'Backspace' && !inputVal && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
    if (e.key === 'Escape') showSuggestions = false;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="tag-input" on:focusin={() => (showSuggestions = true)}>
  <div class="field">
    <label class="label" for="tag-input-field">Tags</label>
    <div class="input-wrap">
      {#each value as tag (tag)}
        <Badge {tag} removable on:remove={() => removeTag(tag)} />
      {/each}
      <input
        id="tag-input-field"
        type="text"
        class="input"
        placeholder={value.length === 0 ? 'Add tags…' : ''}
        bind:value={inputVal}
        on:keydown={onKeydown}
        on:blur={() => setTimeout(() => (showSuggestions = false), 150)}
        autocomplete="off"
        aria-haspopup="listbox"
      />
    </div>
    <p class="hint">Press Enter or comma to add a tag</p>
  </div>

  <!-- Suggestions -->
  {#if showSuggestions && suggestions.length > 0}
    <ul class="suggestions" role="listbox" aria-label="Tag suggestions">
      {#each suggestions as s (s)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li
          role="option"
          aria-selected="false"
          class="suggestion"
          on:mousedown|preventDefault={() => addTag(s)}
        >
          {s}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tag-input {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

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

  .input-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 7px 10px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    min-height: 40px;
    cursor: text;
  }

  .input-wrap:focus-within {
    border-color: var(--color-text-primary);
    box-shadow: 0 0 0 3px rgba(28, 28, 26, 0.08);
  }

  .input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-family: var(--font-body);
    color: var(--color-text-primary);
    min-width: 80px;
    flex: 1;
    padding: 1px 0;
  }

  .input::placeholder { color: var(--color-text-tertiary); }

  .hint {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }

  .suggestions {
    position: absolute;
    top: calc(100% - 4px);
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    list-style: none;
    overflow: hidden;
    max-height: 200px;
    overflow-y: auto;
  }

  .suggestion {
    padding: 9px 13px;
    font-size: 13.5px;
    cursor: pointer;
    color: var(--color-text-primary);
    transition: background var(--transition-fast);
  }

  .suggestion:hover { background: var(--color-bg); }
</style>
