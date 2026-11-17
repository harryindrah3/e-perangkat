(() => {
  'use strict';

  const IS_PRINT = /\/apps\/.+\/print\.html$/i.test(location.pathname);

  if (!IS_PRINT) {
    const script = document.createElement('script');
    script.src = '/calendar-year-print-fix.js?v=20260915-printfix-1';
    script.async = false;
    (document.head || document.documentElement).appendChild(script);
    return;
  }

  const TARGET_YEAR = '2025/2026';
  const match = location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);
  if (!match) return;

  const subject = decodeURIComponent(match[1] || '').toLowerCase();
  const phase = String(match[2] || '').toLowerCase();
  const key = `eperangkat.${subject}.fase${phase}.v1.orders`;

  const rows2025 = [
    ['2025-07-01','2025-07-12','semester','Libur sebelum tahun pelajaran baru'],
    ['2025-07-14','2025-07-14','unit','Awal tahun pelajaran 2025/2026'],
    ['2025-07-15',/[abc]/.test(phase)?'2025-07-26':'2025-07-19','unit','MPLS'],
    ['2025-08-17','2025-08-17','national','Kemerdekaan RI'],
    ['2025-08-18','2025-08-18','national','Cuti bersama Kemerdekaan RI'],
    ['2025-09-05','2025-09-05','national','Maulid Nabi Muhammad SAW'],
    ['2025-10-12','2025-10-12','unit','HUT Kabupaten Buol (fakultatif)'],
    ['2025-11-25','2025-11-25','unit','Hari Guru dan HUT PGRI (fakultatif)'],
    ['2025-12-08','2025-12-13','assessment','Asesmen akhir semester ganjil'],
    ['2025-12-15','2025-12-19','unit','Pengolahan nilai rapor'],
    ['2025-12-20','2025-12-20','report','Pembagian rapor ganjil'],
   ¶»§q«^