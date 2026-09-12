(() => {
  'use strict';

  const PROCESSED = 'epPrintSafePaginated';
  const SAFE_SOURCE_CLASS = 'ep-print-safe-meeting';
  const CONTINUATION_CLASS = 'ep-supervision-continuation';

  function installStyles() {
    if (document.getElementById('ep-print-safe-page-style')) return;
    const style = document.createElement('style');
    style.id = 'ep-print-safe-page-style';
    style.textContent = `
      .${CONTINUATION_CLASS} .page-inner {
        padding: 13mm 14mm 13mm !important;
      }
      .${CONTINUATION_CLASS} .topline {
        padding-bottom: 3mm;
        margin-bottom: 5mm;
      }
      .${CONTINUATION_CLASS} .tbl {
        margin-top: 0 !important;
      }
      @media print {
        .ep-supervision-meeting,
        .${SAFE_SOURCE_CLASS},
        .${CONTINUATION_CLASS} {
          break-after: page !important;
          page-break-after: always !important;
        }
        .ep-supervision-meeting .page-inner,
        .${SAFE_SOURCE_CLASS} .page-inner,
        .${CONTINUATION_CLASS} .page-inner {
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
          overflow: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isLearningStepsTable(table) {
    const heading = table.querySelector('thead');
    return Boolean(heading && /Fase\s*\/\s*Kegiatan/i.test(heading.textContent || ''));
  }

  function needsMoreRoom(page) {
    const inner = page.querySelector('.page-inner');
    if (!inner) return false;
    const table = [...inner.querySelectorAll('table')].find(isLearningStepsTable);
    const footer = inner.querySelector('.page-foot');
    if (!table || !footer) return false;
    const tableBottom = table.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().top;
    return tableBottom > footerTop - 14 || inner.scrollHeight > inner.clientHeight + 1;
  }

  function continuationPage(sourcePage, sourceTable, rows, sequence) {
    const page = document.createElement('section');
    page.className = `page portrait ${CONTINUATION_CLASS}`;
    page.dataset.epContinuation = String(sequence);

    const inner = document.createElement('div');
    inner.className = 'page-inner';

    const originalTopline = sourcePage.querySelector('.topline');
    const topline = originalTopline ? originalTopline.cloneNode(true) : document.createElement('div');
    topline.classList.add('topline');
    const firstLabel = topline.querySelector('span');
    if (firstLabel) firstLabel.textContent = 'RANCANGAN PERTEMUAN · LANJUTAN';

    const table = sourceTable.cloneNode(false);
    const thead = sourceTable.querySelector('thead');
    if (thead) table.appendChild(thead.cloneNode(true));
    const tbody = document.createElement('tbody');
    rows.forEach(row => tbody.appendChild(row));
    table.appendChild(tbody);

    const originalFooter = sourcePage.querySelector('.page-foot');
    const footer = originalFooter ? originalFooter.cloneNode(true) : document.createElement('div');
    footer.classList.add('page-foot');

    inner.append(topline, table, footer);
    page.appendChild(inner);
    return page;
  }

  function splitOverflowingPage(page) {
    if (page.dataset[PROCESSED] === '1') return;
    page.dataset[PROCESSED] = '1';

    const sourceTable = [...page.querySelectorAll('.page-inner > table')].find(isLearningStepsTable);
    const sourceBody = sourceTable && sourceTable.querySelector('tbody');
    if (!sourceTable || !sourceBody) return;
    page.classList.add(SAFE_SOURCE_CLASS);
    if (!needsMoreRoom(page)) return;

    const movedRows = [];
    while (sourceBody.rows.length > 1 && needsMoreRoom(page)) {
      const row = sourceBody.lastElementChild;
      movedRows.unshift(row);
      row.remove();
    }
    if (!movedRows.length) return;

    let currentRows = movedRows;
    let anchor = page;
    let sequence = 1;

    while (currentRows.length) {
      const continuation = continuationPage(page, sourceTable, currentRows, sequence);
      anchor.insertAdjacentElement('afterend', continuation);

      const continuationBody = continuation.querySelector('tbody');
      const spill = [];
      while (continuationBody.rows.length > 1 && needsMoreRoom(continuation)) {
        const row = continuationBody.lastElementChild;
        spill.unshift(row);
        row.remove();
      }

      anchor = continuation;
      currentRows = spill;
      sequence += 1;
    }
  }

  function paginate() {
    installStyles();
    document.querySelectorAll('.page').forEach(splitOverflowingPage);
    const status = document.getElementById('pageStatus');
    if (status) {
      status.textContent = String(status.textContent || '').replace(
        /\d+\s+halaman/i,
        document.querySelectorAll('.page').length + ' halaman'
      );
    }
  }

  function schedulePagination() {
    requestAnimationFrame(() => requestAnimationFrame(paginate));
  }

  function restorePages() {
    document.querySelectorAll(`.${SAFE_SOURCE_CLASS}:not(.${CONTINUATION_CLASS}), .ep-supervision-meeting:not(.${CONTINUATION_CLASS})`).forEach(page => {
      const sourceTable = [...page.querySelectorAll('.page-inner > table')].find(isLearningStepsTable);
      const sourceBody = sourceTable && sourceTable.querySelector('tbody');
      if (!sourceBody) return;

      let next = page.nextElementSibling;
      while (next && next.classList.contains(CONTINUATION_CLASS)) {
        const body = [...next.querySelectorAll('.page-inner > table')]
          .find(isLearningStepsTable)?.querySelector('tbody');
        if (body) [...body.rows].forEach(row => sourceBody.appendChild(row));
        const obsolete = next;
        next = next.nextElementSibling;
        obsolete.remove();
      }
      delete page.dataset[PROCESSED];
    });
  }

  function restoreThenPaginate() {
    restorePages();
    schedulePagination();
  }

  function restoreAndPaginateNow() {
    restorePages();
    paginate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedulePagination, { once: true });
  } else {
    schedulePagination();
  }
  window.addEventListener('load', () => {
    schedulePagination();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(restoreThenPaginate);
    }
    setTimeout(restoreThenPaginate, 1800);
  }, { once: true });
  window.addEventListener('beforeprint', restoreAndPaginateNow);
  document.addEventListener('ep-differentiation-ready', restoreThenPaginate);

  const observer = new MutationObserver(() => {
    if (document.querySelector('.page:not([data-ep-print-safe-paginated="1"])')) {
      schedulePagination();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
