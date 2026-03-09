<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WishItem } from '../../lib/types';
  import TagBadge from '../ui/TagBadge.svelte';
  import { formatPrice } from '../../lib/utils';

  export let item: WishItem;

  const dispatch = createEventDispatcher<{
    edit: WishItem;
    delete: WishItem;
  }>();

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F0F0EE'/%3E%3Cpath d='M160 130h80v40h-80zM180 120v10M220 120v10' stroke='%23C8C8C4' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

  function handleImageError(e: Event) {
    (e.target as HTMLImageElement).src = PLACEHOLDER;
  }

  $: priceLabel = formatPrice(item.price, item.currency);
</script>

<article class="ecard">
  <!-- Action bar overlay -->
  <div class="ecard__actions">
    <button
      class="ecard__action-btn"
      on:click={() => dispatch('edit', item)}
      aria-label="Edit {item.title}"
      title="Edit item"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M8 3l2 2" stroke="currentColor" stroke-width="1.3"/>
      </svg>
      Edit
    </button>
    <button
      class="ecard__action-btn ecard__action-btn--danger"
      on:click={() => dispatch('delete', item)}
      aria-label="Delete {item.title}"
      title="Delete item"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M10.5 3.5l-.5 7a1 1 0 0 1-1 .9H4a1 1 0 0 1-1-.9l-.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Delete
    </button>
  </div>

  <!-- Image -->
  <div class="ecard__image-wrap">
    <img
      src={item.imageUrl || PLACEHOLDER}
      alt={item.title}
      class="ecard__image"
      loading="lazy"
      on:error={handleImageError}
    />
  </div>

  <!-- Body -->
  <div class="ecard__body">
    {#if item.tags.length > 0}
      <div class="ecard__tags">
        {#each item.tags.slice(0, 4) as tag (tag)}
          <TagBadge {tag} />
        {/each}
        {#if item.tags.length > 4}
          <span class="ecard__tags-more">+{item.tags.length - 4}</span>
        {/if}
      </div>
    {/if}

    <h3 class="ecard__title">{item.title}</h3>

    {#if item.description}
      <p class="ecard__desc line-clamp-2">{item.description}</p>
    {/if}

    {#if priceLabel}
      <p class="ecard__price">{priceLabel}</p>
    {/if}
  </div>
</article>

<style>
  .ecard {
    position: relative;
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow var(--t-base), border-color var(--t-base);
  }

  .ecard:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--c-border-strong);
  }

  /* Action bar */
  .ecard__actions {
    position: absolute;
    top: var(--sp-2);
    right: var(--sp-2);
    display: flex;
    gap: var(--sp-1);
    z-index: 2;
    opacity: 0;
    transition: opacity var(--t-base);
  }

  .ecard:hover .ecard__actions,
  .ecard:focus-within .ecard__actions {
    opacity: 1;
  }

  .ecard__action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    font-size: 0.75rem;
    font-weight: 500;
    font-family: var(--font-ui);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    background: var(--c-surface);
    cursor: pointer;
    color: var(--c-text-secondary);
    box-shadow: var(--shadow-sm);
    transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
  }

  .ecard__action-btn:hover {
    background: var(--c-bg);
    color: var(--c-text-primary);
    border-color: var(--c-border-strong);
  }

  .ecard__action-btn--danger:hover {
    background: var(--c-danger-light);
    color: var(--c-danger);
    border-color: #F2C4C4;
  }

  .ecard__action-btn:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }

  /* Image */
  .ecard__image-wrap {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--c-bg);
  }

  .ecard__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Body */
  .ecard__body {
    padding: var(--sp-4);
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
    flex: 1;
  }

  .ecard__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
  }

  .ecard__tags-more {
    font-size: 0.7rem;
    color: var(--c-text-muted);
    align-self: center;
  }

  .ecard__title {
    font-family: var(--font-display);
    font-size: 1.075rem;
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1.3;
  }

  .ecard__desc {
    font-size: 0.85rem;
    color: var(--c-text-secondary);
    line-height: 1.5;
  }

  .ecard__price {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    color: var(--c-accent);
    margin-top: auto;
    padding-top: var(--sp-1);
  }
</style>
