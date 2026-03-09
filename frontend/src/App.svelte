<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$components/layout/Header.svelte';
  import ViewerPage from '$components/viewer/ViewerPage.svelte';
  import EditorPage from '$components/editor/EditorPage.svelte';
  import UnauthorizedPage from '$components/layout/UnauthorizedPage.svelte';
  import ToastContainer from '$components/ui/ToastContainer.svelte';
  import { authMode, loadItems } from '$lib/stores';
  import { getActiveToken } from '$lib/auth';

  onMount(() => {
    loadItems();
  });

  const hasToken = Boolean(getActiveToken());
</script>

{#if !hasToken}
  <UnauthorizedPage />

{:else}
  <Header mode={$authMode} />

  <main>
    {#if $authMode === 'editor'}
      <!-- Editor gets both pages: viewer (read-only) + editor panel -->
      <div class="editor-layout">
        <div class="editor-pane">
          <EditorPage />
        </div>
        <aside class="preview-pane">
          <div class="preview-label">Live preview</div>
          <ViewerPage isViewer={false} />
        </aside>
      </div>

    {:else}
      <!-- Viewer gets the viewer page with purchase button -->
      <ViewerPage isViewer={true} />
    {/if}
  </main>
{/if}

<ToastContainer />

<style>
  main {
    min-height: calc(100vh - 73px);
  }

  /* Editor shows a side-by-side: editor panel | live preview */
  .editor-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 73px);
    border-top: 1px solid var(--color-border);
  }

  .editor-pane {
    border-right: 1px solid var(--color-border);
    overflow-y: auto;
  }

  .preview-pane {
    background: var(--color-bg);
    overflow-y: auto;
    position: relative;
  }

  .preview-label {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    padding: 10px 32px;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* On smaller screens, stack vertically */
  @media (max-width: 900px) {
    .editor-layout {
      grid-template-columns: 1fr;
    }

    .editor-pane { border-right: none; }

    .preview-pane {
      border-top: 1px solid var(--color-border);
    }
  }
</style>
