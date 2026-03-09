<article class="card" aria-hidden="true">
  <div class="img-wrap skeleton"></div>

  <div class="body">
    <div class="tags">
      <span class="skeleton chip"></span>
      <span class="skeleton chip"></span>
    </div>

    <div class="title-row">
      <span class="skeleton title"></span>
      <span class="skeleton price"></span>
    </div>

    <div class="lines">
      <span class="skeleton line"></span>
      <span class="skeleton line"></span>
      <span class="skeleton line line--short"></span>
    </div>

    <div class="footer">
      <span class="skeleton btn"></span>
      <span class="skeleton btn"></span>
    </div>
  </div>
</article>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .img-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
  }

  .body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tags {
    display: flex;
    gap: 6px;
  }

  .chip {
    height: 18px;
    width: 52px;
    border-radius: var(--radius-full);
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .title {
    height: 16px;
    width: 60%;
    border-radius: 6px;
  }

  .price {
    height: 16px;
    width: 52px;
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

  .line--short { width: 70%; }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid var(--color-border);
    margin-top: 2px;
  }

  .btn {
    height: 24px;
    width: 88px;
    border-radius: var(--radius-full);
  }
</style>
