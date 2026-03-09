<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WishItem } from '../../lib/types';
  import TagBadge from '../ui/TagBadge.svelte';
  import { formatPrice } from '../../lib/utils';

  export let item: WishItem;

  const dispatch = createEventDispatcher<{ purchase: WishItem }>();

  const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F0F0EE'/%3E%3Cpath d='M160 130h80v40h-80zM180 120v10M220 120v10M165 170l70-40M235 170l-70-40' stroke='%23C8C8C4' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

  function handleImageError(e: Event) {
    (e.target as HTMLImageElement).src = PLACEHOLDER;
  }

  $: priceLabel = formatPrice(item.price, item.currency);
</script>

<article class="card">
  <!-- Image -->
  <a
    href={item.link}
    target="_blank"
    rel="noopener noreferrer"
    class="card__image-link"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="card__image-wrap">
      <img
        src={item.imageUrl || PLACEHOLDER}
        alt={item.title}
        class="card__image"
        loading="lazy"
        on:error={handleImageError}
      />
    </div>
  </a>

  <!-- Body -->
  <div class="card__body">
    <!-- Tags -->
    {#if item.tags.length > 0}
      <div class="card__tags">
        {#each item.tags.slice(0, 4) as tag (tag)}
          <TagBadge {tag} />
        {/each}
        {#if item.tags.length > 4}
          <span class="card__tags-more">+{item.tags.length - 4}</span>
        {/if}
      </div>
    {/if}

    <!-- Title -->
    <h3 class="card__title">
      <a href={item.link} target="_blank" rel="noopener noreferrer" class="card__title-link">
        {item.title}
      </a>
    </h3>

    <!-- Description -->
    {#if item.description}
      <p class="card__desc line-clamp-2">{item.description}</p>
    {/if}

    <!-- Price -->
    {#if priceLabel}
      <p class="card__price">{priceLabel}</p>
    {/if}
  </div>

  <!-- Footer actions -->
  <div class="card__footer">
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      class="card__link-btn"
      aria-label="View {item.title} online"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M5.5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7.5M8 1h4m0 0v4m0-4L5.5 7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      View item
    </a>

    <button
      class="card__purchase-btn"
      on:click={() => dispatch('purchase', item)}
      aria-label="Mark {item.title} as purchased"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M1 6.5l4 4 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Purchased
    </button>
  </div>
</article>

<style>
  .card {
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow var(--t-base), border-color var(--t-base), transform var(--t-base);
  }

  .card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--c-border-strong);
    transform: translateY(-2px);
  }

  /* Image */
  .card__image-link { display: block; }

  .card__image-wrap {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--c-bg);
  }

  .card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .card:hover .card__image {
    transform: scale(1.04);
  }

  /* Body */
  .card__body {
    padding: var(--sp-4);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
  }

  .card__tags-more {
    font-size: 0.7rem;
    color: var(--c-text-muted);
    align-self: center;
  }

  .card__title {
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1.3;
    margin-top: var(--sp-1);
  }

  .card__title-link {
    color: inherit;
    text-decoration: none;
  }

  .card__title-link:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .card__desc {
    font-size: 0.875rem;
    color: var(--c-text-secondary);
    line-height: 1.5;
  }

  .card__price {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--c-accent);
    margin-top: auto;
    padding-top: var(--sp-2);
    font-family: var(--font-display);
  }

  /* Footer */
  .card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--sp-3) var(--sp-4);
    border-top: 1px solid var(--c-border);
    gap: var(--sp-2);
  }

  .card__link-btn,
  .card__purchase-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1);
    font-size: 0.8125rem;
    font-weight: 500;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--r-sm);
    padding: var(--sp-1) var(--sp-2);
    transition: background var(--t-fast), color var(--t-fast);
    font-family: var(--font-ui);
    text-decoration: none;
  }

  .card__link-btn {
    color: var(--c-text-secondary);
  }

  .card__link-btn:hover {
    color: var(--c-text-primary);
    background: var(--c-bg);
    text-decoration: none;
  }

  .card__purchase-btn {
    color: var(--c-accent);
  }

  .card__purchase-btn:hover {
    background: var(--c-accent-light);
  }

  .card__link-btn:focus-visible,
  .card__purchase-btn:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }
</style>
