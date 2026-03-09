<script lang="ts">
  import { toasts, removeToast } from '$lib/stores';
  import Toast from './Toast.svelte';
</script>

<div class="toast-container">
  {#each $toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      on:close={() => removeToast(toast.id)}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .toast-container {
      bottom: 16px;
      right: 16px;
      left: 16px;
    }
  }
</style>
