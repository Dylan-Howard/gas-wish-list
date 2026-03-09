<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getTagColor } from '$lib/utils';

  export let tag: string;
  export let removable = false;
  export let active = false;
  export let clickable = false;

  const dispatch = createEventDispatcher<{ click: void; remove: void }>();

  $: colors = getTagColor(tag);
</script>

{#if clickable}
  <button
    class="badge badge--clickable"
    class:badge--active={active}
    style="
      --tag-bg:     {colors.bg};
      --tag-text:   {colors.text};
      --tag-border: {colors.border};
    "
    on:click={() => dispatch('click')}
    type="button"
  >
    {tag}
    {#if removable}
      <button
        class="badge-remove"
        type="button"
        on:click|stopPropagation={() => dispatch('remove')}
        aria-label="Remove {tag}"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            d="M1 1l7 7M8 1L1 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    {/if}
  </button>
{:else}
  <span
    class="badge"
    class:badge--active={active}
    style="
      --tag-bg:     {colors.bg};
      --tag-text:   {colors.text};
      --tag-border: {colors.border};
    "
  >
    {tag}
    {#if removable}
      <button
        class="badge-remove"
        type="button"
        on:click|stopPropagation={() => dispatch('remove')}
        aria-label="Remove {tag}"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            d="M1 1l7 7M8 1L1 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    {/if}
  </span>
{/if}

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.02em;
    border-radius: var(--radius-full);
    background: var(--tag-bg);
    color: var(--tag-text);
    border: 1px solid var(--tag-border);
    transition: all var(--transition-fast);
    white-space: nowrap;
    user-select: none;
    line-height: 1.4;
    font-family: inherit;
  }

  .badge--clickable { cursor: pointer; }
  .badge--clickable:hover { filter: brightness(0.95); }

  .badge--active {
    outline: 2px solid var(--tag-text);
    outline-offset: 1px;
  }

  .badge-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 1px;
    color: var(--tag-text);
    opacity: 0.55;
    transition: opacity var(--transition-fast);
    border-radius: 50%;
    line-height: 0;
  }

  .badge-remove:hover { opacity: 1; }
</style>
