<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Badge from '$components/ui/Badge.svelte';
  import Button from '$components/ui/Button.svelte';
  import { formatPrice } from '$lib/utils';
  import type { WishItem } from '$lib/types';

  export let item: WishItem;
  export let isViewer = true;

  const dispatch = createEventDispatcher<{ purchase: WishItem }>();

  let imgError = false;
  const PLACEHOLDER =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23F3F3F0" width="200" height="200"/%3E%3Cpath d="M70 80h60v50H70z" fill="%23E0E0DC"/%3E%3Ccircle cx="85" cy="95" r="8" fill="%23D0D0CC"/%3E%3Cpath d="M68 128l25-25 15 17 10-12 20 20" stroke="%23D0D0CC" stroke-width="2" fill="none"/%3E%3C/svg%3E';
</script>

<article class="row">
  <!-- Thumbnail -->
  <a href={item.link} target="_blank" rel="noopener noreferrer" class="thumb-link" tabindex="-1">
    <div class="thumb">
      <img
        src={imgError ? PLACEHOLDER : item.imageUrl}
        alt={item.title}
        loading="lazy"
        on:error={() => (imgError = true)}
      />
    </div>
  </a>

  <!-- Content -->
  <div class="content">
    <div class="top">
      <div class="meta">
        {#if item.tags.length > 0}
          <div class="tags">
            {#each item.tags as tag (tag)}
              <Badge {tag} />
            {/each}
          </div>
        {/if}
        <h2 class="title">
          <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
        </h2>
        <p class="desc">{item.description}</p>
      </div>

      <div class="right">
        {#if item.price !== undefined}
          <span class="price">{formatPrice(item.price)}</span>
        {/if}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          class="link-btn"
          aria-label="View {item.title}"
        >
          View item
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1.5 8.5L8.5 1.5M8.5 1.5H4M8.5 1.5v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>

    {#if isViewer}
      <div class="purchase-row">
        <Button variant="secondary" size="sm" on:click={() => dispatch('purchase', item)}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 5.5l2.8 2.8L9 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Mark as purchased
        </Button>
      </div>
    {/if}
  </div>
</article>

<style>
  .row {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    gap: 0;
    overflow: hidden;
    transition:
      box-shadow var(--transition-base),
      border-color var(--transition-base);
  }

  .row:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-strong);
  }

  /* Thumbnail */
  .thumb-link { display: block; flex-shrink: 0; }

  .thumb {
    width: 120px;
    height: 100%;
    min-height: 120px;
    background: var(--color-bg);
    overflow: hidden;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  .row:hover .thumb img { transform: scale(1.04); }

  /* Content */
  .content {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .top {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .title a {
    text-decoration: none;
    color: inherit;
    transition: color var(--transition-fast);
  }

  .title a:hover { color: var(--color-accent-hover); }

  .desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .price {
    font-size: 17px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .link-btn:hover { color: var(--color-text-primary); }

  .purchase-row {
    display: flex;
    justify-content: flex-start;
  }

  @media (max-width: 520px) {
    .thumb { width: 90px; min-height: 90px; }
    .right { display: none; }
  }
</style>
