(() => {
  'use strict';

  let printing = false;
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

      /* Unnamed A4 rule is a fallback for browsers/printer dialogs that do not
         honor named pages. Named rules below keep mixed portrait/landscape pages. */
      @page { size: A4 portrait; margin: 0; }
      @page epPortrait { size: A4 portrait; margin: 0; }
      @page epLandscape { size: A4 landscape; margin: 0; }

      @media print {
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          transform: none !important;
          zoom: 1 !important;
        }
        .preview-bar {
          display: none !important;
        }
        #printRoot {
          display: block !important;
          width: auto !important;
          min-width: 0 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
          zoom: 1 !important;
        }

        /* The screen preview is already paginated into physical A4 sheets.
           Never let legacy print.css change those sheets back to width/height:auto. */
        #printRoot > .page {
          box-sizing: border-box !important;
          position: relative !important;
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
          flex: none !important;
          box-shadow: none !important;
          overflow: hidden !important;
          transform: none !important;
          zoom: 1 !important;
          break-inside: avoid-page !important;
          page-break-inside: avoid !important;
          break-after: page !important;
          page-break-after: always !important;
        }
        #printRoot > .page.portrait {
          page: epPortrait !important;
          width: 210mm !important;
          min-width: 210mm !important;
          max-width: 210mm !important;
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
        }
        #printRoot > .page.landscape {
          page: epLandscape !important;
          width: 297mm !important;
          min-width: 297mm !important;
          max-width: 297mm !important;
          height: 210mm !important;
          min-height: 210mm !important;
          max-height: 210mm !important;
        }
        #printRoot > .page > .page-inner {
          box-sizing: border-box !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          overflow: hidden !important;
        }
        #printRoot > .page.portrait > .page-inner {
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
        }
        #printRoot > .page.landscape > .page-inner {
          height: 210mm !important;
          min-height: 210mm !important;
          max-height: 210mm !important;
        }
        #printRoot > .page:last-child {
          break-after: auto !important;
          page-break-after: auto !important;
        }

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

  function lockPhysicalSheets() {
    document.querySelectorAll('#printRoot > .page').forEach(page => {
      const landscape = page.classList.contains('landscape');
      const width = landscape ? '297mm' : '210mm';
      const height = landscape ? '210mm' : '297mm';
      const pageName = landscape ? 'epLandscape' : 'epPortrait';

      page.style.setProperty('page', pageName, 'important');
      page.style.setProperty('width', width, 'important');
      page.style.setProperty('min-width', width, 'important');
      page.style.setProperty('max-width', width, 'important');
      page.style.setProperty('height', height, 'important');
      page.style.setProperty('min-height', height, 'important');
      page.style.setProperty('max-height', height, 'important');

      const inner = page.querySelector('.page-inner');
      if (!inner) return;
      inner.style.setProperty('height', height, 'important');
      inner.style.setProperty('min-height', height, 'important');
      inner.style.setProperty('max-height', height, 'important');
    });
  }

  function paginate() {
    if (printing) return;
    installStyles();
    document.querySelectorAll('.page').forEach(splitOverflowingPage);
    lockPhysicalSheets();

    const status = document.getElementById('pageStatus');
    if (status) {
      status.textContent = String(status.textContent || '').replace(
        /\d+\s+halaman/i,
        document.querySelectorAll('#printRoot > .page').length + ' halaman'
      );
      status.dataset.epPaper = 'A4-locked';
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
    if (printing) return;
    restorePages();
    schedulePagination();
  }

  function beginPrint() {
    /* Do not recalculate page breaks under print media. The visible preview is
       the source of truth; only the already-locked A4 sheets are sent to print. */
    printing = true;
    installStyles();
  }

  function endPrint() {
    printing = false;
    schedulePagination();
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

  window.addEventListener('beforeprint', beginPrint);
  window.addEventListener('afterprint', endPrint);
  document.addEventListener('ep-differentiation-ready', restoreThenPaginate);

  const observer = new MutationObserver(() => {
    if (printing) return;
    if (document.querySelector('.page:not([data-ep-print-safe-paginated="1"])')) {
      schedulePagination();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
