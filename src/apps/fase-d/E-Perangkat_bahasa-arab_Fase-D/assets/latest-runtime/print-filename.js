(function () {
  'use strict';


  const VERSION = '20260911-2';
  if (document.documentElement?.dataset.epPrintFilename === VERSION) return;
  document.documentElement.dataset.epPrintFilename = VERSION;


  function readAcademicYear() {
    const text = document.body?.innerText || '';
    const match = text.match(/Tahun\s+(?:Pelajaran|Ajaran)[^0-9]{0,20}(20\d{2})\s*[\/\-â€“]\s*(20\d{2})/i);
    return match ? match[1] + '-' + match[2] : '';
  }


  function applyAcademicYear() {
    const year = readAcademicYear();
    if (!year) return;
    const suffix = ' - Tahun Pelajaran ' + year;
    const cleanTitle = document.title.replace(/\.pdf$/i, '').replace(/\s+-\s+Tahun Pelajaran\s+20\d{2}[\/\-â€“]20\d{2}\s*$/i, '').trim();
    if (cleanTitle && !document.title.endsWith(suffix)) document.title = cleanTitle + suffix;
  }


  let titlePrototype = document;
  let titleDescriptor = null;
  while (titlePrototype && !titleDescriptor) {
    titleDescriptor = Object.getOwnPropertyDescriptor(titlePrototype, 'title');
    titlePrototype = Object.getPrototypeOf(titlePrototype);
  }
  if (titleDescriptor?.get && titleDescriptor?.set) {
    try {
      Object.defineProperty(document, 'title', {
        configurable: true,
        enumerable: true,
        get() { return titleDescriptor.get.call(document); },
        set(value) {
          const year = readAcademicYear();
          let nextTitle = String(value ?? '').replace(/\.pdf$/i, '').replace(/\s+-\s+Tahun Pelajaran\s+20\d{2}[\/\-â€“]20¶»§q«^