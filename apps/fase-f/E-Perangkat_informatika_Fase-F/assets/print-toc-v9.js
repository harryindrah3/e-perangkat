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
    ['atp','Alur Tujuan Pembelajaran',['ALUR TUJUAN PEMBELAJARAN','ATP I · PEMAHAMAN KONSEP']],
    ['prota','Program Tahunan',['PROGRAM TAHUNAN']],
    ['promes','Program Semester',['PROGRAM SEMESTER']],
    ['journal','Jurnal Mengajar',['JURNAL MENGAJAR']],
    ['attendance','Daftar Hadir',['DAFTAR HADIR']],
    ['kktp','Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)',['KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN','KKTP']],
    ['modules','Modul Ajar Deep Learning',['MODUL AJAR DEEP LEARNING']],
    ['materials','Bahan Ajar',['BAHAN AJAR']],
    ['lkpd','Lembar Kerja Peserta Didik (LKPD)',['LEMBAR KERJA PESERTA DIDIK','LKPD']],
    ['assessment','Asesmen Pembelajaran',['ASESMEN PEMBELAJARAN']],
    ['analysis','Analisis Nilai',['ANALISIS NILAI FORMATIF DAN SUMATIF','DAFTAR ANALISIS NILAI FORMATIF']]
  ];
  // Gunakan judul pada halaman sampul komponen agar istilah yang muncul di isi
  // (misalnya LKPD atau asesmen di dalam Modul Ajar) tidak terbaca sebagai awal komponen.
  const coverTitles=pages.map(p=>{
    if(!p.classList.contains('cover'))return '';
    return normalize(p.querySelector('.cover-center h1')?.textContent||p.querySelector('h1')?.textContent||'');
  });
  const entries=[];
  for(const [key,label,patterns] of definitions){
    const index=coverTitles.findIndex((title,i)=>i>0&&patterns.some(pattern=>title.includes(pattern)));
    if(index>=0)entries.push({key,label,index});
  }
  entries.sort((a,b)=>a.index-b.index);
  if(!entries.length)return;
  entries.forEach((entry,i)=>{
    entry.start=entry.index+2; // satu halaman daftar isi disisipkan setelah sampul
    const next=entries[i+1];
    entry.end=next?next.index+1:pages.length+1;
  });

  const D=window.EPERANGKAT_DATA||{};
  const STORE='eperangkat.informatika.fasef.v1.orders';
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  const store=getStore(),orderId=params.get('order')||'',order=store.orders?.find(o=>o.id===orderId)||store.orders?.find(o=>o.id===store.activeId)||store.orders?.[0]||{};
  const profile={...(D.defaults||{}),...(order.profile||{})};
  const grade=params.get('grade')||order.grade||'XI';
  const semester=params.get('semester')||'both';
  const semesterLabel=semester==='1'?'Semester I (Ganjil)':semester==='2'?'Semester II (Genap)':'Semester 1 dan 2';
  const range=e=>e.start===e.end?String(e.start):`${e.start}–${e.end}`;
  const list=[
    {label:'Sampul Paket Perangkat',number:'1'},
    {label:'Daftar Isi',number:'2'},
    ...entries.map(e=>({label:e.label,number:range(e)}))
  ];
  const toc=document.createElement('section');
  toc.className='page portrait toc-page';
  toc.innerHTML=`<div class="page-inner toc-inner">
    <div class="toc-kicker">E-PERANGKAT PEMBELAJARAN · KURIKULUM MERDEKA</div>
    <h1>DAFTAR ISI</h1>
    <div class="toc-meta">
      <div><span>Mata Pelajaran</span><b>Informatika</b></div>
      <div><span>Kelas / Fase</span><b>${esc(grade)} / D</b></div>
      <div><span>Cakupan</span><b>${esc(semesterLabel)}</b></div>
      <div><span>Tahun Pelajaran</span><b>${esc(profile.year||'')}</b></div>
    </div>
    <div class="toc-rule"></div>
    <ol class="toc-list">${list.map((item,i)=>`<li><span class="toc-no">${String(i+1).padStart(2,'0')}</span><span class="toc-label">${esc(item.label)}</span><span class="toc-dots"></span><span class="toc-page-number">${esc(item.number)}</span></li>`).join('')}</ol>
    <div class="toc-note"><b>Catatan:</b> Nomor halaman mengikuti susunan paket cetak yang sedang dipilih. Komponen semester otomatis menampilkan perangkat yang sesuai dengan Semester I atau Semester II.</div>
    <div class="page-foot"><span>Daftar Isi · E-Perangkat Informatika Fase F</span><span>Kelas ${esc(grade)} · ${esc(profile.year||'')}</span></div>
  </div>`;
  pages[0].after(toc);

  // Watermark harus ikut muncul pada halaman daftar isi.
  const status=order.paymentStatus||'belum_lunas',wm=params.get('wm')||'auto';
  const watermarkEnabled=wm==='1'||(wm==='auto'&&status!=='lunas');
  if(watermarkEnabled){
    const mark=document.createElement('div');
    mark.className='payment-watermark';
    mark.innerHTML=`<strong>${esc(order.watermark||'BELUM LUNAS')}</strong><span>DOKUMEN PRATINJAU · ${esc(order.number||'PESANAN')}</span><small>${esc(order.customer||profile.school||'Pemesan')}</small>`;
    toc.appendChild(mark);
  }
  const statusEl=$('#pageStatus');
  if(statusEl){
    const old=statusEl.textContent||'';
    const total=$$('.page',root).length;
    statusEl.textContent=old.replace(/^\d+ halaman/,`${total} halaman`);
  }
})();

