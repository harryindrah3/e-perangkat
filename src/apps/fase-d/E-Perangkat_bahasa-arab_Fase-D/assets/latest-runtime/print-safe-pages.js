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
  const SNAPSHOT_PROPS = ['box-sizing','display','position','float','clear','font-family','font-size','font-style','font-weight','line-height','letter-spacing','text-align','text-indent','text-transform','text-decoration','white-space','word-break','overflow-wrap','vertical-align','color','background-color','background-image','background-size','background-position','background-repeat','width','min-width','max-width','height','min-height','max-height','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left','border-top-width','border-top-style','border-top-color','border-right-width','border-right-style','border-right-color','border-bottom-width','border-bottom-style','border-bottom-color','border-left-width','border-left-style','border-left-color','border-radius','table-layout','border-collapse','border-spacing','grid-template-columns','grid-template-rows','grid-auto-flow','column-gap','row-gap','flex-direction','flex-wrap','align-items','justify-content','align-content','flex-grow','flex-shrink','flex-basis','list-style-type','list-style-position','opacity'];
  function installStyles() ¶»§q«^