(function(){
'use strict';
if(window.__epPromesRuntimeSchoolStartV3)return;
window.__epPromesRuntimeSchoolStartV3=true;
const DAYS={MINGGU:0,SENIN:1,SELASA:2,RABU:3,KAMIS:4,JUMAT:5,SABTU:6};
const MONTH=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function J(v,d){try{return JSON.parse(v||'')||d}catch(_){return d}}
function prefix(){
  const m=location.pathname.match(/\/apps\/fase-([a-f])\/E-Perangkat_(.+?)_Fase-[A-F](?:\/|$)/i);
  return m?`eperangkat.${decodeURIComponent(m[2]).toLowerCase()}.fase${m[1].toLowerCase()}.v1`:'';
}
const PRE=prefix();
function store(){return PRE?J(localStorage.getItem(PRE+'.orders'),{activeId:'',orders:[]}):{activeId:'',orders:[]}}
function order(){
  const s=store(),n=String($('#ordNumber')?.value||'').trim(),qid=new URLSearchParams(location.search).get('order')||'';
  return (s.orders||[]).find(o=>qid&&o.id===qid)||(s.orders||[]).find(o=>n&&String(o.number||'')===n)||(s.orders||[]).find(o=>o.id===s.activeId)||(s.orders||[])[0]||null;
}
function prof(){return {...(order()?.profile||{}),...J(PRE&&localStorage.getItem(PRE+'.profile'),{})}}
function grade(){return String(new URLSearchParams(location.search).get('grade')||(PRE&&localStorage.getItem(PRE+'.grade'))||order()?.grade||'V').toUpperCase()}
function ck(){return PRE+'.promes-date.'+String(order()?.id||'profile')}
function sharedKey(){return PRE+'.promes-date.shared'}
function queryCfg(){
  const p=new URLSearchParams(location.search),mode=p.get('epm');if(!['ringkas','otomatis','jadwal'].includes(mode))return{};
  const days=k=>String(p.get(k)||'').split(',').map(x=>x.toUpperCase()).filter(x=>DAYS[x]!==undefined);
  return{mode,d1:days('epd1'),d2:days('epd2'),j1:Math.max(1,+p.get('epj1')||2),j2:Math.max(1,+p.get('epj2')||2),s1:p.get('eps1')||'',s2:p.get('eps2')||''};
}
function cfg(){const x={mode:'ringkas',d1:[],d2:[],j1:2,j2:2,s1:'2026-07-13',s2:/fase[abcd]\.v1$/i.test(PRE)?'2027-01-06':'2027-01-04',...J(PRE&&localStorage.getItem(sharedKey()),{}),...J(PRE&&localStorage.getItem(ck()),{}),...queryCfg()};if(/fase[abcd]\.v1$/i.test(PRE)&&(!x.s2||x.s2==='2027-01-04'))x.s2='2027-01-06';return x}
function save(x){if(!PRE)return;const next={...cfg(),...x,updatedAt:new Date().toISOString()};localStorage.setItem(ck(),JSON.stringify(next));localStorage.setItem(sharedKey(),JSON.stringify(next))}
function cal(){const o=order();return o?.calendar&&Array.isArray(o.calendar.events)?o.calendar:{events:[]}}
function sched(){const p=prof();return Array.isArray(p.teachingSchedule)?p.teachingSchedule:[]}
function years(){const m=String(prof().year||cal().year||'2026/2027').match(/(20\d{2})\D+(20\d{2})/);return m?[+m[1],+m[2]]:[2026,2027]}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function blocked(d,schoolStartWeek=false){
  const k=iso(d);
  return (cal().events||[]).some(e=>{const a=String(e.start||'').slice(0,10),b=String(e.end||e.start||'').slice(0,10),t=String(e.type||'').toLowerCase(),n=String(e.title||'');if(!a||k<a||k>b)return false;if(schoolStartWeek&&(t==='semester'||/MPLS|pengenalan lingkungan|permulaan sekolah|awal masuk/i.test(n)))return false;return ['national','semester','assessment','report'].includes(t)||/libur|ujian|asesmen|rapor|MPLS|TKA|HUT/i.test(n)});
}
function range(sem,c=cfg()){
  const [a,b]=years(),ev=cal().events||[];
  const entered=String(sem===1?c.s1:c.s2||'').slice(0,10),parsed=entered?new Date(entered+'T12:00:00'):null;
  const firstSchoolDay=parsed&&!isNaN(parsed)?parsed:(sem===1&&a===2026?new Date(2026,6,13,12):sem===1?new Date(a,6,1,12):new Date(b,0,1,12));
  let s=sem===1?new Date(firstSchoolDay):new Date(b,0,1,12),e=sem===1?new Date(a,11,31,12):new Date(b,5,30,12);
  if(sem===2)s=new Date(firstSchoolDay);
  const re=sem===1?/KBM\s*efektif/i:/Permulaan sekolah semester genap/i,h=ev.find(x=>re.test(String(x.title||'')));
  if(h?.start){const d=new Date(String(h.start).slice(0,10)+'T12:00:00');if(!isNaN(d))s=d<firstSchoolDay?new Date(firstSchoolDay):d}
  return[s,e];
}
function dayMap(sem,c){
  const out={};
  if(c.mode==='jadwal'){
    sched().filter(r=>String(r.semester||'1')===String(sem)).forEach(r=>{const cl=String(r.className||'').toUpperCase().replace(/\s+/g,''),m=cl.match(/^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)/);if(m&&m[1]!==grade())return;const d=String(r.day||'').toUpperCase(),h=+r.hours||0;if(DAYS[d]!==undefined&&h>0)out[d]=(out[d]||0)+h});
  }else if(c.mode==='otomatis'){
    const ds=sem===1?c.d1:c.d2,j=Math.max(1,+(sem===1?c.j1:c.j2)||2);
    (ds||[]).forEach(d=>{d=String(d).toUpperCase();if(DAYS[d]!==undefined)out[d]=j});
  }
  return out;
}
function slots(sem,c){
  const map=dayMap(sem,c),[s,e]=range(sem,c),out=[];
  const startWeek=weekKey(s);
  for(let d=new Date(s);d<=e;d.setDate(d.getDate()+1)){const name=Object.keys(DAYS).find(k=>DAYS[k]===d.getDay()),cap=+map[name]||0;if(cap&&!blocked(d,weekKey(d)===startWeek))out.push({d:new Date(d),left:cap})}
  return out;
}
function alloc(jps,sem,c){
  const s=slots(sem,c),out=[],p={i:0};
  jps.forEach(v=>{let left=Math.max(0,+v||0),ds=[];while(left>0&&p.i<s.length){const x=s[p.i];if(x.left<=0){p.i++;continue}const take=Math.min(left,x.left);if(!ds.some(d=>iso(d)===iso(x.d)))ds.push(new Date(x.d));x.left-=take;left-=take;if(x.left<=0)p.i++}out.push(ds)});
  return out;
}
function fmt(ds){
  if(!ds?.length)return '—';const g=[];
  ds.forEach(d=>{const k=d.getFullYear()+'-'+d.getMonth(),x=g[g.length-1];if(x&&x.k===k)x.a.push(d.getDate());else g.push({k,m:MONTH[d.getMonth()],y:d.getFullYear(),a:[d.getDate()]})});
  return g.map((x,i)=>x.a.join(', ')+' '+x.m+(i===g.length-1?' '+x.y:'')).join('; ');
}
function semText(t){
  t=String(t||'');
  const ganjil=t.search(/SEMESTER\s+(?:GANJIL|I(?!I)|1)\b/i),genap=t.search(/SEMESTER\s+(?:GENAP|II|2)\b/i);
  if(ganjil>=0&&(genap<0||ganjil<genap))return 1;
  if(genap>=0)return 2;
  return 1;
}
function weekKey(d){const x=new Date(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return iso(x)}
function monthWeekKey(d){const first=new Date(d.getFullYear(),d.getMonth(),1,12),mondayOffset=(first.getDay()+6)%7,week=Math.ceil((d.getDate()+mondayOffset)/7);return MONTH[d.getMonth()]+'-'+week}
function dataRows(t,min=7){return $$('tbody tr',t).filter(r=>/^\d+$/.test(r.cells?.[0]?.textContent?.trim()||'')&&r.cells.length>=min)}
function patchDetail(t,sem,c){
  if(!t)return;const sig=JSON.stringify([sem,c.mode,c.d1,c.d2,c.j1,c.j2,c.s1,c.s2,sched(),cal().events||[]]);if(t.dataset.epDateSig===sig)return;
  const rs=dataRows(t),a=alloc(rs.map(r=>+r.cells[4].textContent||0),sem,c);t.querySelector('.ep-date-head')?.remove();const h=$('thead tr',t);
  if(h){const x=document.createElement('th');x.className='ep-date-head';x.textContent='Tanggal Pelaksanaan';h.appendChild(x)}
  rs.forEach((r,i)=>{r.querySelector('.ep-date-cell')?.remove();const x=document.createElement('td');x.className='ep-date-cell';x.textContent=fmt(a[i]);r.appendChild(x)});
  $$('tbody tr',t).filter(r=>!/^\d+$/.test(r.cells?.[0]?.textContent?.trim()||'')).forEach(r=>{const x=r.cells?.[r.cells.length-1];if(x&&x.colSpan===2)x.colSpan=3});t.dataset.epDateSig=sig;
}
function summaryLayout(t){
  const rows=t.tHead?.rows;if(!rows||rows.length<3)return null;
  const months=[];
  [...rows[0].cells].filter(x=>x.rowSpan<3).forEach(x=>{const name=MONTH.find(m=>String(x.textContent||'').toLowerCase().includes(m.toLowerCase()));for(let i=0;i<(x.colSpan||1);i++)months.push(name||'')});
  const weeks=[...rows[rows.length-1].cells].map(x=>parseInt(x.textContent,10));
  if(!months.length||months.length!==weeks.length||!months.some(Boolean)||weeks.some(x=>!x))return null;
  const fixed=[...rows[0].cells].filter(x=>x.rowSpan>=3).reduce((n,x)=>n+(x.colSpan||1),0)||3;
  return{fixed,slots:months.map((month,i)=>({month,week:weeks[i],key:month+'-'+weeks[i]}))};
}
function rememberCell(cell){if(cell.dataset.epOrigText===undefined){cell.dataset.epOrigText=cell.textContent||'';cell.dataset.epOrigMark=cell.classList.contains('mark')?'1':'0'}}
function restoreSummary(t){
  const layout=summaryLayout(t);if(!layout)return;
  dataRows(t,layout.fixed+layout.slots.length).forEach(r=>layout.slots.forEach((_,i)=>{const cell=r.cells[layout.fixed+i];if(!cell)return;rememberCell(cell);cell.textContent=cell.dataset.epOrigText||'';cell.classList.toggle('mark',cell.dataset.epOrigMark==='1');cell.classList.remove('ep-date-mark');cell.removeAttribute('title')}));
  delete t.dataset.epSummarySig;
}
function patchSummary(t,sem,c){
  const layout=summaryLayout(t);if(!layout)return;
  const rs=dataRows(t,layout.fixed+layout.slots.length),assigned=alloc(rs.map(r=>+r.cells[2]?.textContent||0),sem,c);
  if(!assigned.some(x=>x.length)){restoreSummary(t);return}
  const sig=JSON.stringify([sem,c.mode,c.d1,c.d2,c.j1,c.j2,c.s1,c.s2,sched(),cal().events||[]]);if(t.dataset.epSummarySig===sig)return;
  rs.forEach((r,ri)=>{
    const by=new Map();
    assigned[ri].forEach(d=>{const key=monthWeekKey(d);if(!layout.slots.some(x=>x.key===key))return;const a=by.get(key)||[];if(!a.includes(d.getDate()))a.push(d.getDate());by.set(key,a)});
    layout.slots.forEach((slot,i)=>{const cell=r.cells[layout.fixed+i];if(!cell)return;rememberCell(cell);const dates=(by.get(slot.key)||[]).sort((a,b)=>a-b);cell.textContent=dates.join(',');cell.classList.toggle('mark',dates.length>0);cell.classList.toggle('ep-date-mark',dates.length>0);if(dates.length){cell.title='Tanggal pelaksanaan: '+dates.join(', ')+' '+slot.month+' '+years()[sem===1?0:1]}else cell.removeAttribute('title')});
  });
  t.dataset.epSummarySig=sig;
}
function summaryTables(root=document){return $$('table',root).filter(t=>{const h=String(t.tHead?.textContent||'');const layout=summaryLayout(t);return /HEB/i.test(h)&&layout&&dataRows(t,layout.fixed+layout.slots.length).length>0})}
function checks(sem,c){const set=new Set(sem===1?c.d1:c.d2);return ['SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'].map(d=>`<label style="display:flex;gap:5px;align-items:center"><input type="checkbox" data-ep-day="${sem}" value="${d}" ${set.has(d)?'checked':''}>${d[0]+d.slice(1).toLowerCase()}</label>`).join('')}
function card(c){return `<section id="epPromesCfg" class="card" style="margin-bottom:16px"><span class="eyebrow">TINGKAT DETAIL PROGRAM SEMESTER</span><h2>Pilih format Program Semester</h2><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px"><label class="option"><input type="radio" name="epmode" value="ringkas" ${c.mode==='ringkas'?'checked':''}> <b>Ringkas</b><small style="display:block">Tanpa tanggal spesifik.</small></label><label class="option"><input type="radio" name="epmode" value="otomatis" ${c.mode==='otomatis'?'checked':''}> <b>Tanggal Otomatis</b><small style="display:block">Tanggal tampil juga di kotak berwarna versi ringkas.</small></label><label class="option"><input type="radio" name="epmode" value="jadwal" ${c.mode==='jadwal'?'checked':''}> <b>Berdasarkan Jadwal Mengajar</b><small style="display:block">Tanggal mengikuti jadwal terstruktur yang disimpan.</small></label></div><div class="ep-school-start" style="display:grid;grid-template-columns:repeat(2,minmax(220px,1fr));gap:12px;margin-top:12px;padding:12px;border:1px solid #b9d7ea;border-radius:10px;background:#f0f8fd"><label><b>Tanggal Mulai Sekolah Semester I</b><small style="display:block;margin:3px 0 6px">Tanggal paling awal untuk perhitungan Promes ganjil.</small><input type="date" data-ep-start="1" value="${c.s1||'2026-07-13'}"></label><label><b>Tanggal Mulai Sekolah Semester II</b><small style="display:block;margin:3px 0 6px">Tanggal paling awal untuk perhitungan Promes genap.</small><input type="date" data-ep-start="2" value="${c.s2||'2027-01-04'}"></label></div><div id="epAuto" style="${c.mode==='otomatis'?'':'display:none'};margin-top:10px;padding:10px;border:1px solid #dbe4ea;border-radius:10px">${[1,2].map(s=>`<div style="display:grid;grid-template-columns:100px 1fr 120px;gap:8px;margin-top:${s===2?8:0}px"><b>Semester ${s===1?'I':'II'}</b><div style="display:flex;gap:8px;flex-wrap:wrap">${checks(s,c)}</div><label>JP/pertemuan <input type="number" min="1" max="12" data-ep-jp="${s}" value="${s===1?c.j1:c.j2}" style="width:64px"></label></div>`).join('')}</div><div id="epSched" style="${c.mode==='jadwal'?'':'display:none'};margin-top:10px;padding:10px;border:1px solid #dbe4ea;border-radius:10px"><b>Jadwal yang terbaca:</b> ${sched().length?sched().map(x=>`${x.day||'-'} ${x.hours||0} JP`).join(', '):'Belum ada jadwal terstruktur.'}</div></section>`}
function printUrl(raw,c=cfg()){
  try{const u=new URL(raw,location.href);if(!/print\.html$/i.test(u.pathname))return raw;u.protocol=location.protocol;u.host=location.host;u.searchParams.set('epm',c.mode);u.searchParams.set('epd1',(c.d1||[]).join(','));u.searchParams.set('epd2',(c.d2||[]).join(','));u.searchParams.set('epj1',String(c.j1||2));u.searchParams.set('epj2',String(c.j2||2));u.searchParams.set('eps1',String(c.s1||'2026-07-13'));u.searchParams.set('eps2',String(c.s2||'2027-01-04'));u.searchParams.set('epcfg','school-start-v2');return u.href}catch(_){return raw}
}
function carryConfig(c){
  $$('a[href*="print.html"]').forEach(a=>{a.href=printUrl(a.href,c)});
  if(!window.__epPromesOpenPatched){const nativeOpen=window.open.bind(window);window.open=function(url,target,features){return nativeOpen(printUrl(url,cfg()),target,features)};window.__epPromesOpenPatched=true}
  if(!window.__epPromesPrintClickPatched){document.addEventListener('click',e=>{const a=e.target.closest?.('a[href*="print.html"]');if(a)a.href=printUrl(a.getAttribute('href')||a.href,cfg())},true);window.__epPromesPrintClickPatched=true}
}
function boxConfig(box){
  const mode=$('input[name="epmode"]:checked',box)?.value||'ringkas',days=s=>$$(`[data-ep-day="${s}"]:checked`,box).map(x=>x.value),jp=s=>Math.max(1,+$(`[data-ep-jp="${s}"]`,box)?.value||2);
  let d1=days(1),d2=days(2);if(mode==='otomatis'){if(!d1.length&&d2.length)d1=[...d2];if(!d2.length&&d1.length)d2=[...d1]}
  const s1=$('[data-ep-start="1"]',box)?.value||'2026-07-13',s2=$('[data-ep-start="2"]',box)?.value||(/fase[abcd]\.v1$/i.test(PRE)?'2027-01-06':'2027-01-04');
  return{mode,d1,d2,j1:jp(1),j2:jp(2),s1,s2};
}
function bindSaveButton(box){
  if(!box||$('#epSavePromesDates',box))return;
  const area=document.createElement('div');area.className='actions';area.style.marginTop='12px';area.innerHTML='<button type="button" class="btn primary" id="epSavePromesDates">Simpan &amp; Terapkan Tanggal</button><span id="epPromesSaveStatus" style="font-weight:700;color:#166534"></span>';box.appendChild(area);
  $('#epSavePromesDates',box).onclick=()=>{const next=boxConfig(box);if(!next.s1||!next.s2){alert('Isi tanggal mulai sekolah Semester I dan Semester II.');return}if(next.mode==='otomatis'&&!next.d1.length&&!next.d2.length){alert('Pilih minimal satu hari mengajar agar tanggal otomatis dapat dibuat.');return}if(next.mode==='jadwal'&&!sched().some(x=>DAYS[String(x.day||'').toUpperCase()]!==undefined&&+x.hours>0)){alert('Jadwal mengajar belum ditemukan. Simpan dahulu hari dan jumlah JP pada menu Jadwal Mengajar.');return}save({...next,confirmed:true});const saved=cfg();applyWeb(saved);carryConfig(saved);const status=$('#epPromesSaveStatus',box);if(status)status.textContent='✓ Tanggal mulai sekolah dan jadwal tersimpan, siap dicetak';};
}
function applyWeb(c){
  $$('.promes-detail').forEach(b=>{b.style.display=c.mode==='ringkas'?'none':'';if(c.mode!=='ringkas')patchDetail($('table.promes-detail-table',b),semText(b.textContent),c)});
  summaryTables().forEach(t=>c.mode==='ringkas'?restoreSummary(t):patchSummary(t,semText(t.closest('.promes-block')?.textContent||t.closest('.page')?.textContent),c));
  carryConfig(c);
}
function web(){
  const app=$('#app');
  if(!app)return;
  const activePromes=$('#mainNav [data-view="promes"].active');
  const promesHeading=$('.page-head h1',app);
  const isPromes=!!$('.promes-block',app)||!!activePromes||/Program\s+Semester/i.test(promesHeading?.textContent||'');
  if(!isPromes)return;
  let c=cfg(),box=$('#epPromesCfg');
  if(!box){
    const holder=$('#app > .card')||$('#app .card')||$('#app .promes-block')||app.firstElementChild;
    if(holder)holder.insertAdjacentHTML('beforebegin',card(c));else app.insertAdjacentHTML('afterbegin',card(c));
    box=$('#epPromesCfg');if(!box)return;
    $$('input[name="epmode"]',box).forEach(x=>x.onchange=()=>{save({mode:x.value});box.remove();web()});
    $$('[data-ep-day]',box).forEach(x=>x.onchange=()=>{const s=+x.dataset.epDay,ds=$$(`[data-ep-day="${s}"]:checked`,box).map(y=>y.value);save(s===1?{d1:ds}:{d2:ds});applyWeb(cfg())});
    $$('[data-ep-jp]',box).forEach(x=>x.onchange=()=>{const s=+x.dataset.epJp,v=Math.max(1,+x.value||2);save(s===1?{j1:v}:{j2:v});applyWeb(cfg())});
  }
  bindSaveButton(box);
  applyWeb(c);
}
function print(){
  if(!/print\.html/i.test(location.pathname))return;const c=cfg();
  summaryTables().forEach(t=>c.mode==='ringkas'?restoreSummary(t):patchSummary(t,semText(t.closest('.page')?.textContent),c));
  if(c.mode==='ringkas'){$$('.page').forEach(p=>{if($('table.promes-detail-print',p)||/PROGRAM SEMESTER RINCI/i.test(p.textContent||''))p.remove()})}
  else{const by={1:[],2:[]};$$('table.promes-detail-print').forEach(t=>by[semText(t.closest('.page')?.textContent)].push(t));[1,2].forEach(s=>{const rows=by[s].flatMap(t=>dataRows(t)),a=alloc(rows.map(r=>+r.cells[4].textContent||0),s,c);by[s].forEach(t=>{t.querySelector('.ep-date-head')?.remove();const h=$('thead tr',t);if(h){const x=document.createElement('th');x.className='ep-date-head';x.textContent='Tanggal Pelaksanaan';h.appendChild(x)}});rows.forEach((r,i)=>{r.querySelector('.ep-date-cell')?.remove();const x=document.createElement('td');x.className='ep-date-cell';x.textContent=fmt(a[i]);r.appendChild(x)})})}
  const st=$('#pageStatus');if(st)st.textContent=String(st.textContent).replace(/\d+\s+halaman/i,$$('.page').length+' halaman');
  document.body?.setAttribute('data-ep-promes-ready',c.mode);
}
function style(){if($('#epPromesStyle'))return;const s=document.createElement('style');s.id='epPromesStyle';s.textContent='#epPromesCfg .option{padding:10px;border:1px solid #dbe4ea;border-radius:10px;background:#fff}#epPromesCfg [data-ep-start]{display:block;width:100%;max-width:240px;padding:8px;border:1px solid #94a3b8;border-radius:7px;background:#fff}.ep-date-head,.ep-date-cell{min-width:115px;white-space:normal;line-height:1.3}.ep-date-mark{font-size:8px!important;font-weight:700;white-space:nowrap;padding-left:1px!important;padding-right:1px!important;letter-spacing:-.2px}@media(max-width:760px){#epPromesCfg>div[style*="repeat(3"],#epPromesCfg .ep-school-start{grid-template-columns:1fr!important}}';document.head.appendChild(s)}
function go(){if(!PRE)return;style();if(/print\.html/i.test(location.pathname)){print();if(!window.__epPromesPrintGuard){addEventListener('beforeprint',print);document.addEventListener('click',e=>{if(e.target.closest?.('.preview-bar button'))print()},true);window.__epPromesPrintGuard=true}}else web()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,80));else setTimeout(go,80);
let q=0;new MutationObserver(()=>{clearTimeout(q);q=setTimeout(go,140)}).observe(document.documentElement,{childList:true,subtree:true});
})();
