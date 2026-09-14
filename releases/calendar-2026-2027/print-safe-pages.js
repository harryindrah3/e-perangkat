(() => {
  'use strict';
  let printing = false;
  let observer = null;
  let repaginateTimer = null;
  let fullRun = false;
  let screenSnapshot = [];

  const PROCESSED = 'epPrintSafePaginated';
  const SAFE_SOURCE_CLASS = 'ep-print-safe-meeting';
  const CONTINUATION_CLASS = 'ep-supervision-continuation';
  const SAFETY_PX = 28;
  const SNAPSHOT_PROPS = [
    'box-sizing','display','position','float','clear',
    'font-family','font-size','font-style','font-weight','line-height','letter-spacing',
    'text-align','text-indent','text-transform','text-decoration','white-space','word-break','overflow-wrap',
    'vertical-align','color','background-color','background-image','background-size','background-position','background-repeat',
    'width','min-width','max-width','height','min-height','max-height',
    'padding-top','padding-right','padding-bottom','padding-left',
    'margin-top','margin-right','margin-bottom','margin-left',
    'border-top-width','border-top-style','border-top-color',
    'border-right-width','border-right-style','border-right-color',
    'border-bottom-width','border-bottom-style','border-bottom-color',
    'border-left-width','border-left-style','border-left-color','border-radius',
    'table-layout','border-collapse','border-spacing',
    'grid-template-columns','grid-template-rows','grid-auto-flow','column-gap','row-gap',
    'flex-direction','flex-wrap','align-items','justify-content','align-content','flex-grow','flex-shrink','flex-basis',
    'list-style-type','list-style-position','opacity'
  ];

  function installStyles() {
    if (document.getElementById('ep-print-safe-page-style')) return;
    const style = document.createElement('style');
    style.id = 'ep-print-safe-page-style';
    style.textContent = `
      .ep-supervision-meeting{border-top:0!important;background-image:linear-gradient(#0f766e,#0f766e)!important;background-size:100% 3px!important;background-repeat:no-repeat!important;background-position:left top!important}
      .${CONTINUATION_CLASS} .page-inner{padding:13mm 14mm 13mm!important}
      .${CONTINUATION_CLASS} .topline{padding-bottom:3mm;margin-bottom:5mm}
      .${CONTINUATION_CLASS} .tbl{margin-top:0!important}
      @page{size:A4 portrait;margin:0}
      @page epPortrait{size:A4 portrait;margin:0}
      @page epLandscape{size:A4 landscape;margin:0}
      @media print{
        html,body{margin:0!important;padding:0!important;background:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        body{width:auto!important;min-width:0!important;max-width:none!important;transform:none!important;zoom:1!important}
        .preview-bar{display:none!important}
        #printRoot{display:block!important;width:auto!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important;transform:none!important;zoom:1!important}
        #printRoot>.page{box-sizing:border-box!important;position:relative!important;display:block!important;margin:0!important;padding:0!important;flex:none!important;box-shadow:none!important;overflow:hidden!important;transform:none!important;zoom:1!important;break-inside:avoid-page!important;page-break-inside:avoid!important;break-after:page!important;page-break-after:always!important}
        #printRoot>.page.portrait{page:epPortrait!important;width:210mm!important;min-width:210mm!important;max-width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important}
        #printRoot>.page.landscape{page:epLandscape!important;width:297mm!important;min-width:297mm!important;max-width:297mm!important;height:210mm!important;min-height:210mm!important;max-height:210mm!important}
        #printRoot>.page>.page-inner{box-sizing:border-box!important;width:100%!important;min-width:100%!important;max-width:100%!important;margin:0!important;overflow:hidden!important}
        #printRoot>.page.portrait>.page-inner{height:297mm!important;min-height:297mm!important;max-height:297mm!important}
        #printRoot>.page.landscape>.page-inner{height:210mm!important;min-height:210mm!important;max-height:210mm!important}
        #printRoot>.page:last-child{break-after:auto!important;page-break-after:auto!important}
        .ep-supervision-meeting,.${SAFE_SOURCE_CLASS},.${CONTINUATION_CLASS}{break-after:page!important;page-break-after:always!important}
      }`;
    (document.head || document.documentElement).appendChild(style);
  }

  function isLearningStepsTable(table) {
    const heading = table.querySelector('thead');
    return Boolean(heading && /Fase\s*\/\s*Kegiatan/i.test(heading.textContent || ''));
  }

  function learningTable(page) {
    return [...page.querySelectorAll('.page-inner table')].find(isLearningStepsTable) || null;
  }

  function needsMoreRoom(page) {
    const inner = page.querySelector('.page-inner');
    const table = inner && learningTable(page);
    if (!inner || !table) return false;
    const innerRect = inner.getBoundingClientRect();
    const tableBottom = table.getBoundingClientRect().bottom;
    const footer = inner.querySelector('.page-foot');
    const footerTop = footer ? footer.getBoundingClientRect().top : innerRect.bottom;
    const safeBottom = Math.min(footerTop - SAFETY_PX, innerRect.bottom - SAFETY_PX);
    return tableBottom > safeBottom || inner.scrollHeight > inner.clientHeight + 1;
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
    const sourceTable = learningTable(page);
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
      for (const key of ['width','min-width','max-width']) page.style.setProperty(key, width, 'important');
      for (const key of ['height','min-height','max-height']) page.style.setProperty(key, height, 'important');
      const inner = page.querySelector('.page-inner');
      if (inner) for (const key of ['height','min-height','max-height']) inner.style.setProperty(key, height, 'important');
    });
  }

  function captureScreenSnapshot() {
    if (printing) return;
    const root = document.getElementById('printRoot');
    if (!root) return;
    const nodes = [...root.querySelectorAll('*')].filter(node => !node.classList.contains('page'));
    screenSnapshot = nodes.map(node => {
      const computed = getComputedStyle(node);
      const declarations = [];
      for (const prop of SNAPSHOT_PROPS) {
        const value = computed.getPropertyValue(prop);
        if (value) declarations.push([prop, value]);
      }
      return { node, declarations, original: null };
    });
    root.dataset.epScreenMetrics = String(screenSnapshot.length);
  }

  function applyScreenSnapshotForPrint() {
    for (const item of screenSnapshot) {
      if (!item.node || !item.node.isConnected) continue;
      item.original = item.node.getAttribute('style');
      for (const [prop, value] of item.declarations) item.node.style.setProperty(prop, value, 'important');
    }
  }

  function restoreInlineStyles() {
    for (const item of screenSnapshot) {
      if (!item.node || !item.node.isConnected) continue;
      if (item.original === null) item.node.removeAttribute('style');
      else item.node.setAttribute('style', item.original);
      item.original = null;
    }
  }

  function paginate() {
    if (printing) return;
    installStyles();
    document.querySelectorAll('#printRoot > .page').forEach(splitOverflowingPage);
    lockPhysicalSheets();
    captureScreenSnapshot();
    const status = document.getElementById('pageStatus');
    if (status) {
      status.textContent = String(status.textContent || '').replace(/\d+\s+halaman/i, document.querySelectorAll('#printRoot > .page').length + ' halaman');
      status.dataset.epPaper = 'A4-screen-metrics-locked';
    }
  }

  function restorePages() {
    document.querySelectorAll(`.${SAFE_SOURCE_CLASS}:not(.${CONTINUATION_CLASS}), .ep-supervision-meeting:not(.${CONTINUATION_CLASS})`).forEach(page => {
      const sourceTable = learningTable(page);
      const sourceBody = sourceTable && sourceTable.querySelector('tbody');
      if (!sourceBody) return;
      let next = page.nextElementSibling;
      while (next && next.classList.contains(CONTINUATION_CLASS)) {
        const body = learningTable(next)?.querySelector('tbody');
        if (body) [...body.rows].forEach(row => sourceBody.appendChild(row));
        const obsolete = next;
        next = next.nextElementSibling;
        obsolete.remove();
      }
      delete page.dataset[PROCESSED];
    });
  }

  function observeRoot() {
    if (printing || fullRun || !observer) return;
    const root = document.getElementById('printRoot');
    if (!root) return;
    observer.disconnect();
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function runFullPagination() {
    repaginateTimer = null;
    if (printing || fullRun) return;
    fullRun = true;
    if (observer) observer.disconnect();
    restorePages();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      paginate();
      fullRun = false;
      if (observer) observer.takeRecords();
      observeRoot();
    }));
  }

  function queueFullPagination(delay = 100) {
    if (printing) return;
    if (repaginateTimer) clearTimeout(repaginateTimer);
    repaginateTimer = setTimeout(runFullPagination, delay);
  }

  function beginPrint() {
    printing = true;
    if (repaginateTimer) { clearTimeout(repaginateTimer); repaginateTimer = null; }
    if (observer) observer.disconnect();
    installStyles();
    applyScreenSnapshotForPrint();
    lockPhysicalSheets();
  }

  function endPrint() {
    restoreInlineStyles();
    printing = false;
    observeRoot();
    queueFullPagination(120);
  }

  installStyles();
  observer = new MutationObserver(mutations => {
    if (printing || fullRun) return;
    const meaningful = mutations.some(mutation => mutation.type === 'characterData' || (mutation.type === 'childList' && (mutation.addedNodes.length || mutation.removedNodes.length)));
    if (meaningful) queueFullPagination(140);
  });
  observeRoot();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => queueFullPagination(0), { once: true });
  else queueFullPagination(0);

  window.addEventListener('load', () => {
    queueFullPagination(0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => queueFullPagination(0));
    setTimeout(() => queueFullPagination(0), 500);
    setTimeout(() => queueFullPagination(0), 1500);
    setTimeout(() => queueFullPagination(0), 3000);
  }, { once: true });

  window.addEventListener('beforeprint', beginPrint);
  window.addEventListener('afterprint', endPrint);
  document.addEventListener('ep-differentiation-ready', () => queueFullPagination(0));
  document.addEventListener('ep-supervision-ready', () => queueFullPagination(0));
})();
