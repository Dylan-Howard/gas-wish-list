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
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23F3F3F0" width="400" height="300"/%3E%3Cpath d="M160 130h80v60h-80z" fill="%23E0E0DC" rx="4"/%3E%3Ccircle cx="175" cy="145" r="8" fill="%23D0D0CC"/%3E%3Cpath d="M158 185l30-30 18 20 12-14 24 24" stroke="%23D0D0CC" stroke-width="2" fill="none"/%3E%3C/svg%3E';
</script>

<article class="card">
  <!-- Image -->
  <a href={item.link} target="_blank" rel="noopener noreferrer" class="img-link" tabindex="-1">
    <div class="img-wrap">
      <img
        src={imgError ? PLACEHOLDER : item.imageUrl}
        alt={item.title}
        loading="lazy"
        on:error={() => (imgError = true)}
      />
    </div>
  </a>

  <!-- Body -->
  <div class="body">
    <!-- Tags -->
    {#if item.tags.length > 0}
      <div class="tags">
        {#each item.tags as tag (tag)}
          <Badge {tag} />
        {/each}
      </div>
    {/if}

    <!-- Title & price -->
    <div class="title-row">
      <h2 class="title">
        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
      </h2>
      {#if item.price !== undefined}
        <span class="price">{formatPrice(item.price)}</span>
      {/if}
    </div>

    <!-- Description -->
    <p class="desc">{item.description}</p>

    <!-- Footer -->
    <div class="footer">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        class="link-btn"
        aria-label="View {item.title}"
      >
        View item
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>

      {#if isViewer}
        <Button
          variant="secondary"
          size="sm"
          on:click={() => dispatch('purchase', item)}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M1.5 6l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Purchased
        </Button>
      {/if}
    </div>
  </div>
</article>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition:
      box-shadow var(--transition-base),
      transform var(--transition-base);
  }

  .card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }

  /* Image */
  .img-link { display: block; }

  .img-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--color-bg);
  }

  .img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .card:hover .img-wrap img { transform: scale(1.03); }

  /* Body */
  .body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.3;
    letter-spacing: -0.01em;
    flex: 1;
  }

  .title a {
    text-decoration: none;
    color: inherit;
    transition: color var(--transition-fast);
  }

  .title a:hover { color: var(--color-accent-hover); }

  .price {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }

  .desc {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--color-border);
    margin-top: auto;
    gap: 8px;
  }

  .link-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .link-btn:hover { color: var(--color-text-primary); }
</style>
