<script lang="ts">
  import Badge from '$components/ui/Badge.svelte';
  import { filterConfig } from '$lib/stores';

  export let allTags: string[] = [];

  function toggleTag(tag: string) {
    filterConfig.update((f) => {
      const already = f.tags.includes(tag);
      return {
        ...f,
        tags: already ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
      };
    });
  }

  function clearAll() {
    filterConfig.update((f) => ({ ...f, tags: [] }));
  }
</script>

{#if allTags.length > 0}
  <div class="tag-filter" role="group" aria-label="Filter by tag">
    <span class="label">Filter</span>
    <div class="chips">
      <button
        class="chip-all"
        class:chip-all--active={$filterConfig.tags.length === 0}
        type="button"
        on:click={clearAll}
      >
        All
      </button>
      {#each allTags as tag (tag)}
        <Badge
          {tag}
          clickable
          active={$filterConfig.tags.includes(tag)}
          on:click={() => toggleTag(tag)}
        />
      {/each}
    </div>
  </div>
{/if}

<style>
  .tag-filter {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .chip-all {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    font-size: 11.5px;
    font-weight: 500;
    font-family: var(--font-body);
    border-radius: var(--radius-full);
    background: var(--color-bg);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all var(--transition-fast);
    line-height: 1.4;
  }

  .chip-all:hover {
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
  }

  .chip-all--active {
    background: var(--color-text-primary);
    color: #fff;
    border-color: var(--color-text-primary);
  }
</style>
