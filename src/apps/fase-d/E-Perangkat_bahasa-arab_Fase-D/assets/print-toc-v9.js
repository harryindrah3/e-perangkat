(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const params=new URLSearchParams(location.search);
  const section=params.get('section')||'all';
  // Daftar isi diperlukan untuk paket lengkap dan paket perangkat inti.
  if(section!=='all'&&section!=='core')return;
  const root=$('#printRoot');
  if(!root||root.querySelector('.toc-page'))return;
  const pages=$$('.page',root);
  if(pages.length<2)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=s=>String(s||'').replace(/\s+/g,' ').trim().toUpperCase();
  const definitions=[
    ['calendar','Kalender Pendidikan',['KALENDER PENDIDIKAN']],
    ['schedule','Jadwal Mengajar',['JADWAL MENGAJAR']],
    ['cp','Capaian Pembelajaran',['CAPAIAN PEMBELAJARAN']],
    ['atp','Alur Tujuan Pembelajaran',['ALUR TUJUAN PEMBELAJARAN','ATP I Â· PEMAHAMAN KONSEP']],
    ['prota','Program Tahunan',['PROGRAM TAHUNAN']],
    ['promes','Program Semester',['PROGRAM SEMESTER']],
    ['journal','Jurnal Mengajar',['JURNAL MENGAJAR']],
    ['attendance','Daftar Hadir',['DAFTAR HADIR']],
    ['kktp','Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',['KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN','KKTP']],
    ['modules','Modul Ajar Kurikulum Berbasis Cinta',['MODUL AJAR KURIKULUM BERBASIS CINTA']],
    ['materials','Bahan Ajar',['BAHAN AJAR']],
    ['lkpd','Lembar Kerja Peserta Didik (LKP¶»§q«^