<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Dialog from '$components/ui/Dialog.svelte';
  import Button from '$components/ui/Button.svelte';
  import type { WishItem } from '$lib/types';

  export let item: WishItem | null = null;
  export let open = false;

  let confirming = false;
  const dispatch = createEventDispatcher<{ confirm: string; cancel: void }>();

  async function confirm() {
    if (!item) return;
    confirming = true;
    dispatch('confirm', item.id);
  }

  function cancel() {
    dispatch('cancel');
  }

  // Reset state when dialog closes
  $: if (!open) confirming = false;
</script>

<Dialog {open} title="Mark as purchased?" on:close={cancel}>
  {#if item}
    <div class="body">
      <p class="message">
        Let <strong>{item.title}</strong> be marked as purchased? This will hide it
        from the list so others know not to buy it too.
      </p>

      <div class="actions">
        <Button variant="secondary" on:click={cancel}>Cancel</Button>
        <Button variant="accent" loading={confirming} on:click={confirm}>
          Yes, mark purchased
        </Button>
      </div>
    </div>
  {/if}
</Dialog>

<style>
  .body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .message {
    font-size: 14.5px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .message strong {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
