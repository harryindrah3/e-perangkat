(() => {
  'use strict';

  const BASE = 'https://e-perangkat-online-a-afanit1w0-harryindrah3-6239s-projects.vercel.app/print-safe-pages.js?v=20260915-5';

  function installFlowFix() {
    if (window.__epSupervisionPrintFlowFixV6) return;
    window.__epSupervisionPrintFlowFixV6 = true;

    const style = document.createElement('style');
    style.id = 'ep-supervision-print-flow-v6';
    style.textContent = `
      @media print {
        .ep-supervision-meeting .topline,
        .ep-supervision-meeting .topline > span,
        .ep-supervision-meeting .objective-box,
        .ep-supervision-meeting .objective-box > *,
        .ep-supervision-meeting .ep-supervision-objective {
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
        }
        .ep-supervision-meeting .topline {
          width:auto!important;
          min-width:0!important;
          max-width:none!important;
          gap:8mm!important;
          align-items:flex-end!important;
        }
        .ep-supervision-meeting .topline > span {
          width:auto!important;
          min-width:0!important;
          max-width:none!important;
          flex:0 0 auto!important;
          white-space:nowrap!important;
        }
        .ep-supervision-meeting .objective-box,
        .ep-supervision-meeting .ep-supervision-objective {
          overflow:visible!important;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);

    const HEIGHT_PROPS = ['height','min-height','max-height'];
    const WIDTH_PROPS = ['width','min-width','max-width','flex-basis'];

    function removeProps(node, props) {
      if (!node || !node.style) return;
      for (const prop of props) node.style.removeProperty(prop);
    }

    function releaseMeetingGeometry() {
      document.querySelectorAll('.ep-supervision-meeting').forEach(page => {
        page.querySelectorAll('.page-inner *').forEach(node => removeProps(node, HEIGHT_PROPS));
        page.querySelectorAll('.topline, .topline *, .objective-box, .objective-box *, .ep-supervision-objective').forEach(node => {
          removeProps(node, HEIGHT_PROPS);
          removeProps(node, WIDTH_PROPS);
        });
      });
      document.documentElement.dataset.epPrintFlow = 'v6-auto-content-geometry';
    }

    // print-safe-pages v5 applies its screen snapshot first. This listener is
    // registered afterwards and releases only content geometry that must remain
    // fluid, while keeping typography, spacing, A4 sheet locking and pagination.
    window.addEventListener('beforeprint', releaseMeetingGeometry);

    // Capture phase: run immediately before the inline window.print() handler,
    // while the document is still in screen media mode.
    document.addEventListener('click', event => {
      const button = event.target.closest?.('.preview-bar button');
      if (button && /cetak|pdf/i.test(button.textContent || '')) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.querySelectorAll('.ep-supervision-meeting .objective-box').forEach(box => {
            box.style.removeProperty('height');
            box.style.removeProperty('min-height');
            box.style.removeProperty('max-height');
          });
        }));
      }
    }, true);
  }

  const script = document.createElement('script');
  script.src = BASE;
  script.async = false;
  script.onload = installFlowFix;
  script.onerror = () => {
    console.error('Gagal memuat print-safe-pages v5.');
    installFlowFix();
  };
  (document.head || document.documentElement).appendChild(script);
})();
