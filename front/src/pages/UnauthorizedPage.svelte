<script lang="ts">
  import { config } from '../config';
</script>

<div class="unauth">
  <div class="unauth__card">
    <div class="unauth__icon" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="10" y="18" width="20" height="16" rx="2" stroke="var(--c-border-strong)" stroke-width="2" fill="var(--c-bg)"/>
        <path d="M14 18v-5a6 6 0 0 1 12 0v5" stroke="var(--c-border-strong)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="20" cy="26" r="2" fill="var(--c-text-muted)"/>
        <path d="M20 28v3" stroke="var(--c-text-muted)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>

    <h1 class="unauth__title">{config.listTitle}</h1>
    <p class="unauth__message">
      This wish list is private. You'll need a valid access link to view it.
    </p>
    <p class="unauth__hint">
      Ask {config.listOwner} to share the link with you.
    </p>
  </div>
</div>

<style>
  .unauth {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--sp-8);
    background: var(--c-bg);
  }

  .unauth__card {
    background: var(--c-surface);
    border: 1.5px solid var(--c-border);
    border-radius: var(--r-xl);
    padding: var(--sp-12) var(--sp-10);
    max-width: 440px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-4);
    box-shadow: var(--shadow-sm);
  }

  .unauth__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--c-bg);
    border: 1.5px solid var(--c-border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--sp-2);
  }

  .unauth__title {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--c-text-primary);
    line-height: 1.2;
  }

  .unauth__message {
    font-size: 0.9375rem;
    color: var(--c-text-secondary);
    line-height: 1.6;
    max-width: 320px;
  }

  .unauth__hint {
    font-size: 0.8125rem;
    color: var(--c-text-muted);
    font-style: italic;
  }
</style>
