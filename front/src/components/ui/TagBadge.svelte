<script lang="ts">
  import { getTagColor } from '../../lib/utils';
  import { createEventDispatcher } from 'svelte';

  export let tag: string;
  export let removable: boolean = false;
  export let interactive: boolean = false; // clickable filter chip
  export let active: boolean = false;      // selected state for filter chips

  const dispatch = createEventDispatcher<{ remove: string; click: string }>();

  $: color = getTagColor(tag);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  class="tag"
  class:tag--interactive={interactive}
  class:tag--active={active}
  style="
    --tag-bg: {active ? color.text : color.bg};
    --tag-text: {active ? '#fff' : color.text};
    --tag-border: {color.border};
  "
  on:click={interactive ? () => dispatch('click', tag) : undefined}
  role={interactive ? 'button' : undefined}
  tabindex={interactive ? 0 : undefined}
  on:keydown={interactive
    ? (e) => e.key === 'Enter' && dispatch('click', tag)
    : undefined}
  title={tag}
>
  {tag}
  {#if removable}
    <button
      class="tag__remove"
      aria-label="Remove tag {tag}"
      on:click|stopPropagation={() => dispatch('remove', tag)}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  {/if}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 9px;
    background: var(--tag-bg);
    color: var(--tag-text);
    border: 1px solid var(--tag-border);
    border-radius: var(--r-full);
    font-size: 0.75rem;
    font-weight: 500;
    font-family: var(--font-ui);
    line-height: 1.6;
    white-space: nowrap;
    transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
  }

  .tag--interactive {
    cursor: pointer;
    user-select: none;
  }

  .tag--interactive:hover {
    filter: brightness(0.95);
  }

  .tag--interactive:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }

  .tag__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    opacity: 0.7;
    border-radius: 50%;
    transition: opacity var(--t-fast), background var(--t-fast);
    margin-left: 1px;
  }

  .tag__remove:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }
</style>
