(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  const section=params.get('section')||'all';
  if(section!=='all'&&section!=='analysis')return;
  const semesterParam=params.get('semester')||'both';
  const STORE='eperangkat.seni-rupa.fasea.v1.orders';
  const gradeNumber={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  const store=getStore(),orderId=params.get('order')||'',order=store.orders?.find(o=>o.id===orderId)||store.orders?.find(o=>o.id===store.activeId)||store.orders?.[0]||{};
  const grade=params.get('grade')||order.grade||localStorage.getItem('eperangkat.seni-rupa.fasea.v1.grade')||'I';
  const profile={...(D.defaults||{}),...(order.profile||{})};
  function classLabel(g,r=''){g=String(g||'I').trim().toUpperCase();const raw=String(r||'').trim().toUpperCase().replace(/\s+/g,' ');if(!raw)return g;const compact=raw.replace(/\s+/g,'');if(compact.startsWith(g)){const suffix=compact.slice(g.length);return suffix?`${g} ${suffix}`:g}return `${g} ${compact}`}
  const className=classLabel(grade,profile.rombel);
  const teacherRole=profile.teacherRole||'Guru';
  const students=(Array.isArray(order.students)?order.students.slice(0,30):[]).map((s,i)=>({...s,id:s.id||`stu-${order.id||'order'}-${i+1}`}));
  while(students.length<30)students.push({id:`stu-${order.id||'order'}-${students.length+1}`,name:'',task:'',exam:''});
  const analysis=order.analysis||{},settings={threshold:75,thresholds:{},formativeWeight:50,summativeWeight:50,...(analysis.settings||{})};
  const gradeData=analysis.grades?.[grade]||{};
  const root=$('#printRoot');if(!root)return;
  const semesters=semesterParam==='1'?['1']:semesterParam==='2'?['2']:['1','2'];
  const fmt=v=>v===null||v===undefined||Number.isNaN(v)?'—':Number(v).toFixed(1);
  function numeric(v){if(v===''||v===null||v===undefined)return null;const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):null}
  function thresholdFor(g=grade){
    const map=settings.thresholds&&typeof settings.thresholds==='object'?settings.thresholds:{};
    const own=numeric(map[g]);
    return own===null?(numeric(settings.threshold)??75):own;
  }
  function mean(values){const n=values.map(numeric).filter(v=>v!==null);return n.length?n.reduce((a,b)=>a+b,0)/n.length:null}
  function finalScore(f,s){
    f=numeric(f);s=numeric(s);if(f===null&&s===null)return null;if(f===null)return s;if(s===null)return f;
    const fw=Math.max(0,Number(settings.formativeWeight)||0),sw=Math.max(0,Number(settings.summativeWeight)||0),total=fw+sw||100;return(f*fw+s*sw)/total;
  }
  function objectives(sem){
    const semName=sem==='1'?'Ganjil':'Genap',n=gradeNumber[grade]||7;
    return (D.modules||[]).filter(m=>m.grade===grade&&m.semester===semName).sort((a,b)=>a.chapter-b.chapter).flatMap(m=>(m.objectives||[]).map((o,i)=>({code:`A${n}.${m.chapter}.${i+1}`,text:o.text||String(o),chapter:m.chapter,title:m.title})));
  }
  function semData(sem){const sd=gradeData[sem]||{};return {formative:sd.formative||{},summative:sd.summative||{}}}
  function calc(sem){
    const tps=objectives(sem),sd=semData(sem),threshold=thresholdFor(grade);
    const rows=students.map((student,index)=>{
      const f=mean(tps.map(tp=>(sd.formative[student.id]||{})[tp.code])),s=numeric(sd.summative[student.id]),final=finalScore(f,s);
      return {student,index,formative:f,summative:s,final,status:final===null?'':final>=threshold?'Tuntas':'Belum Tuntas'};
    });
    const active=rows.filter(r=>String(r.student.name||'').trim()&&(r.final!==null||r.formative!==null||r.summative!==null));
    const recap=tps.map(tp=>{
      const scores=students.map(s=>numeric((sd.formative[s.id]||{})[tp.code])).filter(v=>v!==null),avg=mean(scores),tuntas=scores.filter(v=>v>=threshold).length,belum=scores.length-tuntas;
      let recommendation='Belum ada data nilai.';
      if(scores.length){if(!belum)recommendation='Pengayaan dan pendalaman.';else if(belum/scores.length<=.3)recommendation='Remedial terarah, umpan balik, dan asesmen ulang.';else recommendation='Pembelajaran ulang terarah, latihan bertahap, dan asesmen ulang.'}
      return {...tp,avg,tuntas,belum,count:scores.length,recommendation};
    });
    const finals=active.map(r=>r.final).filter(v=>v!==null);
    return {tps,sd,rows,active,recap,threshold,classAverage:mean(finals)};
  }
  function identifierLine(type,value){const t=String(type||'NIP').toUpperCase(),v=String(value||'').trim();if(t==='NONE'||!v)return '';return `<br>${esc(t==='NUPTK'?'NUPTK':'NIP')}. ${esc(v)}`}
  function signatureSpace(data,alt){return data?`<div class="space signature-image-wrap"><img class="signature-image" src="${data}" alt="${esc(alt)}"></div>`:`<div class="space"></div>`}
  function semesterDate(sem){return sem==='2'?(String(profile.dateSemester2||'').trim()||profile.date):profile.date}
  function signature(sem){return `<div class="signature analysis-signature"><div>Mengetahui,<br>Kepala Sekolah${signatureSpace(profile.principalSignature,'Tanda tangan kepala sekolah')}<b>${esc(profile.principal)}</b>${identifierLine(profile.principalIdType,profile.principalId)}</div><div>${esc(profile.place)}, ${esc(semesterDate(sem))}<br>${esc(teacherRole)} Mata Pelajaran${signatureSpace(profile.teacherSignature,'Tanda tangan pengajar')}<b>${esc(profile.teacher)}</b>${identifierLine(profile.teacherIdType,profile.teacherId)}</div></div>`}
  function footer(text,sem){return `<div class="page-foot"><span>${esc(text)}</span><span>Kelas ${className} · Semester ${sem==='1'?'I':'II'} · ${esc(profile.year)}</span></div>`}
  function cover(sem){return `<section class="page portrait cover analysis-cover"><div class="page-inner cover-content"><div class="cover-kicker">KURIKULUM MERDEKA · PEMBELAJARAN MENDALAM</div><div class="cover-center"><small>E-PERANGKAT PEMBELAJARAN</small><h1>ANALISIS NILAI FORMATIF DAN SUMATIF</h1><h2>Seni Rupa · Kelas ${className} · Fase A · Semester ${sem==='1'?'I (Ganjil)':'II (Genap)'}</h2><div class="accent-line"></div><div class="identity-box"><table><tr><td>Satuan Pendidikan</td><td>:</td><td><b>${esc(profile.school)}</b></td></tr><tr><td>Program</td><td>:</td><td><b>${esc(profile.program)}</b></td></tr><tr><td>${esc(teacherRole)}</td><td>:</td><td><b>${esc(profile.teacher)}</b></td></tr><tr><td>Tahun Pelajaran</td><td>:</td><td><b>${esc(profile.year)}</b></td></tr></table></div></div><div class="cover-foot"><b>${esc(profile.school)}</b><span>${esc(profile.address||profile.region||'')}</span></div></div></section>`}
  function header(title,sem){return `<h1 class="doc-title">${esc(title)}</h1><div class="doc-head"><dl><dt>Satuan Pendidikan</dt><dd>:</dd><dd>${esc(profile.school)}</dd><dt>Mata Pelajaran</dt><dd>:</dd><dd>Seni Rupa</dd><dt>Tahun Pelajaran</dt><dd>:</dd><dd>${esc(profile.year)}</dd></dl><dl><dt>Program</dt><dd>:</dd><dd>${esc(profile.program)}</dd><dt>Kelas / Fase / Semester</dt><dd>:</dd><dd>${className} / A / ${sem==='1'?'I (Ganjil)':'II (Genap)'}</dd><dt>${esc(teacherRole)}</dt><dd>:</dd><dd>${esc(profile.teacher)}</dd></dl></div>`}
  function scorePages(sem,c){
    const tpChunks=[];for(let i=0;i<c.tps.length;i+=5)tpChunks.push(c.tps.slice(i,i+5));if(!tpChunks.length)tpChunks.push([]);
    const studentChunks=[];for(let i=0;i<students.length;i+=15)studentChunks.push(students.slice(i,i+15));
    const total=tpChunks.length*studentChunks.length;let pageNo=0,html='';
    for(const tpChunk of tpChunks){
      for(let sc=0;sc<studentChunks.length;sc++){
        pageNo++;const sub=studentChunks[sc],start=sc*15;
        html+=`<section class="page landscape analysis-print-page"><div class="page-inner">${pageNo===1?header('DAFTAR ANALISIS NILAI FORMATIF PER TP DAN SUMATIF',sem):`<div class="topline"><span>ANALISIS NILAI · LANJUTAN</span><span>Kelas ${className} · Semester ${sem==='1'?'I':'II'}</span></div>`}<div class="analysis-print-info"><b>Bagian ${pageNo} dari ${total}</b><span>Kolom TP ${tpChunk.length?`${c.tps.indexOf(tpChunk[0])+1}–${c.tps.indexOf(tpChunk[tpChunk.length-1])+1}`:'—'} dari ${c.tps.length}</span><span>KKTP ${c.threshold}</span></div><table class="tbl compact analysis-score-print"><thead><tr><th style="width:8mm">No.</th><th style="width:48mm">Nama Peserta Didik</th>${tpChunk.map(tp=>`<th><span>${esc(tp.code)}</span><small>Formatif</small></th>`).join('')}<th>Rerata<br>Formatif</th><th>Sumatif</th><th>Nilai<br>Akhir</th><th style="width:22mm">Ket.</th></tr></thead><tbody>${sub.map((s,i)=>{const row=c.rows[start+i],values=c.sd.formative[s.id]||{};return `<tr><td class="center">${start+i+1}</td><td>${esc(s.name||'')}</td>${tpChunk.map(tp=>`<td class="center">${values[tp.code]??''}</td>`).join('')}<td class="center">${row.formative===null?'':fmt(row.formative)}</td><td class="center">${row.summative===null?'':fmt(row.summative)}</td><td class="center bold">${row.final===null?'':fmt(row.final)}</td><td>${row.status}</td></tr>`}).join('')}<tr class="analysis-average-row"><td colspan="2">Rata-rata Kelas</td>${tpChunk.map(tp=>{const r=c.recap.find(x=>x.code===tp.code);return `<td class="center">${r?.avg===null?'':fmt(r?.avg)}</td>`}).join('')}<td class="center">${fmt(mean(c.rows.map(r=>r.formative)))}</td><td class="center">${fmt(mean(c.rows.map(r=>r.summative)))}</td><td class="center">${fmt(c.classAverage)}</td><td>KKTP ${c.threshold}</td></tr></tbody></table><div class="note"><b>Nilai akhir:</b> (${settings.formativeWeight}% × rerata formatif) + (${settings.summativeWeight}% × sumatif). Nilai yang belum diisi tidak dihitung dalam rerata formatif.</div>${footer(`Analisis Nilai · Bagian ${pageNo} dari ${total}`,sem)}</div></section>`;
      }
    }
    return html;
  }
  function recapPages(sem,c){
    let html='';const chunks=[];for(let i=0;i<c.recap.length;i+=7)chunks.push(c.recap.slice(i,i+7));if(!chunks.length)chunks.push([]);
    chunks.forEach((sub,idx)=>{html+=`<section class="page landscape analysis-recap-page"><div class="page-inner">${idx===0?header('ANALISIS NILAI · REKAP KETERCAPAIAN TUJUAN PEMBELAJARAN',sem):`<div class="topline"><span>REKAP KETERCAPAIAN TP · LANJUTAN</span><span>Kelas ${className} · Semester ${sem==='1'?'I':'II'}</span></div>`}<table class="tbl compact analysis-recap-print"><thead><tr><th style="width:9mm">No.</th><th style="width:22mm">Kode TP</th><th>Tujuan Pembelajaran</th><th style="width:20mm">Rata-rata</th><th style="width:17mm">Tuntas</th><th style="width:23mm">Belum Tuntas</th><th style="width:55mm">Rekomendasi Tindak Lanjut</th></tr></thead><tbody>${sub.map((r,i)=>`<tr><td class="center">${idx*7+i+1}</td><td class="bold">${esc(r.code)}</td><td>${esc(r.text)}</td><td class="center">${r.avg===null?'':fmt(r.avg)}</td><td class="center">${r.count?r.tuntas:''}</td><td class="center">${r.count?r.belum:''}</td><td>${esc(r.recommendation)}</td></tr>`).join('')}</tbody></table><div class="analysis-recap-summary"><span>Rata-rata kelas: <b>${fmt(c.classAverage)}</b></span><span>Batas ketuntasan: <b>${c.threshold}</b></span><span>Peserta didik bernilai: <b>${c.active.length}</b></span></div>${idx===chunks.length-1?signature(sem):''}${footer(`Rekap Ketercapaian TP · Bagian ${idx+1} dari ${chunks.length}`,sem)}</div></section>`});return html;
  }
  function buildAnalysis(){let html='';for(const sem of semesters){const c=calc(sem);html+=cover(sem)+scorePages(sem,c)+recapPages(sem,c)}return html}
  const html=buildAnalysis();
  if(section==='analysis')root.innerHTML=html;else root.insertAdjacentHTML('beforeend',html);
  document.title=`Analisis Nilai Seni Rupa Kelas ${className} - ${semesterParam}`;
})();

