(()=>{
  'use strict';

  const D=window.EPERANGKAT_DATA||{};
  const ORDER_KEY='eperangkat.bahasa-indonesia.fasec.v1.orders';
  const VIEW_KEY='eperangkat.bahasa-indonesia.fasec.v1.view';
  const GRADE_KEY='eperangkat.bahasa-indonesia.fasec.v1.grade';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gradeNumber={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
  let currentSemester=localStorage.getItem('eperangkat.bahasa-indonesia.fasec.v1.analysis.semester')||'1';
  let draftOrder=null;
  let recalcTimer=null;

  function getStore(){
    try{return JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}')}
    catch(_){return {activeId:'',orders:[]}}
  }
  function setStore(store){localStorage.setItem(ORDER_KEY,JSON.stringify(store))}
  function activeOrder(store=getStore()){
    return store.orders?.find(o=>o.id===store.activeId)||store.orders?.[0]||null;
  }
  function snapshot(order){const x=clone(order);delete x.history;return x}
  function addHistory(order,action,detail,before){
    order.history=Array.isArray(order.history)?order.history:[];
    order.history.unshift({
      id:`h-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      time:new Date().toISOString(),action,detail,snapshot:before||null
    });
    order.history=order.history.slice(0,250);
    order.updatedAt=new Date().toISOString();
  }
  function toast(text){
    const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.appendChild(el);
    setTimeout(()=>el.remove(),2400);
  }
  function grade(){return localStorage.getItem(GRADE_KEY)||activeOrder()?.grade||'V'}
  function classLabel(g,r=''){g=String(g||'V').trim().toUpperCase();const raw=String(r||'').trim().toUpperCase().replace(/\s+/g,' ');if(!raw)return g;const compact=raw.replace(/\s+/g,'');if(compact.startsWith(g)){const suffix=compact.slice(g.length);return suffix?`${g} ${suffix}`:g}return `${g} ${compact}`}
  function semesterName(sem=currentSemester){return sem==='1'?'Ganjil':'Genap'}
  function objectivesFor(g,sem){
    const semName=semesterName(sem),n=gradeNumber[g]||7;
    return (D.modules||[]).filter(m=>m.grade===g&&m.semester===semName).sort((a,b)=>a.chapter-b.chapter)
      .flatMap(m=>(m.objectives||[]).map((o,i)=>({
        code:`C${n}.${m.chapter}.${i+1}`,
        chapter:m.chapter,
        chapterTitle:m.title,
        text:o.text||String(o),
        jp:o.jp||''
      })));
  }
  function normalizeOrder(order){
    order.students=Array.isArray(order.students)?order.students.slice(0,30):[];
    while(order.students.length<30)order.students.push({id:`stu-${order.id||'order'}-${order.students.length+1}`,name:'',task:'',exam:''});
    order.students.forEach((s,i)=>{
      s.id=s.id||`stu-${order.id||'order'}-${i+1}`;
      if(/^Peserta Didik(?:\s+\d+)?$/i.test(String(s.name||'').trim()))s.name='';
    });
    order.analysis=order.analysis&&typeof order.analysis==='object'?order.analysis:{};
    order.analysis.version=3;
    order.analysis.settings={threshold:75,thresholds:{},formativeWeight:50,summativeWeight:50,...(order.analysis.settings||{})};
    order.analysis.settings.thresholds=order.analysis.settings.thresholds&&typeof order.analysis.settings.thresholds==='object'?order.analysis.settings.thresholds:{};
    order.analysis.grades=order.analysis.grades||{};
    for(const g of ["V"]){
      order.analysis.grades[g]=order.analysis.grades[g]||{};
      for(const sem of ['1','2']){
        order.analysis.grades[g][sem]=order.analysis.grades[g][sem]||{};
        const sd=order.analysis.grades[g][sem];
        sd.formative=sd.formative||{};
        sd.summative=sd.summative||{};
      }
    }
    return order;
  }
  function semData(order=draftOrder,g=grade(),sem=currentSemester){return order.analysis.grades[g][sem]}
  function numeric(v){
    if(v===''||v===null||v===undefined)return null;
    const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):null;
  }
  function thresholdFor(order=draftOrder,g=grade()){
    const settings=order?.analysis?.settings||{};
    const map=settings.thresholds&&typeof settings.thresholds==='object'?settings.thresholds:{};
    const own=numeric(map[g]);
    return own===null?(numeric(settings.threshold)??75):own;
  }
  function mean(values){
    const nums=values.map(numeric).filter(v=>v!==null);
    return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:null;
  }
  function finalScore(formative,summative,settings){
    const f=numeric(formative),s=numeric(summative);
    if(f===null&&s===null)return null;
    if(f===null)return s;if(s===null)return f;
    const fw=Math.max(0,Number(settings.formativeWeight)||0),sw=Math.max(0,Number(settings.summativeWeight)||0),total=fw+sw||100;
    return (f*fw+s*sw)/total;
  }
  function analysisCalc(order=draftOrder,g=grade(),sem=currentSemester){
    const tps=objectivesFor(g,sem),sd=semData(order,g,sem),settings=order.analysis.settings,threshold=thresholdFor(order,g);
    const students=order.students.map((student,index)=>{
      const row=sd.formative[student.id]||{};
      const formative=mean(tps.map(tp=>row[tp.code]));
      const summative=numeric(sd.summative[student.id]);
      const final=finalScore(formative,summative,settings);
      return {student,index,formative,summative,final,status:final===null?'':final>=threshold?'Tuntas':'Belum Tuntas'};
    });
    const active=students.filter(x=>String(x.student.name||'').trim()&&(x.final!==null||x.formative!==null||x.summative!==null));
    const recap=tps.map(tp=>{
      const scores=order.students.map(s=>numeric((sd.formative[s.id]||{})[tp.code])).filter(v=>v!==null);
      const avg=scores.length?mean(scores):null,tuntas=scores.filter(v=>v>=threshold).length,belum=scores.length-tuntas;
      let recommendation='Belum ada data nilai.';
      if(scores.length){
        if(belum===0)recommendation='Pengayaan dan pendalaman.';
        else if(belum/Math.max(1,scores.length)<=0.3)recommendation='Remedial terarah, umpan balik, dan asesmen ulang.';
        else recommendation='Pembelajaran ulang terarah, latihan bertahap, dan asesmen ulang.';
      }
      return {...tp,avg,tuntas,belum,count:scores.length,recommendation};
    });
    const finals=active.map(x=>x.final).filter(v=>v!==null);
    return {
      tps,students,active,recap,threshold,
      classAverage:finals.length?mean(finals):null,
      complete:active.filter(x=>x.status==='Tuntas').length,
      incomplete:active.filter(x=>x.status==='Belum Tuntas').length,
      highest:finals.length?Math.max(...finals):null,
      lowest:finals.length?Math.min(...finals):null
    };
  }
  const fmt=v=>v===null||v===undefined||Number.isNaN(v)?'—':Number(v).toFixed(1);
  function printUrl(semester=currentSemester){
    const o=activeOrder(),params=new URLSearchParams({grade:grade(),section:'analysis',semester,order:o?.id||'',wm:'auto'});
    return `print.html?${params}`;
  }
  function pageHead(){
    return `<div class="page-head"><div><span class="eyebrow">Kelas ${classLabel(grade(),activeOrder()?.profile?.rombel)} · Fase C</span><h1>Analisis Nilai Formatif dan Sumatif</h1><p>Nilai formatif dicatat per tujuan pembelajaran. Aplikasi menghitung rerata formatif, nilai akhir, ketuntasan peserta didik, ketercapaian setiap TP, serta rekomendasi remedial dan pengayaan secara otomatis.</p></div><div class="actions"><a class="btn primary" href="${printUrl(currentSemester)}" target="_blank">Cetak Semester ${currentSemester==='1'?'I':'II'}</a><a class="btn secondary" href="${printUrl('both')}" target="_blank">Cetak Tahunan</a></div></div>`;
  }
  function scoreInput(value,attrs=''){
    return `<input class="analysis-score-input" type="number" min="0" max="100" step="1" value="${value??''}" ${attrs}>`;
  }
  function renderScoreTable(calc){
    const sd=semData(),students=draftOrder.students;
    return `<div class="analysis-table-wrap"><table class="doc-table analysis-entry-table"><thead><tr><th class="sticky-no">No.</th><th class="sticky-name">Nama Peserta Didik</th>${calc.tps.map(tp=>`<th title="${esc(tp.text)}"><span>${esc(tp.code)}</span><small>Formatif</small></th>`).join('')}<th>Rerata<br>Formatif</th><th>Sumatif</th><th>Nilai<br>Akhir</th><th>Keterangan</th></tr></thead><tbody>${students.map((s,i)=>{
      const values=sd.formative[s.id]||{},row=calc.students[i];
      return `<tr data-student-row="${esc(s.id)}"><td class="sticky-no center">${i+1}</td><td class="sticky-name"><input class="analysis-name-input" data-analysis-name="${esc(s.id)}" value="${esc(s.name||'')}" placeholder="Nama peserta didik"></td>${calc.tps.map(tp=>`<td>${scoreInput(values[tp.code]??'',`data-analysis-score="${esc(s.id)}" data-tp="${esc(tp.code)}"`)}</td>`).join('')}<td class="analysis-result" data-result-formative="${esc(s.id)}">${fmt(row.formative)}</td><td>${scoreInput(sd.summative[s.id]??'',`data-analysis-summative="${esc(s.id)}"`)}</td><td class="analysis-result bold" data-result-final="${esc(s.id)}">${fmt(row.final)}</td><td data-result-status="${esc(s.id)}"><span class="analysis-status ${row.status==='Tuntas'?'complete':row.status?'incomplete':''}">${row.status||'—'}</span></td></tr>`;
    }).join('')}</tbody></table></div>`;
  }
  function recapRows(calc){
    return calc.recap.map((r,i)=>`<tr><td>${i+1}</td><td><b>${esc(r.code)}</b></td><td>${esc(r.text)}</td><td class="center">${fmt(r.avg)}</td><td class="center">${r.count?r.tuntas:'—'}</td><td class="center">${r.count?r.belum:'—'}</td><td>${esc(r.recommendation)}</td></tr>`).join('');
  }
  function studentFollowupRows(calc){
    return calc.students.filter(x=>String(x.student.name||'').trim()).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.student.name)}</td><td class="center">${fmt(r.formative)}</td><td class="center">${fmt(r.summative)}</td><td class="center"><b>${fmt(r.final)}</b></td><td><span class="analysis-status ${r.status==='Tuntas'?'complete':r.status?'incomplete':''}">${r.status||'Belum ada nilai'}</span></td><td>${r.final===null?'Lengkapi data nilai.':r.final>=calc.threshold?'Pengayaan, pendalaman, atau tantangan lanjutan.':'Remedial terarah pada TP yang belum tercapai dan asesmen ulang.'}</td></tr>`).join('')||'<tr><td colspan="7" class="empty-cell">Belum ada nama peserta didik.</td></tr>';
  }
  function summaryCards(calc){
    return `<div class="analysis-summary" id="analysisSummary"><article><span>Rata-rata Kelas</span><b data-summary="average">${fmt(calc.classAverage)}</b></article><article><span>Tuntas</span><b data-summary="complete">${calc.complete}</b></article><article><span>Belum Tuntas</span><b data-summary="incomplete">${calc.incomplete}</b></article><article><span>Nilai Tertinggi</span><b data-summary="highest">${fmt(calc.highest)}</b></article><article><span>Nilai Terendah</span><b data-summary="lowest">${fmt(calc.lowest)}</b></article></div>`;
  }
  function renderAnalysis(){
    const store=getStore(),live=activeOrder(store);if(!live)return;
    draftOrder=normalizeOrder(clone(live));
    const calc=analysisCalc();
    localStorage.setItem(VIEW_KEY,'analysis');
    localStorage.setItem('eperangkat.bahasa-indonesia.fasec.v1.analysis.semester',currentSemester);
    $$('#mainNav [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='analysis'));
    $$('[data-grade]').forEach(b=>b.classList.toggle('active',b.dataset.grade===grade()));
    const app=$('#app');if(!app)return;
    app.innerHTML=pageHead()+`
      <div class="analysis-semester-tabs"><button data-analysis-semester="1" class="${currentSemester==='1'?'active':''}">Semester I · Ganjil</button><button data-analysis-semester="2" class="${currentSemester==='2'?'active':''}">Semester II · Genap</button></div>
      <section class="card analysis-controls"><div class="analysis-setting-grid"><label>KKTP Kelas ${grade()}<input id="analysisThreshold" type="number" min="0" max="100" value="${thresholdFor(draftOrder,grade())}"></label><label>Bobot Formatif (%)<input id="analysisFormativeWeight" type="number" min="0" max="100" value="${draftOrder.analysis.settings.formativeWeight}"></label><label>Bobot Sumatif (%)<input id="analysisSummativeWeight" type="number" min="0" max="100" value="${draftOrder.analysis.settings.summativeWeight}"></label><div class="analysis-control-note"><b>Rumus nilai akhir</b><span>Rerata formatif × bobot formatif + sumatif × bobot sumatif. Jika salah satu belum diisi, nilai yang tersedia digunakan sementara.</span></div></div><div class="actions"><label class="btn secondary import-label">Impor CSV<input type="file" id="analysisCsvInput" accept=".csv,text/csv"></label><button class="btn secondary" id="analysisExportCsv">Ekspor CSV</button><button class="btn secondary" id="analysisReset">Kosongkan Nilai Semester</button><button class="btn primary" id="analysisSave">Simpan Analisis</button></div></section>
      ${summaryCards(calc)}
      <section class="card analysis-entry-card"><div class="analysis-section-head"><div><span class="eyebrow">DAFTAR NILAI FORMATIF PER TP DAN SUMATIF</span><h2>Semester ${currentSemester==='1'?'I (Ganjil)':'II (Genap)'}</h2><p>${calc.tps.length} tujuan pembelajaran · maksimal 30 peserta didik. Geser tabel ke kanan untuk melihat seluruh TP.</p></div><span class="analysis-kktp-badge">KKTP <b>${calc.threshold}</b></span></div>${renderScoreTable(calc)}</section>
      <section class="card"><div class="analysis-section-head"><div><span class="eyebrow">REKAP KETERCAPAIAN TUJUAN PEMBELAJARAN</span><h2>Analisis per TP</h2><p>Rata-rata, jumlah peserta tuntas dan belum tuntas, serta rekomendasi tindak lanjut dihitung dari nilai formatif setiap TP.</p></div></div><div class="scroll"><table class="doc-table analysis-recap-table"><thead><tr><th>No.</th><th>Kode TP</th><th>Tujuan Pembelajaran</th><th>Rata-rata</th><th>Tuntas</th><th>Belum Tuntas</th><th>Rekomendasi Tindak Lanjut</th></tr></thead><tbody id="analysisRecapBody">${recapRows(calc)}</tbody></table></div></section>
      <section class="card"><div class="analysis-section-head"><div><span class="eyebrow">TINDAK LANJUT INDIVIDUAL</span><h2>Rekap peserta didik</h2></div></div><div class="scroll"><table class="doc-table analysis-followup-table"><thead><tr><th>No.</th><th>Nama</th><th>Rerata Formatif</th><th>Sumatif</th><th>Nilai Akhir</th><th>Ket.</th><th>Tindak Lanjut</th></tr></thead><tbody id="analysisFollowupBody">${studentFollowupRows(calc)}</tbody></table></div></section>`;
    bindAnalysisEvents();
    window.scrollTo(0,0);
  }
  function updateCalculations(){
    const calc=analysisCalc();
    calc.students.forEach(r=>{
      const sid=r.student.id;
      const f=$(`[data-result-formative="${CSS.escape(sid)}"]`),v=$(`[data-result-final="${CSS.escape(sid)}"]`),s=$(`[data-result-status="${CSS.escape(sid)}"]`);
      if(f)f.textContent=fmt(r.formative);if(v)v.textContent=fmt(r.final);
      if(s)s.innerHTML=`<span class="analysis-status ${r.status==='Tuntas'?'complete':r.status?'incomplete':''}">${r.status||'—'}</span>`;
    });
    const values={average:fmt(calc.classAverage),complete:calc.complete,incomplete:calc.incomplete,highest:fmt(calc.highest),lowest:fmt(calc.lowest)};
    Object.entries(values).forEach(([k,v])=>{const el=$(`[data-summary="${k}"]`);if(el)el.textContent=v});
    const recap=$('#analysisRecapBody');if(recap)recap.innerHTML=recapRows(calc);
    const follow=$('#analysisFollowupBody');if(follow)follow.innerHTML=studentFollowupRows(calc);
  }
  function scheduleCalc(){clearTimeout(recalcTimer);recalcTimer=setTimeout(updateCalculations,120)}
  function bindAnalysisEvents(){
    $$('[data-analysis-semester]').forEach(btn=>btn.onclick=()=>{currentSemester=btn.dataset.analysisSemester;localStorage.setItem('eperangkat.bahasa-indonesia.fasec.v1.analysis.semester',currentSemester);renderAnalysis()});
    $('#analysisThreshold').oninput=e=>{draftOrder.analysis.settings.thresholds=draftOrder.analysis.settings.thresholds&&typeof draftOrder.analysis.settings.thresholds==='object'?draftOrder.analysis.settings.thresholds:{};draftOrder.analysis.settings.thresholds[grade()]=numeric(e.target.value)??75;scheduleCalc()};
    $('#analysisFormativeWeight').oninput=e=>{draftOrder.analysis.settings.formativeWeight=numeric(e.target.value)??0;scheduleCalc()};
    $('#analysisSummativeWeight').oninput=e=>{draftOrder.analysis.settings.summativeWeight=numeric(e.target.value)??0;scheduleCalc()};
    $$('[data-analysis-name]').forEach(inp=>inp.oninput=()=>{const s=draftOrder.students.find(x=>x.id===inp.dataset.analysisName);if(s)s.name=inp.value;scheduleCalc()});
    $$('[data-analysis-score]').forEach(inp=>inp.oninput=()=>{
      const sd=semData(),sid=inp.dataset.analysisScore,code=inp.dataset.tp;sd.formative[sid]=sd.formative[sid]||{};
      const v=numeric(inp.value);if(v===null)delete sd.formative[sid][code];else sd.formative[sid][code]=v;scheduleCalc();
    });
    $$('[data-analysis-summative]').forEach(inp=>inp.oninput=()=>{const sd=semData(),v=numeric(inp.value);if(v===null)delete sd.summative[inp.dataset.analysisSummative];else sd.summative[inp.dataset.analysisSummative]=v;scheduleCalc()});
    $('#analysisSave').onclick=()=>persistDraft('Analisis nilai diperbarui',`Nilai formatif per TP dan sumatif Semester ${currentSemester==='1'?'I':'II'} disimpan.`);
    $('#analysisReset').onclick=()=>{
      if(!confirm(`Kosongkan seluruh nilai Semester ${currentSemester==='1'?'I':'II'}? Nama peserta didik tidak dihapus.`))return;
      const sd=semData();sd.formative={};sd.summative={};renderAnalysis();toast('Nilai semester dikosongkan. Klik Simpan Analisis untuk menyimpan perubahan.');
    };
    $('#analysisExportCsv').onclick=exportCsv;
    $('#analysisCsvInput').onchange=importCsv;
  }
  function persistDraft(action,detail){
    const store=getStore(),live=store.orders.find(o=>o.id===draftOrder.id);if(!live)return;
    const before=snapshot(live);
    live.students=clone(draftOrder.students);
    live.analysis=clone(draftOrder.analysis);
    addHistory(live,action,detail,before);
    setStore(store);
    if(store.activeId===live.id)localStorage.setItem('eperangkat.bahasa-indonesia.fasec.v1.students',JSON.stringify(live.students));
    toast('Analisis nilai berhasil disimpan.');
  }
  function csvEscape(v){const s=String(v??'');return /[",;\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
  function exportCsv(){
    const calc=analysisCalc(),sd=semData();
    const rows=[['Nama Peserta Didik',...calc.tps.map(x=>x.code),'Sumatif']];
    draftOrder.students.forEach(s=>{
      if(!String(s.name||'').trim()&&!Object.keys(sd.formative[s.id]||{}).length&&numeric(sd.summative[s.id])===null)return;
      rows.push([s.name,...calc.tps.map(tp=>(sd.formative[s.id]||{})[tp.code]??''),sd.summative[s.id]??'']);
    });
    if(rows.length===1)rows.push(['',...calc.tps.map(()=>''),'']);
    const text='\ufeff'+rows.map(r=>r.map(csvEscape).join(',')).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.download=`Analisis_Nilai_bahasa-indonesia_Kelas_${grade()}_Semester_${currentSemester}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function parseCsv(text){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++}else if(ch==='"')quoted=false;else cell+=ch}
      else if(ch==='"')quoted=true;else if(ch===','||ch===';'){row.push(cell.trim());cell=''}else if(ch==='\n'){row.push(cell.trim());rows.push(row);row=[];cell=''}else if(ch!=='\r')cell+=ch;
    }
    if(cell.length||row.length){row.push(cell.trim());rows.push(row)}return rows.filter(r=>r.some(Boolean));
  }
  function importCsv(e){
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();reader.onload=()=>{
      const rows=parseCsv(String(reader.result||'').replace(/^\ufeff/,''));if(rows.length<2){alert('CSV tidak memiliki baris data.');return}
      const headers=rows[0].map(x=>x.trim()),calc=analysisCalc(),codeIndex=new Map(calc.tps.map(tp=>[tp.code.toUpperCase(),tp.code]));
      const nameIdx=headers.findIndex(h=>/nama/i.test(h));const sumIdx=headers.findIndex(h=>/sumatif|ujian/i.test(h));
      const sd=semData();
      rows.slice(1,31).forEach((r,i)=>{
        const s=draftOrder.students[i];if(!s)return;s.name=(r[nameIdx>=0?nameIdx:0]||'').trim();sd.formative[s.id]={};
        headers.forEach((h,idx)=>{const code=codeIndex.get(h.toUpperCase());if(!code)return;const v=numeric(r[idx]);if(v!==null)sd.formative[s.id][code]=v});
        const sv=numeric(r[sumIdx]);if(sv===null)delete sd.summative[s.id];else sd.summative[s.id]=sv;
      });
      persistDraft('Analisis nilai diimpor dari CSV',`${Math.min(rows.length-1,30)} baris Semester ${currentSemester==='1'?'I':'II'} diimpor.`);renderAnalysis();
    };reader.readAsText(file);
  }
  function enhancePrintOptions(){
    if(localStorage.getItem(VIEW_KEY)!=='print')return;
    const app=$('#app');if(!app||app.querySelector('[data-v7-analysis-option]'))return;
    const grids=$$('.option-grid',app),target=grids[grids.length-1];if(!target)return;
    const article=document.createElement('article');article.className='option';article.dataset.v7AnalysisOption='1';article.innerHTML=`<span class="eyebrow">PAKET</span><h3>Analisis Nilai</h3><p>Nilai formatif per TP, sumatif, nilai akhir, ketuntasan, rekap ketercapaian TP, dan rekomendasi tindak lanjut.</p><div class="semester-mini-actions"><a class="btn secondary small" href="print.html?grade=${grade()}&section=analysis&semester=both" target="_blank">Tahunan</a><a class="btn secondary small" href="print.html?grade=${grade()}&section=analysis&semester=1" target="_blank">Sem. I</a><a class="btn secondary small" href="print.html?grade=${grade()}&section=analysis&semester=2" target="_blank">Sem. II</a></div>`;
    target.appendChild(article);
    const full=$('.print-card p',app);if(full&&!/Analisis Nilai/.test(full.textContent))full.textContent=full.textContent.replace(/dan Daftar Nilai\.?/,'dan Analisis Nilai.');
    $$('.semester-option p',app).forEach(p=>{if(!/analisis nilai/i.test(p.textContent))p.textContent=p.textContent.replace(/dan lampiran semester/i,'analisis nilai, dan seluruh lampiran semester')});
  }
  function bindNavigation(){
    const nav=$('[data-view="analysis"]');if(nav)nav.onclick=e=>{e.preventDefault();localStorage.setItem(VIEW_KEY,'analysis');renderAnalysis();$('#sidebar')?.classList.remove('open')};
    $$('[data-grade]').forEach(btn=>{
      const original=btn.onclick;
      btn.onclick=e=>{
        if(localStorage.getItem(VIEW_KEY)==='analysis'){
          e.preventDefault();localStorage.setItem(GRADE_KEY,btn.dataset.grade);
          const store=getStore(),o=activeOrder(store);if(o){o.grade=btn.dataset.grade;setStore(store)}
          location.reload();return;
        }
        if(typeof original==='function')original.call(btn,e);
      };
    });
  }

  bindNavigation();
  const observer=new MutationObserver(()=>enhancePrintOptions());observer.observe($('#app'),{childList:true,subtree:true});
  if(localStorage.getItem(VIEW_KEY)==='analysis')setTimeout(renderAnalysis,0);else setTimeout(enhancePrintOptions,0);
})();

