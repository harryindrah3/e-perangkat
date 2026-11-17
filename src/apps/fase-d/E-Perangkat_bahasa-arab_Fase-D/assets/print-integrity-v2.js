(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{},root=document.querySelector('#printRoot');
  if(!root)return;
  const params=new URLSearchParams(location.search),section=params.get('section')||'all',semester=params.get('semester')||'both';
  const covers=[...root.querySelectorAll('.page.cover h1')].map(node=>String(node.textContent||'').replace(/\s+/g,' ').trim().toUpperCase());
  const required=section==='all'?['PAKET PERANGKAT','KALENDER PENDIDIKAN','JADWAL MENGAJAR','CAPAIAN PEMBELAJARAN','ALUR TUJUAN PEMBELAJARAN','PROGRAM TAHUNAN','PROGRAM SEMESTER','JURNAL MENGAJAR','DAFTAR HADIR','KRITERIA KETERCAPAIAN','MODUL AJAR','BAHAN AJAR','LEMBAR KERJA','ASESMEN PEMBELAJARAN','ANALISIS NILAI']:section==='core'?['PAKET PERANGKAT','KALENDER PENDIDIKAN','JADWAL MENGAJAR','CAPAIAN PEMBELAJARAN','ALUR TUJUAN PEMBELAJARAN','PROGRAM TAHUNAN','PROGRAM SEMESTER','JURNAL MENGAJAR','DAFTAR HADIR','KRITERIA KETERCAPAIAN']:[];
  let cursor=-1,ok=true;
  for(const expected of required){const found=covers.findIndex((title,index)=>index>cursor&&title.includes(expected));if(found<0){ok=false;break}cursor=found}
  const first=root.querySelector('.page'),toc=root.querySelector('.toc-page');
  if((section==='all'||section==='core')&&first&&toc&&first.nextElementSibling!==toc)first.after(toc);
  document.querySelectorAll('.toc-meta div').forEach(row=>{if(String(row.textContent||'').toLowerCase().includes('kelas / fase')){const bold=row.querySelector('b');if(bold)bold.textContent=(params.¶»§q«^