<script lang="ts">
  export let title: string = 'Nothing here yet';
  export let message: string = '';
</script>

<div class="empty">
  <div class="empty__icon" aria-hidden="true">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="var(--c-border-strong)" stroke-width="2" fill="var(--c-bg)"/>
      <path d="M16 20h16M16 26h10" stroke="var(--c-border-strong)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="10" r="8" fill="var(--c-accent-light)" stroke="var(--c-accent)" stroke-width="1.5"/>
      <path d="M36 7v6M33 10h6" stroke="var(--c-accent)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </div>
  <h3 class="empty__title">{title}</h3>
  {#if message}
    <p class="empty__msg">{message}</p>
  {/if}
  <slot />
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-3);
    padding: var(--sp-16) var(--sp-8);
    text-align: center;
    color: var(--c-text-muted);
  }

  .empty__icon {
    opacity: 0.7;
    margin-bottom: var(--sp-2);
  }

  .empty__title {
    font-family: var(--font-display);
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--c-text-secondary);
  }

  .empty__msg {
    font-size: 0.9rem;
    line-height: 1.6;
    max-width: 340px;
    color: var(--c-text-muted);
  }
</style>
