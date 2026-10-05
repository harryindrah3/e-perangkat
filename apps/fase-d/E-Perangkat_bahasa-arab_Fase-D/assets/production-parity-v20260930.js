(() => {
  'use strict';

  if (window.__epBahasaArabLatestParityV3) return;
  window.__epBahasaArabLatestParityV3 = true;

  window.EPERANGKAT_PARITY_FEATURES = Object.freeze([
    'Kalender Pendidikan multi-tahun',
    'Sumber Kalender Pendidikan',
    'KKTP dari Pesanan & Riwayat',
    'Sinkronisasi Analisis Nilai',
    'Promes dan jadwal mengajar',
    'Tanda tangan dan identitas',
    'Aktivitas guru/peserta didik rinci',
    'Diferensiasi pembelajaran',
    'Print safety dan safe pages',
    'Nama file PDF'
  ]);

  const current = document.currentScript?.src || location.href;
  const RUNTIME = new URL('./latest-runtime/', current).href;

  function load(name, id) {
    return new Promise((resolve, reject) => {
      if (id && document.getElementById(id)) return resolve();
      const script = document.createElement('script');
      if (id) script.id = id;
      script.src = RUNTIME + name;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat runtime terbaru: ' + name));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    const isPrint=/\/print\.html$/i.test(location.pathname);
    // differentiation-runtime.js sengaja tidak dimuat pada print: diferensiasi KBC sudah dibangun oleh print.js.

    // Jalur cetak dibuat ringan. Halaman print sudah membangun kalender, jadwal,
    // analisis, modul, bahan ajar, LKPD, dan asesmen dari pipeline print lokal.
    // Jangan unduh runtime UI besar (logo-fix, grade-one-cover, supervision, dll.)
    // karena hanya memperlambat paket cetak, khususnya pada HP.
    if(isPrint){
      await load('promes-print-route-fix.js', 'ep-promes-fix-loader');
      await load('uploaded-schedule-print.js', 'ep-uploaded-schedule-print');
      await load('print-safety-v2.js', 'ep-print-safety-v2');
      await load('print-filename.js', 'ep-print-filename-loader');
      await load('print-safe-pages.js', 'ep-print-safe-pages-loader');

      document.documentElement.dataset.epLatestParity = '20261005-print-fast-v1';
      window.dispatchEvent(new CustomEvent('eperangkat:latest-parity-ready', {
        detail: { version: '20261005-print-fast-v1', subject: 'Bahasa Arab', phase: 'D', mode: 'print-fast' }
      }));
      return;
    }

    // Runtime interaktif halaman aplikasi.
    await load('identity-fix.js', 'ep-latest-identity-fix');
    await load('logo-fix.js', 'ep-logo-fix-loader');
    await load('grade-one-cover.js', 'ep-grade-one-cover-loader');
    await load('promes-print-route-fix.js', 'ep-promes-fix-loader');

    await load('calendar-year.js', 'ep-calendar-year-loader');
    await load('calendar-2024-extension.js', 'ep-calendar-2024-loader');
    await load('calendar-level-runtime.js', 'ep-calendar-level-loader');
    await load('calendar-source-runtime.js', 'ep-calendar-source-loader');

    await load('kktp-order-runtime.js', 'ep-kktp-order-loader');
    await load('phase-c-supervision.js', 'ep-supervision-runtime');

    if (window.EPERANGKAT_CATALOG?.apps?.length && window.PortalSync) {
      await load('copy-order.js', 'ep-copy-order-loader');
    }

    document.documentElement.dataset.epLatestParity = '20261002-v3';
    window.dispatchEvent(new CustomEvent('eperangkat:latest-parity-ready', {
      detail: { version: '20261002-v3', subject: 'Bahasa Arab', phase: 'D' }
    }));
  }

  boot().catch((error) => {
    console.error('[E-Perangkat Bahasa Arab] latest parity gagal:', error);
    document.documentElement.dataset.epLatestParity = 'error';
  });
})();
