<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import type { WishItem, WishItemDraft } from '../../lib/types';
  import { generateId, now } from '../../lib/utils';
  import { config } from '../../config';
  import TagInput from './TagInput.svelte';
  import Button from '../ui/Button.svelte';

  export let open: boolean = false;
  export let item: WishItem | null = null; // null = add mode
  export let existingTags: string[] = [];
  export let saving: boolean = false;

  const dispatch = createEventDispatcher<{
    save: WishItem;
    cancel: void;
  }>();

  // ── Form state ──────────────────────────────────────────────────────────────
  let title = '';
  let description = '';
  let imageUrl = '';
  let link = '';
  let priceStr = '';
  let currency = config.defaultCurrency;
  let tags: string[] = [];
  let errors: Record<string, string> = {};

  // Populate fields when item prop changes
  $: if (open) {
    title       = item?.title       ?? '';
    description = item?.description ?? '';
    imageUrl    = item?.imageUrl    ?? '';
    link        = item?.link        ?? '';
    priceStr    = item?.price != null ? String(item.price) : '';
    currency    = item?.currency    ?? config.defaultCurrency;
    tags        = item ? [...item.tags] : [];
    errors      = {};
    // Focus first field after render
    tick().then(() => titleInput?.focus());
  }

  let titleInput: HTMLInputElement;

  $: isEdit = item !== null;
  $: modalTitle = isEdit ? 'Edit Item' : 'Add New Item';

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    errors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!link.trim()) errors.link = 'Link is required.';
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      errors.link = 'Link must start with http:// or https://';
    }
    if (priceStr && isNaN(parseFloat(priceStr))) {
      errors.price = 'Price must be a number.';
    }
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const price = priceStr.trim() ? parseFloat(priceStr) : undefined;
    const ts = now();

    const saved: WishItem = {
      id:          item?.id       ?? generateId(),
      createdAt:   item?.createdAt ?? ts,
      purchased:   item?.purchased ?? false,
      updatedAt:   ts,
      title:       title.trim(),
      description: description.trim(),
      imageUrl:    imageUrl.trim(),
      link:        link.trim(),
      currency,
      tags,
      ...(price !== undefined ? { price } : {}),
    };

    dispatch('save', saved);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') dispatch('cancel');
  }

  const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="backdrop"
    on:click={() => dispatch('cancel')}
    transition:fade={{ duration: 200 }}
  />

  <!-- Modal -->
  <div
    class="modal-wrap"
    role="dialog"
    aria-modal="true"
    aria-labelledby="form-modal-title"
  >
    <div
      class="modal"
      transition:fly={{ y: 24, duration: 280 }}
    >
      <!-- Header -->
      <div class="modal__header">
        <h2 id="form-modal-title" class="modal__title">{modalTitle}</h2>
        <button
          class="modal__close"
          on:click={() => dispatch('cancel')}
          aria-label="Close dialog"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form class="form" on:submit|preventDefault={handleSubmit} novalidate>
        <div class="form__grid">
          <!-- Title -->
          <div class="field field--full">
            <label class="field__label" for="f-title">Title <span class="field__required">*</span></label>
            <input
              id="f-title"
              class="field__input"
              class:field__input--error={errors.title}
              type="text"
              bind:value={title}
              bind:this={titleInput}
              placeholder="e.g. Blue Le Creuset Dutch Oven"
              maxlength="200"
              autocomplete="off"
            />
            {#if errors.title}<p class="field__error">{errors.title}</p>{/if}
          </div>

          <!-- Link -->
          <div class="field field--full">
            <label class="field__label" for="f-link">Link <span class="field__required">*</span></label>
            <input
              id="f-link"
              class="field__input"
              class:field__input--error={errors.link}
              type="url"
              bind:value={link}
              placeholder="https://amazon.com/..."
              autocomplete="off"
            />
            {#if errors.link}<p class="field__error">{errors.link}</p>{/if}
          </div>

          <!-- Description -->
          <div class="field field--full">
            <label class="field__label" for="f-desc">Description</label>
            <textarea
              id="f-desc"
              class="field__input field__textarea"
              bind:value={description}
              rows="3"
              placeholder="A short note about this item…"
              maxlength="500"
            />
          </div>

          <!-- Image URL -->
          <div class="field field--full">
            <label class="field__label" for="f-image">Image URL</label>
            <input
              id="f-image"
              class="field__input"
              type="url"
              bind:value={imageUrl}
              placeholder="https://…/image.jpg"
              autocomplete="off"
            />
          </div>

          <!-- Price + Currency -->
          <div class="field">
            <label class="field__label" for="f-price">Price (optional)</label>
            <input
              id="f-price"
              class="field__input"
              class:field__input--error={errors.price}
              type="text"
              inputmode="decimal"
              bind:value={priceStr}
              placeholder="0.00"
            />
            {#if errors.price}<p class="field__error">{errors.price}</p>{/if}
          </div>

          <div class="field">
            <label class="field__label" for="f-currency">Currency</label>
            <select id="f-currency" class="field__input field__select" bind:value={currency}>
              {#each CURRENCIES as c}
                <option value={c}>{c}</option>
              {/each}
            </select>
          </div>

          <!-- Tags -->
          <div class="field field--full">
            <label class="field__label" for="f-tags">Tags</label>
            <TagInput
              value={tags}
              suggestions={existingTags}
              on:change={(e) => { tags = e.detail; }}
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="modal__actions">
          <Button variant="secondary" type="button" on:click={() => dispatch('cancel')} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 100;
    backdrop-filter: blur(2px);
  }

  .modal-wrap {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 101;
    padding: var(--sp-4);
    pointer-events: none;
  }

  .modal {
    background: var(--c-surface);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-dialog);
    width: 100%;
    max-width: 560px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    pointer-events: all;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--sp-5) var(--sp-6);
    border-bottom: 1px solid var(--c-border);
    position: sticky;
    top: 0;
    background: var(--c-surface);
    z-index: 1;
    border-radius: var(--r-xl) var(--r-xl) 0 0;
  }

  .modal__title {
    font-family: var(--font-display);
    font-size: 1.375rem;
    color: var(--c-text-primary);
  }

  .modal__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--c-text-muted);
    border-radius: var(--r-sm);
    transition: background var(--t-fast), color var(--t-fast);
    padding: 0;
  }

  .modal__close:hover {
    background: var(--c-bg);
    color: var(--c-text-primary);
  }

  .modal__close:focus-visible {
    outline: 2px solid var(--c-accent);
    outline-offset: 1px;
  }

  /* Form */
  .form {
    padding: var(--sp-6);
    display: flex;
    flex-direction: column;
    gap: var(--sp-5);
  }

  .form__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1);
  }

  .field--full {
    grid-column: 1 / -1;
  }

  .field__label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--c-text-secondary);
  }

  .field__required {
    color: var(--c-danger);
    margin-left: 2px;
  }

  .field__input {
    height: 40px;
    padding: 0 var(--sp-3);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-sm);
    font-size: 0.875rem;
    color: var(--c-text-primary);
    background: var(--c-surface);
    transition: border-color var(--t-fast);
    font-family: var(--font-ui);
  }

  .field__input:focus {
    outline: none;
    border-color: var(--c-accent);
  }

  .field__input--error {
    border-color: var(--c-danger);
  }

  .field__input--error:focus {
    border-color: var(--c-danger);
    box-shadow: 0 0 0 3px var(--c-danger-light);
  }

  .field__textarea {
    height: auto;
    padding: var(--sp-2) var(--sp-3);
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }

  .field__select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239C9C98' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
    cursor: pointer;
  }

  .field__error {
    font-size: 0.8rem;
    color: var(--c-danger);
  }

  .modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--sp-3);
    padding-top: var(--sp-2);
    border-top: 1px solid var(--c-border);
    margin-top: var(--sp-2);
  }
</style>
