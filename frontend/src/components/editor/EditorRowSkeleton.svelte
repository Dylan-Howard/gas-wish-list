<li class="row" aria-hidden="true">
  <div class="thumb skeleton"></div>

  <div class="info">
    <span class="skeleton title"></span>
    <div class="tags">
      <span class="skeleton chip"></span>
      <span class="skeleton chip"></span>
    </div>
  </div>

  <span class="skeleton price"></span>
  <span class="skeleton status"></span>
  <div class="actions">
    <span class="skeleton action"></span>
    <span class="skeleton action"></span>
  </div>
</li>

<style>
  .row {
    display: grid;
    grid-template-columns: 56px 1fr 80px 90px 130px;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    list-style: none;
  }

  .thumb {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .title {
    height: 14px;
    width: 60%;
    border-radius: 6px;
  }

  .tags { display: flex; gap: 6px; }

  .chip {
    height: 18px;
    width: 50px;
    border-radius: var(--radius-full);
  }

  .price {
    height: 14px;
    width: 50px;
    border-radius: 6px;
    justify-self: end;
  }

  .status {
    height: 20px;
    width: 70px;
    border-radius: var(--radius-full);
    justify-self: start;
  }

  .actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .action {
    height: 26px;
    width: 56px;
    border-radius: var(--radius-full);
  }

  @media (max-width: 700px) {
    .row {
      grid-template-columns: 48px 1fr auto;
      grid-template-rows: auto auto;
    }
    .price, .status { display: none; }
    .actions { grid-column: 3; grid-row: 1 / 3; }
    .info { grid-column: 2; }
  }
</style>
