<script lang="ts">
  export let size: number = 32;
  export let label: string = 'Loading…';
</script>

<div class="spinner-wrap" role="status" aria-label={label}>
  <svg
    class="spinner"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12" cy="12" r="9"
      stroke="var(--c-border)"
      stroke-width="2"
    />
    <path
      d="M12 3a9 9 0 0 1 9 9"
      stroke="var(--c-accent)"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
  <span class="visually-hidden">{label}</span>
</div>

<style>
  .spinner-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
