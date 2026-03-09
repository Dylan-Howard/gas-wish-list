<article class="row" aria-hidden="true">
  <div class="thumb skeleton"></div>

  <div class="content">
    <div class="top">
      <div class="meta">
        <div class="tags">
          <span class="skeleton chip"></span>
          <span class="skeleton chip"></span>
        </div>
        <span class="skeleton title"></span>
        <div class="lines">
          <span class="skeleton line"></span>
          <span class="skeleton line line--short"></span>
        </div>
      </div>

      <div class="right">
        <span class="skeleton price"></span>
        <span class="skeleton link"></span>
      </div>
    </div>

    <div class="purchase-row">
      <span class="skeleton button"></span>
    </div>
  </div>
</article>

<style>
  .row {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    gap: 0;
    overflow: hidden;
  }

  .thumb {
    width: 120px;
    min-height: 120px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tags { display: flex; gap: 6px; }

  .chip {
    height: 18px;
    width: 54px;
    border-radius: var(--radius-full);
  }

  .title {
    height: 16px;
    width: 55%;
    border-radius: 6px;
  }

  .lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .line {
    height: 10px;
    width: 100%;
    border-radius: 6px;
  }

  .line--short { width: 72%; }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .price {
    height: 16px;
    width: 60px;
    border-radius: 6px;
  }

  .link {
    height: 12px;
    width: 70px;
    border-radius: 6px;
  }

  .purchase-row {
    display: flex;
    justify-content: flex-start;
  }

  .button {
    height: 28px;
    width: 140px;
    border-radius: var(--radius-full);
  }

  @media (max-width: 520px) {
    .thumb { width: 90px; min-height: 90px; }
    .right { display: none; }
  }
</style>
