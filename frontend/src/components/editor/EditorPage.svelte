<script lang="ts">
  import { onMount } from 'svelte';
  import EditorRow from './EditorRow.svelte';
  import ItemForm from './ItemForm.svelte';
  import DeleteDialog from './DeleteDialog.svelte';
  import Dialog from '$components/ui/Dialog.svelte';
  import Button from '$components/ui/Button.svelte';
  import Spinner from '$components/ui/Spinner.svelte';
  import ErrorMessage from '$components/ui/ErrorMessage.svelte';
  import { items, loading, error, loadItems, saveItem, deleteItem } from '$lib/stores';
  import type { WishItem } from '$lib/types';

  // Dialog state
  let editTarget:   WishItem | null = null;
  let deleteTarget: WishItem | null = null;
  let formOpen   = false;
  let deleteOpen = false;

  onMount(() => {
    loadItems();
  });

  function openNew() {
    editTarget = null;
    formOpen   = true;
  }

  function openEdit(item: WishItem) {
    editTarget = item;
    formOpen   = true;
  }

  function openDelete(item: WishItem) {
    deleteTarget = item;
    deleteOpen   = true;
  }

  async function onSave(e: CustomEvent<WishItem>) {
    const ok = await saveItem(e.detail);
    if (ok) {
      formOpen   = false;
      editTarget = null;
    }
  }

  async function onDeleteConfirm(e: CustomEvent<string>) {
    deleteOpen = false;
    await deleteItem(e.detail);
    deleteTarget = null;
  }

  $: sortedItems = [...$items].sort((a, b) => a.sortOrder - b.sortOrder);
</script>

<div class="page">
  <!-- Page header -->
  <div class="page-header">
    <div>
      <h2 class="page-title">Manage Items</h2>
      <p class="page-sub">{$items.length} {$items.length === 1 ? 'item' : 'items'} total</p>
    </div>
    <Button variant="primary" on:click={openNew}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
      Add item
    </Button>
  </div>

  <!-- States -->
  {#if $loading}
    <div class="state">
      <Spinner size="lg" />
      <p>Loading…</p>
    </div>

  {:else if $error}
    <ErrorMessage
      title="Unable to load items"
      message={$error}
      showRetry={true}
      on:retry={loadItems}
    />

  {:else if sortedItems.length === 0}
    <div class="empty">
      <p class="empty-title">No items yet</p>
      <p class="empty-sub">Add your first wish list item to get started.</p>
      <Button variant="accent" on:click={openNew}>Add first item</Button>
    </div>

  {:else}
    <!-- Column headers -->
    <div class="col-headers" aria-hidden="true">
      <span></span>
      <span>Item</span>
      <span class="align-right">Price</span>
      <span>Status</span>
      <span></span>
    </div>

    <ul class="item-list" role="list">
      {#each sortedItems as item (item.id)}
        <EditorRow
          {item}
          on:edit={(e) => openEdit(e.detail)}
          on:delete={(e) => openDelete(e.detail)}
        />
      {/each}
    </ul>
  {/if}
</div>

<!-- Add / Edit dialog -->
<Dialog
  open={formOpen}
  title={editTarget ? 'Edit item' : 'Add new item'}
  maxWidth="560px"
  on:close={() => (formOpen = false)}
>
  <ItemForm
    item={editTarget}
    on:save={onSave}
    on:cancel={() => (formOpen = false)}
  />
</Dialog>

<!-- Delete confirmation dialog -->
<DeleteDialog
  item={deleteTarget}
  open={deleteOpen}
  on:confirm={onDeleteConfirm}
  on:cancel={() => (deleteOpen = false)}
/>

<style>
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 32px 64px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .page-sub {
    font-size: 13px;
    color: var(--color-text-tertiary);
    margin-top: 3px;
  }

  .col-headers {
    display: grid;
    grid-template-columns: 56px 1fr 80px 90px 130px;
    gap: 16px;
    padding: 0 16px 8px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .align-right { text-align: right; }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
  }

  /* States */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 20px;
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 80px 20px;
    text-align: center;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--color-text-secondary);
  }

  .empty-sub {
    font-size: 14px;
    color: var(--color-text-tertiary);
    margin-bottom: 8px;
  }

  @media (max-width: 700px) {
    .page { padding: 20px 16px 48px; }
    .col-headers { display: none; }
  }
</style>
