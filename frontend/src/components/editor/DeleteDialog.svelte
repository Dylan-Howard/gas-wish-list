<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Dialog from '$components/ui/Dialog.svelte';
  import Button from '$components/ui/Button.svelte';
  import type { WishItem } from '$lib/types';

  export let item: WishItem | null = null;
  export let open = false;

  let deleting = false;
  const dispatch = createEventDispatcher<{ confirm: string; cancel: void }>();

  $: if (!open) deleting = false;
</script>

<Dialog {open} title="Delete item?" maxWidth="420px" on:close={() => dispatch('cancel')}>
  {#if item}
    <div class="body">
      <p class="msg">
        Are you sure you want to delete <strong>{item.title}</strong>?
        This cannot be undone.
      </p>
      <div class="actions">
        <Button variant="secondary" on:click={() => dispatch('cancel')}>Cancel</Button>
        <Button
          variant="danger"
          loading={deleting}
          on:click={() => {
            deleting = true;
            dispatch('confirm', item?.id ?? '');
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  {/if}
</Dialog>

<style>
  .body { display: flex; flex-direction: column; gap: 20px; }
  .msg  { font-size: 14.5px; color: var(--color-text-secondary); line-height: 1.6; }
  .msg strong { color: var(--color-text-primary); font-weight: 500; }
  .actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
