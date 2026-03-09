<script lang="ts">
  import { config } from '$lib/config';
  import type { AuthMode } from '$lib/types';

  export let mode: AuthMode;
</script>

<header class="header">
  <div class="inner">
    <div class="brand">
      <h1 class="title">{config.appName}</h1>
      <p class="subtitle">{config.appSubtitle}</p>
    </div>

    <div class="meta">
      {#if mode === 'editor'}
        <span class="badge badge--editor">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M7.5 1.5l2 2L3 10H1v-2L7.5 1.5z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Editing
        </span>
      {:else if mode === 'viewer'}
        <span class="badge badge--viewer">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="5.5" cy="5.5" r="1.8" stroke="currentColor" stroke-width="1.3"/>
            <path
              d="M1 5.5c1.4-2.8 8-2.8 9.5 0C9 8.3 2.5 8.3 1 5.5z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
          Viewing
        </span>
      {/if}
    </div>
  </div>
</header>

<style>
  .header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 32px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: 13px;
    color: var(--color-text-tertiary);
    margin-top: 4px;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    padding-bottom: 4px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    font-size: 11.5px;
    font-weight: 500;
    border-radius: var(--radius-full);
    letter-spacing: 0.03em;
  }

  .badge--editor {
    background: var(--color-accent-light);
    color: var(--color-accent-hover);
    border: 1px solid #fde68a;
  }

  .badge--viewer {
    background: var(--color-bg);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
  }

  @media (max-width: 640px) {
    .inner { padding: 16px 20px; }
    .title { font-size: 22px; }
    .subtitle { display: none; }
  }
</style>
