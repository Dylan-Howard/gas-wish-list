<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import type { AppMode } from './lib/types';
  import { getAppMode } from './lib/auth';

  import ViewerPage       from './pages/ViewerPage.svelte';
  import EditorPage       from './pages/EditorPage.svelte';
  import UnauthorizedPage from './pages/UnauthorizedPage.svelte';
  import ToastContainer   from './components/ui/ToastContainer.svelte';

  let mode: AppMode = 'loading';

  onMount(() => {
    mode = getAppMode();
  });
</script>

{#if mode === 'loading'}
  <!-- brief flash prevention — empty during SSR guard -->
  <div />

{:else if mode === 'viewer'}
  <div in:fade={{ duration: 200 }}>
    <ViewerPage />
  </div>

{:else if mode === 'editor'}
  <div in:fade={{ duration: 200 }}>
    <!-- Editor mode banner -->
    <div class="editor-banner" role="banner">
      <span class="editor-banner__dot" aria-hidden="true" />
      Editor mode — changes are saved to your Google Sheet
    </div>
    <EditorPage />
  </div>

{:else}
  <UnauthorizedPage />
{/if}

<ToastContainer />

<style>
  /* Editor mode indicator strip */
  .editor-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--c-accent);
    color: var(--c-accent-fg);
    font-size: 0.8125rem;
    font-weight: 500;
    padding: 6px var(--sp-4);
    letter-spacing: 0.01em;
  }

  .editor-banner__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c-accent-light);
    flex-shrink: 0;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
</style>
