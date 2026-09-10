(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const $=(s,r=document)=>r.querySelector(s);
  const params=new URLSearchParams(location.search);
  const section=params.get('section')||'all';
  if(!['all','core','schedule'].includes(section))return;
  const semester=params.get('semester')||'both';
  const STORE='eperangkat.bahasa-inggris.fasef.v1.orders';
  const PROFILE='eperangkat.bahasa-inggris.fasef.v1.profile';
  const grade=params.get('grade')||localStorage.getItem('eperangkat.bahasa-inggris.fasef.v1.grade')||'XI';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  const store=getStore(),orderId=params.get('order')||'',order=(store.orders||[]).find(o=>o.id===orderId)||(store.orders||[]).find(o=>o.id===store.activeId)||(store.orders||[])[0]||{};
  let localProfile={};try{localProfile=JSON.parse(localStorage.getItem(PROFILE)||'{}')}catch(_){}
  const P={...(D.defaults||{}),...(order.profile||{}),...localProfile};
  const teacherRole=P.teacherRole||'Guru';
  function idLine(type,value){const t=String(type||'NIP').toUpperCase(),v=String(value||'').trim();if(t==='NONE'||!v)return '';return `<br>${esc(t==='NUPTK'?'NUPTK':'NIP')}. ${esc(v)}`}
  function signatureSpace(data,alt){return data?`<div class="space signature-image-wrap"><img class="signature-image" src="${data}" alt="${esc(alt)}"></div>`:`<div class="space"></div>`}
  function dateForSemester(sem){return sem==='2'?(String(P.dateSemester2||'').trim()||P.date):P.date}
  function sign(sem){return `<div class="signature schedule-signature"><div>Mengetahui,<br>Kepala Sekolah${signatureSpace(P.principalSignature,'Tanda tangan kepala sekolah')}<b>${esc(P.principal)}</b>${idLine(P.principalIdType,P.principalId)}</div><div>${esc(P.place)}, ${esc(dateForSemester(sem))}<br>${esc(teacherRole)} Mata Pelajaran${signatureSpace(P.teacherSignature,'Tanda tangan pengajar')}<b>${esc(P.teacher)}</b>${idLine(P.teacherIdType,P.teacherId)}</div></div>`}
  function rows(sem){
    const all=Array.isArray(P.teachingSchedule)?P.teachingSchedule:[];
    const selected=all.filter(row=>String(row.semester||'1')===sem);
    return selected.length?selected:Array.from({length:4},()=>({className:'',day:'',time:'',hours:''}));
  }
  function cover(){
    return `<section class="page portrait cover schedule-cover"><div class="page-inner cover-content"><div class="cover-kicker">KURIKULUM MERDEKA · PEMBELAJARAN MENDALAM</div><div class="cover-center"><small>E-PERANGKAT PEMBELAJARAN</small><h1>JADWAL MENGAJAR</h1><h2>B. Inggris · Kelas ${esc(grade)} · Fase F</h2><div class="accent-line"></div><div class="identity-box"><table><tr><td>Satuan Pendidikan</td><td>:</td><td><b>${esc(P.school)}</b></td></tr><tr><td>Mata Pelajaran</td><td>:</td><td><b>B. Inggris</b></td></tr><tr><td>${esc(teacherRole)}</td><td>:</td><td><b>${esc(P.teacher)}</b></td></tr><tr><td>Tahun Pelajaran</td><td>:</td><td><b>${esc(P.year)}</b></td></tr></table></div></div><div class="cover-foot"><b>${esc(P.school)}</b><span>${esc(P.address||P.region||'')}</span></div></div></section>`;
  }
  function page(sem){
    const selected=rows(sem),total=selected.reduce((sum,row)=>sum+(Number(row.hours)||0),0);
    return `<section class="page portrait schedule-print-page"><div class="page-inner">
      <h1 class="schedule-print-title">JADWAL MENGAJAR</h1>
      <table class="schedule-meta"><tbody>
        <tr><td>Nama Sekolah</td><td>:</td><td><b>${esc(P.school)}</b></td></tr>
        <tr><td>Mata Pelajaran</td><td>:</td><td><b>B. Inggris</b></td></tr>
        <tr><td>Kelas / Semester</td><td>:</td><td><b>${esc(grade)} / ${sem==='1'?'I':'II'}</b></td></tr>
        <tr><td>Tahun Pelajaran</td><td>:</td><td><b>${esc(P.year)}</b></td></tr>
      </tbody></table>
      <table class="tbl schedule-print-table"><thead><tr><th>KLS</th><th>HARI</th><th>JAM</th><th>JUMLAH JAM</th></tr></thead><tbody>
        ${selected.map(row=>`<tr><td>${esc(String(row.className||'').toUpperCase())}</td><td>${esc(String(row.day||'').toUpperCase())}</td><td>${esc(row.time||'')}</td><td>${row.hours===''?'':`${esc(row.hours)} Jam`}</td></tr>`).join('')}
        <tr class="schedule-total"><td></td><td colspan="2">JUMLAH</td><td>${total} Jam</td></tr>
      </tbody></table>
      ${sign(sem)}
      <div class="page-foot"><span>Jadwal Mengajar · B. Inggris</span><span>Kelas ${esc(grade)} · Semester ${sem==='1'?'I':'II'} · ${esc(P.year)}</span></div>
    </div></section>`;
  }
  let html=cover();
  if(semester==='1'||semester==='both')html+=page('1');
  if(semester==='2'||semester==='both')html+=page('2');
  const root=$('#printRoot'),first=root?.querySelector('.page');
  if(!root||!first)return;
  const temp=document.createElement('div');temp.innerHTML=html;
  const frag=document.createDocumentFragment();[...temp.children].forEach(node=>frag.appendChild(node));
  first.after(frag);
})();
