(function () {
  'use strict';

  const STYLE_ID = 'epPrintSafetyV2Style';
  const SCALE_ATTR = 'epSafetyScale';
  let timer = 0;

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Safe print area: berlaku global untuk seluruh Fase A–F. */
      html body .page .page-inner{overflow:visible!important}
      html body .page .signature:not(.calendar-signature){
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        column-gap:18mm!important;
        padding-left:10mm!important;
        padding-right:10mm!important;
        width:100%!important;
      }
      html body .page.landscape .signature:not(.calendar-signature){
        padding-left:8mm!important;
        padding-right:8mm!important;
        column-gap:20mm!important;
      }
      html body .page .signature:not(.calendar-signature)>div{min-width:0!important;max-width:100%!important}
      html body .page .signature:not(.calendar-signature) b{
        min-width:0!important;
        max-width:100%!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        word-break:normal!important;
        padding-left:2mm!important;
        padding-right:2mm!important;
      }
      html body .page table{max-width:100%!important}
      html body .page img{max-width:100%}
      html body .page [data-ep-safety-scale]{transform-origin:top left!important}
      @media print{
        html body .page{overflow:hidden!important}
        html body .page .page-inner{overflow:visible!important}
      }
    `;
    document.head.appendChild(style);
  }

  function clearScale(inner) {
    if (!inner || !inner.hasAttribute(`data-${SCALE_ATTR.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`)) return;
    inner.style.removeProperty('transform');
    inner.removeAttribute('data-ep-safety-scale');
  }

  function pageNeedsAudit(page) {
    return page && !page.classList.contains('ep-uploaded-schedule-page');
  }

  function measureAndFit(page) {
    if (!pageNeedsAudit(page)) return { scaled: false, scale: 1, overflow: 0 };
    const inner = page.querySelector(':scope > .page-inner') || page.querySelector('.page-inner');
    if (!inner) return { scaled: false, scale: 1, overflow: 0 };

    clearScale(inner);
    inner.getBoundingClientRect();

    const pageH = Math.max(1, page.clientHeight);
    const pageW = Math.max(1, page.clientWidth);
    const contentH = Math.max(inner.scrollHeight, inner.clientHeight);
    const contentW = Math.max(inner.scrollWidth, inner.clientWidth);
    const overflow = Math.max(0, contentH - pageH);
    const overflowW = Math.max(0, contentW - pageW);

    if (overflow <= 2 && overflowW <= 2) {
      page.removeAttribute('data-ep-overflow');
      return { scaled: false, scale: 1, overflow };
    }

    const heightScale = (pageH - 2) / Math.max(pageH, contentH);
    const widthScale = (pageW - 2) / Math.max(pageW, contentW);
    const scale = Math.max(0.62, Math.min(0.998, heightScale, widthScale));

    inner.style.setProperty('transform', `scale(${scale})`, 'important');
    inner.setAttribute('data-ep-safety-scale', scale.toFixed(4));
    page.setAttribute('data-ep-overflow', scale < 0.86 ? 'severe' : 'scaled');

    return { scaled: true, scale, overflow };
  }

  function fixLongText() {
    document.querySelectorAll('.signature:not(.calendar-signature) b').forEach((node) => {
      node.style.setProperty('max-width', '100%', 'important');
      node.style.setProperty('white-space', 'normal', 'important');
    });
  }

  function audit() {
    installStyle();
    fixLongText();
    const root = document.getElementById('printRoot') || document.body;
    const pages = [...root.querySelectorAll('.page')];
    if (!pages.length) return;

    let scaled = 0;
    let severe = 0;
    let minScale = 1;
    pages.forEach((page) => {
      const result = measureAndFit(page);
      if (result.scaled) {
        scaled += 1;
        minScale = Math.min(minScale, result.scale);
        if (result.scale < 0.86) severe += 1;
      }
    });

    document.documentElement.dataset.epPrintSafety = 'ready';
    document.documentElement.dataset.epPrintSafetyPages = String(pages.length);
    document.documentElement.dataset.epPrintSafetyScaled = String(scaled);
    document.documentElement.dataset.epPrintSafetySevere = String(severe);
    document.documentElement.dataset.epPrintSafetyMinScale = minScale.toFixed(4);
  }

  function queue(delay) {
    clearTimeout(timer);
    timer = setTimeout(audit, delay == null ? 120 : delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => queue(30), { once: true });
  } else {
    queue(30);
  }

  window.addEventListener('load', () => queue(50), { once: true });
  window.addEventListener('beforeprint', () => audit());
  [250, 700, 1400, 2600, 4200].forEach((delay) => setTimeout(audit, delay));

  const observer = new MutationObserver(() => queue(180));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();