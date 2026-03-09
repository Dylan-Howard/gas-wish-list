<script lang="ts">
  import { config } from '$lib/config';
</script>

<div class="page">
  <div class="card">
    <div class="icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    </div>
    <h1 class="title">{config.appName}</h1>
    <p class="msg">
      This wish list is private. You'll need a link with a valid access token to view it.
    </p>
    <p class="hint">
      If you were sent a link, make sure you're using the full URL including the
      <code>?viewToken=…</code> parameter.
    </p>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--color-bg);
  }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: 48px 40px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .icon {
    width: 56px;
    height: 56px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .msg {
    font-size: 14.5px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .hint {
    font-size: 12.5px;
    color: var(--color-text-tertiary);
    line-height: 1.6;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    text-align: left;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 11.5px;
    background: var(--color-border);
    padding: 1px 5px;
    border-radius: 3px;
  }
</style>
