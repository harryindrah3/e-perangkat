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
      /* Safe print area: berlaku global untuk seluruh Fase Aâ€“F. */
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
      html body .page [data-ep-safety-scale]{transform-origin:top¶»§q«^