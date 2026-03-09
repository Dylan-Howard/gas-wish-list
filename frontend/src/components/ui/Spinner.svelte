<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color = 'currentColor';
</script>

<span
  class="spinner spinner--{size}"
  style="--c: {color};"
  role="status"
  aria-label="Loading…"
>
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="var(--c)" stroke-width="2" opacity="0.15" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="var(--c)"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</span>

<style>
  .spinner {
    display: inline-flex;
    animation: spin 0.75s linear infinite;
    flex-shrink: 0;
  }

  .spinner--sm { width: 16px; height: 16px; }
  .spinner--md { width: 24px; height: 24px; }
  .spinner--lg { width: 36px; height: 36px; }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
