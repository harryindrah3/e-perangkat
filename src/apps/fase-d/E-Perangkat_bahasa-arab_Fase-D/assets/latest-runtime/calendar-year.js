(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const YEARS=['2025/2026','2026/2027'];
function preset2026(phase){
const level=phase==='d'?'SMP/MTs':/[ef]/.test(phase)?'SMA/MA/SMK':'SD/MI';
  const events = [
    ['2026-07-07','2026-07-11','semester','Libur Semester Genap Tahun Pelajaran 2025/2026'],
    ['2026-07-13','2026-07-13','unit','Awal Masuk Sekolah Tahun Pelajaran 2026/2027'],
    ['2026-08-17','2026-08-17','national','HUT Kemerdekaan Republik Indonesia'],
    ['2026-08-25','2026-08-25','national','Maulid Nabi Muhammad SAW'],
    ['2026-10-12','2026-10-12','unit','Hari Ulang Tahun Daerah'],
    ['2026-11-25','2026-11-25','unit','Hari Guru Nasional dan HUT PGRI (fakultatif)'],
    ['2026-12-07','2026-12-11','assessment','Sumatif Akhir Semester '+level],
    ['2026-12-14','2026-12-18','unit','Pengolahan Nilai Rapor '+level],
    ['2026-12-21','2026-12-21','report','Penyerahan Rapor '+level],
    ['2026-12-22','2026-12-31','semester','Libur Semester Ganjil'],
    ['2026-12-24','2026-12-24','national','Cuti Bersama Hari Raya Natal 2026'],
    ['2026-12-25','2026-12-25','national','Hari Raya Natal 2026'],
    ['2027-01-01','2027-01-01','national','Tahun Baru Masehi 2027'],
    ['2027-01-05','2027-01-05','national','Isra Mikraj Nabi Muhammad SAW (estimasi)'],
    ['2027-01-06','2027-01-06','unit','Awal Masuk Sekolah Semester Genap'],
    ['2027-02-06','2027-02-06','national','Tahun Baru Imlek 2578 Kongzili (estimasi)'],
    ['2027-02-08','2027-¶»§q«^