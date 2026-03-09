<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import {
    items, allTags,
    isLoading, loadError,
    addToast,
  } from '../lib/store';
  import { api } from '../lib/api';
  import type { WishItem } from '../lib/types';
  import { config } from '../config';

  import EditorItemCard from '../components/editor/EditorItemCard.svelte';
  import ItemFormModal  from '../components/editor/ItemFormModal.svelte';
  import ConfirmDialog  from '../components/ui/ConfirmDialog.svelte';
  import Button         from '../components/ui/Button.svelte';
  import LoadingSpinner from '../components/ui/LoadingSpinner.svelte';
  import EmptyState     from '../components/ui/EmptyState.svelte';

  // ── Form modal state ────────────────────────────────────────────────────────
  let formOpen = false;
  let editingItem: WishItem | null = null;
  let saving = false;

  function openAddModal() {
    editingItem = null;
    formOpen = true;
  }

  function openEditModal(item: WishItem) {
    editingItem = item;
    formOpen = true;
  }

  function closeForm() {
    formOpen = false;
    editingItem = null;
  }

  async function handleSave(e: CustomEvent<WishItem>) {
    saving = true;
    try {
      const saved = await api.saveItem(e.detail);
      items.update(all => {
        const idx = all.findIndex(i => i.id === saved.id);
        if (idx >= 0) {
          const updated = [...all];
          updated[idx] = saved;
          return updated;
        }
        return [...all, saved];
      });
      addToast(editingItem ? 'Item updated.' : 'Item added to your wish list!', 'success');
      closeForm();
    } catch (err) {
      addToast('Could not save item. Please try again.', 'error');
    } finally {
      saving = false;
    }
  }

  // ── Delete state ─────────────────────────────────────────────────────────────
  let deleteOpen = false;
  let deletingItem: WishItem | null = null;
  let deleting = false;

  function openDeleteDialog(item: WishItem) {
    deletingItem = item;
    deleteOpen = true;
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    deleting = true;
    try {
      await api.deleteItem(deletingItem.id);
      items.update(all => all.filter(i => i.id !== deletingItem!.id));
      addToast(`"${deletingItem.title}" deleted.`, 'info');
    } catch (err) {
      addToast('Could not delete item. Please try again.', 'error');
    } finally {
      deleting = false;
      deleteOpen = false;
      deletingItem = null;
    }
  }

  function cancelDelete() {
    deleteOpen = false;
    deletingItem = null;
  }

  // ── Load data ───────────────────────────────────────────────────────────────
  onMount(async () => {
    isLoading.set(true);
    loadError.set(null);
    try {
      const data = await api.getItems();
      items.set(data);
    } catch (e) {
      loadError.set(e instanceof Error ? e.message : 'Failed to load.');
      addToast('Could not load items.', 'error');
    } finally {
      isLoading.set(false);
    }
  });

  // ── Search ──────────────────────────────────────────────────────────────────
  let search = '';
  $: filteredItems = $items.filter(item =>
    !search || item.title.toLowerCase().includes(search.toLowerCase())
  );
</script>

<div class="page">
  <!-- ── Header ────────────────────────────────────────────────────────────── -->
  <header class="page-header">
    <div class="page-header__left">
      <p class="page-header__eyebrow">Editing</p>
      <h1 class="page-header__title">{config.listTitle}</h1>
    </div>
    <Button variant="primary" on:click={openAddModal}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      Add item
    </Button>
  </header>

  <!-- ── Search bar ────────────────────────────────────────────────────────── -->
  <div class="search-wrap">
    <span class="search-wrap__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M10 10l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
    </span>
    <input
      class="search-input"
      type="search"
      placeholder="Search items…"
      bind:value={search}
      aria-label="Search items"
    />
    <span class="search-wrap__count" aria-live="polite">
      {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
    </span>
  </div>

  <!-- ── Content ───────────────────────────────────────────────────────────── -->
  <main class="content">
    {#if $isLoading}
      <div class="state-center">
        <LoadingSpinner size={36} />
        <p class="state-label">Loading…</p>
      </div>

    {:else if $loadError}
      <EmptyState title="Could not load items" message={$loadError}>
        <Button variant="secondary" on:click={() => location.reload()}>
          Retry
        </Button>
      </EmptyState>

    {:else if filteredItems.length === 0 && $items.length === 0}
      <EmptyState
        title="No items yet"
        message="Start building your wish list by adding your first item."
      >
        <Button variant="primary" on:click={openAddModal}>
          Add your first item
        </Button>
      </EmptyState>

    {:else if filteredItems.length === 0}
      <EmptyState title="No matches" message="Try a different search term." />

    {:else}
      <div class="grid" role="list">
        {#each filteredItems as item (item.id)}
          <div role="listitem" animate:flip={{ duration: 280 }} in:fade={{ duration: 200 }}>
            <EditorItemCard
              {item}
              on:edit={(e) => openEditModal(e.detail)}
              on:delete={(e) => openDeleteDialog(e.detail)}
            />
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- ── Item Form Modal ──────────────────────────────────────────────────────── -->
<ItemFormModal
  open={formOpen}
  item={editingItem}
  existingTags={$allTags}
  {saving}
  on:save={handleSave}
  on:cancel={closeForm}
/>

<!-- ── Delete Confirm ───────────────────────────────────────────────────────── -->
<ConfirmDialog
  open={deleteOpen}
  title="Delete this item?"
  message={deletingItem ? `"${deletingItem.title}" will be permanently removed from your wish list.` : ''}
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="danger"
  loading={deleting}
  on:confirm={confirmDelete}
  on:cancel={cancelDelete}
/>

<style>
  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--sp-8) var(--sp-6);
    display: flex;
    flex-direction: column;
    gap: var(--sp-5);
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--sp-4);
    padding-bottom: var(--sp-5);
    border-bottom: 1.5px solid var(--c-border);
  }

  .page-header__eyebrow {
    font-size: 0.875rem;
    color: var(--c-text-muted);
    font-weight: 400;
    letter-spacing: 0.02em;
    margin-bottom: 2px;
  }

  .page-header__title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1;
  }

  /* Search */
  .search-wrap {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
  }

  .search-wrap__icon {
    position: absolute;
    pointer-events: none;
    color: var(--c-text-muted);
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
  }

  .search-input {
    position: relative;
    flex: 1;
    max-width: 320px;
    height: 36px;
    padding: 0 var(--sp-3) 0 36px;
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    font-size: 0.875rem;
    color: var(--c-text-primary);
    background: var(--c-surface);
    font-family: var(--font-ui);
    transition: border-color var(--t-fast);
    /* hack: the icon is absolute but input is block, use background image instead */
    background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6' cy='6' r='4.5' stroke='%239C9C98' stroke-width='1.4'/%3E%3Cpath d='M10 10l2.5 2.5' stroke='%239C9C98' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 10px center;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--c-accent);
  }

  .search-input::placeholder { color: var(--c-text-muted); }

  .search-wrap__count {
    font-size: 0.8125rem;
    color: var(--c-text-muted);
    margin-left: auto;
  }

  /* Content */
  .content { min-height: 300px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--sp-5);
  }

  .state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--sp-16) 0;
    gap: var(--sp-3);
  }

  .state-label {
    font-size: 0.875rem;
    color: var(--c-text-muted);
  }

  @media (max-width: 640px) {
    .page { padding: var(--sp-5) var(--sp-4); }
    .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--sp-3); }
  }
</style>
