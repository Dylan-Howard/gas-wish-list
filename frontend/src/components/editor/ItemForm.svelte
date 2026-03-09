<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Input from '$components/ui/Input.svelte';
  import Textarea from '$components/ui/Textarea.svelte';
  import Button from '$components/ui/Button.svelte';
  import TagInput from './TagInput.svelte';
  import { generateId } from '$lib/utils';
  import type { WishItem } from '$lib/types';

  export let item: WishItem | null = null; // null = new item

  const dispatch = createEventDispatcher<{ save: WishItem; cancel: void }>();

  // Form state
  let title       = item?.title       ?? '';
  let description = item?.description ?? '';
  let imageUrl    = item?.imageUrl    ?? '';
  let link        = item?.link        ?? '';
  let price       = item?.price !== undefined ? String(item.price) : '';
  let tags        = [...(item?.tags ?? [])];

  // Validation
  let errors: Record<string, string> = {};
  let saving = false;

  function validate(): boolean {
    errors = {};
    if (!title.trim())    errors.title    = 'Title is required';
    if (!link.trim())     errors.link     = 'Link is required';
    if (!imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    if (price && isNaN(Number(price))) errors.price = 'Price must be a number';
    return Object.keys(errors).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    saving = true;

    const saved: WishItem = {
      id:          item?.id         ?? generateId(),
      title:       title.trim(),
      description: description.trim(),
      imageUrl:    imageUrl.trim(),
      link:        link.trim(),
      price:       price ? Number(price) : undefined,
      tags,
      purchased:   item?.purchased  ?? false,
      createdAt:   item?.createdAt  ?? new Date().toISOString(),
      sortOrder:   item?.sortOrder  ?? Date.now(),
    };

    dispatch('save', saved);
    saving = false;
  }

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }
</script>

<form class="form" on:submit|preventDefault={onSubmit} novalidate>
  <div class="fields">
    <Input
      label="Title"
      bind:value={title}
      placeholder="e.g. AirPods Pro"
      required
      error={errors.title}
    />

    <Input
      label="Product link"
      type="url"
      bind:value={link}
      placeholder="https://..."
      required
      error={errors.link}
    />

    <Input
      label="Image URL"
      type="url"
      bind:value={imageUrl}
      placeholder="https://..."
      required
      error={errors.imageUrl}
      hint="Direct URL to a product photo (JPG/PNG/WebP)"
    />

    <Input
      label="Price"
      type="number"
      bind:value={price}
      placeholder="e.g. 99.99"
      error={errors.price}
      hint="Optional — leave blank if you'd rather not show a price"
    />

    <Textarea
      label="Description"
      bind:value={description}
      placeholder="A brief description of why you want this…"
      rows={3}
    />

    <TagInput bind:value={tags} />
  </div>

  <!-- Preview -->
  {#if imageUrl}
    <div class="preview">
      <span class="preview-label">Image preview</span>
      <img src={imageUrl} alt="Preview" on:error={handleImageError} />
    </div>
  {/if}

  <!-- Actions -->
  <div class="actions">
    <Button type="button" variant="ghost" on:click={() => dispatch('cancel')}>
      Cancel
    </Button>
    <Button type="submit" variant="primary" loading={saving}>
      {item ? 'Save changes' : 'Add item'}
    </Button>
  </div>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .preview-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .preview img {
    width: 100%;
    max-height: 160px;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid var(--color-border);
  }
</style>
