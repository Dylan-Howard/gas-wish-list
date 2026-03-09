<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Badge from '$components/ui/Badge.svelte';
  import Button from '$components/ui/Button.svelte';
  import { formatPrice } from '$lib/utils';
  import type { WishItem } from '$lib/types';

  export let item: WishItem;

  const dispatch = createEventDispatcher<{ edit: WishItem; delete: WishItem }>();

  let imgError = false;
  const PLACEHOLDER =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23F3F3F0" width="80" height="80"/%3E%3C/svg%3E';
</script>

<li class="row" class:row--purchased={item.purchased}>
  <img
    class="thumb"
    src={imgError ? PLACEHOLDER : item.imageUrl}
    alt={item.title}
    loading="lazy"
    on:error={() => (imgError = true)}
  />

  <div class="info">
    <span class="title">{item.title}</span>
    <div class="tags">
      {#each item.tags as tag (tag)}
        <Badge {tag} />
      {/each}
    </div>
  </div>

  {#if item.price !== undefined}
    <span class="price">{formatPrice(item.price)}</span>
  {:else}
    <span class="price price--empty">—</span>
  {/if}

  <span class="status" class:status--purchased={item.purchased}>
    {item.purchased ? 'Purchased' : 'Available'}
  </span>

  <div class="actions">
    <Button variant="ghost" size="sm" on:click={() => dispatch('edit', item)}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M8.5 1.5l2 2L3 11H1v-2L8.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Edit
    </Button>
    <Button variant="ghost" size="sm" on:click={() => dispatch('delete', item)}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1.5 3h9M4 3V2h4v1M5 5.5v4M7 5.5v4M2 3l.7 7.3A1 1 0 003.7 11h4.6a1 1 0 001-.9L10 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Delete
    </Button>
  </div>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: 56px 1fr 80px 90px 130px;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: box-shadow var(--transition-fast);
    list-style: none;
  }

  .row:hover { box-shadow: var(--shadow-sm); }

  .row--purchased { opacity: 0.5; }

  .thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    background: var(--color-bg);
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .price {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    text-align: right;
  }

  .price--empty { color: var(--color-text-tertiary); font-weight: 400; }

  .status {
    font-size: 12px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background: var(--color-success-light);
    color: var(--color-success);
    border: 1px solid #a7f3d0;
    text-align: center;
    white-space: nowrap;
  }

  .status--purchased {
    background: var(--color-bg);
    color: var(--color-text-tertiary);
    border-color: var(--color-border);
  }

  .actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
  }

  @media (max-width: 700px) {
    .row {
      grid-template-columns: 48px 1fr auto;
      grid-template-rows: auto auto;
    }
    .price, .status { display: none; }
    .actions { grid-column: 3; grid-row: 1 / 3; }
    .info { grid-column: 2; }
  }
</style>
