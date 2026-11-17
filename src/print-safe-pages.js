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
¶»§q«^