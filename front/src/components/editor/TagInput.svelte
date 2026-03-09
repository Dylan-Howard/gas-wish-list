<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TagBadge from '../ui/TagBadge.svelte';

  export let value: string[] = [];
  export let suggestions: string[] = []; // tags from existing items

  const dispatch = createEventDispatcher<{ change: string[] }>();

  let inputValue = '';
  let showSuggestions = false;

  $: filteredSuggestions = suggestions.filter(s =>
    !value.includes(s) &&
    s.toLowerCase().includes(inputValue.toLowerCase()) &&
    inputValue.trim().length > 0
  );

  function addTag(tag: string) {
    const cleaned = tag.trim().toLowerCase().replace(/[^a-z0-9\-_ ]/g, '');
    if (!cleaned || value.includes(cleaned)) return;
    dispatch('change', [...value, cleaned]);
    inputValue = '';
    showSuggestions = false;
  }

  function removeTag(tag: string) {
    dispatch('change', value.filter(t => t !== tag));
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      showSuggestions = false;
    }
  }

  function handleBlur() {
    if (inputValue.trim()) addTag(inputValue);
    setTimeout(() => { showSuggestions = false; }, 150);
  }
</script>

<div class="tag-input">
  <div class="tag-input__field" class:tag-input__field--focused={showSuggestions}>
    {#each value as tag (tag)}
      <TagBadge {tag} removable on:remove={() => removeTag(tag)} />
    {/each}
    <input
      class="tag-input__text"
      type="text"
      placeholder={value.length === 0 ? 'Add tags (Enter or comma)…' : ''}
      bind:value={inputValue}
      on:keydown={handleKeydown}
      on:focus={() => { showSuggestions = true; }}
      on:blur={handleBlur}
      aria-label="Add tag"
      autocomplete="off"
    />
  </div>

  {#if showSuggestions && filteredSuggestions.length > 0}
    <ul class="tag-input__suggestions" role="listbox">
      {#each filteredSuggestions as s (s)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li
          class="tag-input__suggestion"
          role="option"
          aria-selected="false"
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
  }

  .tag-input__field {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px;
    min-height: 40px;
    padding: 6px var(--sp-3);
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    cursor: text;
    transition: border-color var(--t-fast);
  }

  .tag-input__field--focused,
  .tag-input__field:focus-within {
    border-color: var(--c-accent);
    outline: none;
  }

  .tag-input__text {
    flex: 1;
    min-width: 120px;
    border: none;
    background: transparent;
    font-size: 0.875rem;
    color: var(--c-text-primary);
    outline: none;
    font-family: var(--font-ui);
    padding: 1px 0;
  }

  .tag-input__text::placeholder {
    color: var(--c-text-muted);
  }

  .tag-input__suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    box-shadow: var(--shadow-md);
    list-style: none;
    padding: var(--sp-1);
    z-index: 50;
    max-height: 160px;
    overflow-y: auto;
  }

  .tag-input__suggestion {
    padding: var(--sp-2) var(--sp-3);
    font-size: 0.875rem;
    color: var(--c-text-primary);
    border-radius: 3px;
    cursor: pointer;
    transition: background var(--t-fast);
  }

  .tag-input__suggestion:hover {
    background: var(--c-bg);
  }
</style>
