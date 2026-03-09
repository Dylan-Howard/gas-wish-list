<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WishItem } from '../../lib/types';
  import TagBadge from '../ui/TagBadge.svelte';
  import { formatPrice } from '../../lib/utils';

  export let item: WishItem;

  const dispatch = createEventDispatcher<{ purchase: WishItem }>();

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23F0F0EE'/%3E%3Cpath d='M30 32h20v16H30zM34 28v4M46 28v4' stroke='%23C8C8C4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

  function handleImageError(e: Event) {
    (e.target as HTMLImageElement).src = PLACEHOLDER;
  }

  $: priceLabel = formatPrice(item.price, item.currency);
</script>

<article class="row">
  <!-- Thumbnail -->
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    class="row__thumb-link"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="row__thumb">
      <img
        src={item.imageUrl || PLACEHOLDER}
        alt={item.title}
        class="row__thumb-img"
        loading="lazy"
        on:error={handleImageError}
      />
    </div>
  </a>

  <!-- Main content -->
  <div class="row__content">
    <div class="row__header">
      {#if item.tags.length > 0}
        <div class="row__tags">
          {#each item.tags.slice(0, 5) as tag (tag)}
            <TagBadge {tag} />
          {/each}
          {#if item.tags.length > 5}
            <span class="row__tags-more">+{item.tags.length - 5}</span>
          {/if}
        </div>
      {/if}
    </div>

    <h3 class="row__title">
      <a href={item.link} target="_blank" rel="noopener noreferrer" class="row__title-link">
        {item.title}
      </a>
    </h3>

    {#if item.description}
      <p class="row__desc truncate">{item.description}</p>
    {/if}
  </div>

  <!-- Right side: price + actions -->
  <div class="row__aside">
    {#if priceLabel}
      <span class="row__price">{priceLabel}</span>
    {/if}

    <div class="row__actions">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        class="row__action-btn"
        aria-label="View {item.title} online"
        title="View item"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13h8A1.5 1.5 0 0 0 12 11.5V8M8.5 1H13m0 0v4.5M13 1L6 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>

      <button
        class="row__action-btn row__action-btn--purchase"
        on:click={() => dispatch('purchase', item)}
        aria-label="Mark {item.title} as purchased"
        title="Mark as purchased"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1.5 7l4 4 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</article>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-md);
    padding: var(--sp-3) var(--sp-4);
    transition: box-shadow var(--t-fast), border-color var(--t-fast);
  }

  .row:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--c-border-strong);
  }

  /* Thumbnail */
  .row__thumb-link { flex-shrink: 0; }

  .row__thumb {
    width: 64px;
    height: 64px;
    border-radius: var(--r-sm);
    overflow: hidden;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
  }

  .row__thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Content */
  .row__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .row__header { display: flex; align-items: center; gap: var(--sp-2); }

  .row__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .row__tags-more {
    font-size: 0.7rem;
    color: var(--c-text-muted);
    align-self: center;
  }

  .row__title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1.3;
  }

  .row__title-link {
    color: inherit;
    text-decoration: none;
  }

  .row__title-link:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .row__desc {
    font-size: 0.8125rem;
    color: var(--c-text-secondary);
  }

  /* Aside */
  .row__aside {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--sp-2);
  }

  .row__price {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    color: var(--c-accent);
    white-space: nowrap;
  }

  .row__actions {
    display: flex;
    gap: var(--sp-1);
  }

  .row__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    background: none;
    cursor: pointer;
    color: var(--c-text-secondary);
    transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
    text-decoration: none;
  }

  .row__action-btn:hover {
    background: var(--c-bg);
    border-color: var(--c-border-strong);
    color: var(--c-text-primary);
  }

  .row__action-btn--purchase:hover {
    background: var(--c-accent-light);
    border-color: var(--c-accent);
    color: var(--c-accent);
  }

  .row__action-btn:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }

  @media (max-width: 480px) {
    .row__thumb { width: 52px; height: 52px; }
    .row__aside { display: none; }
  }
</style>
