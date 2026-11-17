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
    // Jangan u¶»§q«^