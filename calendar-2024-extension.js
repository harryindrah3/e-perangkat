(() => {
'use strict';
const Y='2024/2025', YEARS=[Y,'2025/2026','2026/2027'];
const m=location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i); if(!m)return;
const subject=decodeURIComponent(m[1]||'').toLowerCase(), phase=String(m[2]||'').toLowerCase();
const KEY=`eperangkat.${subject}.fase${phase}.v1.orders`, base=window.EPCalendarYear; if(!base?.preset)return;
const cp=x=>JSON.parse(JSON.stringify(x)), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COMMON=[
['2024-07-07','2024-07-07','national','Tahun Baru Islam 1446 H'],
['2024-07-08','2024-07-08','unit','Permulaan Tahun Pelajaran 2024/2025'],
['2024-08-17','2024-08-17','national','HUT Kemerdekaan Republik Indonesia ke-79'],
['2024-09-16','2024-09-16','national','Maulid Nabi Muhammad SAW'],
['2024-10-12','2024-10-12','semester','HUT Kabupaten Buol ke-25 (fakultatif)'],
['2024-11-25','2024-11-25','unit','Hari Guru Nasional dan HUT PGRI (fakultatif)'],
['2024-11-27','2024-11-27','national','Pilkada Serentak 2024'],
['2024-12-23','2025-01-04','semester','Libur Semester Ganjil'],
['2024-12-25','2024-12-25','national','Hari Raya Natal'],
['2024-12-26','2024-12-26','national','Cuti Bersama Hari Raya Natal'],
['2025-01-01','2025-01-01','national','Tahun Baru 2025 Masehi'],
['2025-01-06','2025-01-06','unit','Hari pertama masuk Semester Genap'],
['2025-01-27','2025-01-27','national','Isra Mikraj Nabi Muhammad SAW'],
['2025-01-28','2025-01-28','national','Cuti Bersama Tahun Baru Imlek 2576 Kongzili'],
['2025-01-29','2025-01-29','national','Tahun Baru Imlek 2576 Kongzili'],
['2025-02-27','2025-02-28','learning','Pembelajaran mandiri di lingkungan keluarga/tempat ibadah/masyarakat pada awal Ramadan'],
['2025-03-03','2025-03-05','learning','Pembelajaran mandiri di lingkungan keluarga/tempat ibadah/masyarakat pada awal Ramadan'],
['2025-03-06','2025-03-20','learning','Pembelajaran di satuan pendidikan selama Ramadan 1446 H'],
['2025-03-21','2025-03-28','semester','Libur Idulfitri satuan pendidikan (revisi SEB Ramadan 1446 H)'],
['2025-03-28','2025-03-28','national','Cuti Bersama Hari Suci Nyepi'],
['2025-03-29','2025-03-29','national','Hari Suci Nyepi Tahun Baru Saka 1947'],
['2025-03-31','2025-04-01','national','Hari Raya Idulfitri 1446 H'],
['2025-04-02','2025-04-04','national','Cuti Bersama Hari Raya Idulfitri 1446 H'],
['2025-04-07','2025-04-07','national','Cuti Bersama Hari Raya Idulfitri 1446 H'],
['2025-04-08','2025-04-08','semester','Libur Idulfitri satuan pendidikan'],
['2025-04-09','2025-04-09','unit','Kembali belajar setelah libur Idulfitri'],
['2025-04-18','2025-04-18','national','Wafat Yesus Kristus'],
['2025-04-20','2025-04-20','national','Kebangkitan Yesus Kristus (Paskah)'],
['2025-05-01','2025-05-01','national','Hari Buruh Internasional'],
['2025-05-02','2025-05-02','unit','Hari Pendidikan Nasional'],
['2025-05-12','2025-05-12','national','Hari Raya Waisak 2569 BE'],
['2025-05-13','2025-05-13','national','Cuti Bersama Hari Raya Waisak 2569 BE'],
['2025-05-29','2025-05-29','national','Kenaikan Yesus Kristus'],
['2025-05-30','2025-05-30','national','Cuti Bersama Kenaikan Yesus Kristus'],
['2025-06-01','2025-06-01','national','Hari Lahir Pancasila'],
['2025-06-06','2025-06-06','national','Hari Raya Iduladha 1446 H'],
['2025-06-09','2025-06-09','national','Cuti Bersama Hari Raya Iduladha 1446 H'],
['2025-06-27','2025-06-27','national','1 Muharam Tahun Baru Islam 1447 H']];
function rows(){
 const r=COMMON.map(x=>x.slice());
 if(/[ef]/.test(phase)) r.push(
  ['2024-07-08','2024-07-10','unit','Kegiatan hari-hari pertama masuk sekolah / MPLS'],
  ['2024-08-19','2024-08-22','assessment','Asesmen Nasional SMA/SLB'],
  ['2024-11-25','2024-12-07','assessment','Ujian Semester Ganjil SMA/SLB'],
  ['2024-12-20','2024-12-21','report','Penyerahan laporan hasil belajar Semester Ganjil (menyesuaikan 5/6 hari kerja)'],
  ['2025-04-07','2025-04-12','assessment','Ujian Sekolah SMA/SLB'],
  ['2025-05-26','2025-06-06','assessment','Ujian Semester Genap SMA/SLB'],
  ['2025-06-17','2025-06-17','report','Penyerahan laporan hasil belajar Semester Genap dan akhir Tahun Pelajaran 2024/2025'],
  ['2025-06-18','2025-06-30','semester','Libur akhir Tahun Pelajaran 2024/2025']);
 else {
  r.push(['2024-07-09',/[abc]/.test(phase)?'2024-07-20':'2024-07-11','unit',/[abc]/.test(phase)?'MPLS SD dan transisi PAUD ke SD':'MPLS SMP']);
  r.push(['2024-07-15','2024-07-15','learning','Awal hari efektif belajar Semester Ganjil']);
  if(phase==='d') r.push(['2024-09-09','2024-09-12','assessment','ANBK SMP']);
  else r.push(['2024-10-28','2024-10-31','assessment','ANBK SD Tahap I'],['2024-11-04','2024-11-07','assessment','ANBK SD Tahap II']);
  r.push(['2024-12-09','2024-12-14','assessment','Sumatif Akhir Semester Ganjil SD/SMP'],['2024-12-16','2024-12-20','unit','Pengolahan nilai rapor Semester Ganjil'],['2024-12-21','2024-12-21','report','Penyerahan rapor Semester Ganjil']);
  if(phase==='c'||phase==='d')r.push(['2025-05-05','2025-05-10','assessment',phase==='c'?'Sumatif Akhir Fase C':'Sumatif Akhir Fase D']);
  r.push(['2025-06-10','2025-06-14','assessment','Sumatif Akhir Semester Genap SD/SMP'],['2025-06-16','2025-06-20','unit','Pengolahan nilai rapor Semester Genap'],['2025-06-21','2025-06-21','report','Penyerahan rapor Semester Genap'],['2025-06-23','2025-06-30','semester','Libur akhir Tahun Pelajaran 2024/2025']);
 }
 return r.sort((a,b)=>a[0].localeCompare(b[0])||a[1].localeCompare(b[1]));
}
function preset(){return{year:Y,epCalendarYear:Y,schoolDays:6,reference:/[ef]/.test(phase)?'sulteng-sma-2024-2025':'buol-2024-2025',events:rows().map((r,i)=>({id:'y24-'+i,start:r[0],end:r[1],type:r[2],title:r[3]}))}}
function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');s.orders=Array.isArray(s.orders)?s.orders:[];return s}catch(_){return{activeId:'',orders:[]}}}
function active(s=read(),edit=false){const sel=edit?document.querySelector('[data-select-order].active')?.dataset.selectOrder:null,id=new URLSearchParams(location.search).get('order'),num=document.getElementById('ordNumber')?.value?.trim();return s.orders.find(o=>sel&&o.id===sel)||s.orders.find(o=>id&&o.id===id)||(num&&s.orders.find(o=>String(o.number||'').trim()===num))||s.orders.find(o=>o.id===s.activeId)||s.orders[0]||null}
function year(o){const y=o?.calendar?.epCalendarYear||o?.calendar?.year||o?.profile?.year;return YEARS.includes(y)?y:'2026/2027'}
function switchYear(o,y){if(!YEARS.includes(y))return;o.calendarYears=o.calendarYears&&typeof o.calendarYears==='object'?o.calendarYears:{};const old=year(o);if(o.calendar)o.calendarYears[old]=cp(o.calendar);o.calendar=cp(o.calendarYears[y]||(y===Y?preset():base.preset(y,phase)));o.calendar.year=y;o.calendar.epCalendarYear=y;o.calendarYears[y]=cp(o.calendar);o.profile={...(o.profile||{}),year:y};if(y===Y)o.calendarSource='buol'}
function sem(sheet){return /II|GENAP/i.test(sheet.querySelector('.calendar-title-row strong,.print-cal-title strong')?.textContent||'')?2:1}
function row(e){return `<div class="calendar-event-edit" data-event-id="${esc(e.id)}"><input type="date" data-field="start" value="${esc(e.start)}"><input type="date" data-field="end" value="${esc(e.end)}"><select data-field="type">${['national','semester','unit','assessment','report','learning'].map((t,i)=>`<option value="${t}" ${t===e.type?'selected':''}>${['Libur nasional','Libur semester','Kegiatan satuan','Asesmen','Rapor','Pembelajaran'][i]}</option>`).join('')}</select><input data-field="title" value="${esc(e.title)}"><button class="btn danger small" data-delete-event="${esc(e.id)}">Hapus</button></div>`}
let on=false,timer=0;
function api(){return{...base,preset:(y)=>y===Y?preset():cp(base.preset(y,phase)),switchYear:(o,y)=>{switchYear(o,y);return o},current:()=>active(),dispose(){}}}
function option(){const s=document.getElementById('epCalendarYear');if(!s)return;if(!s.querySelector(`option[value="${Y}"]`)){const o=new Option(Y,Y);s.insertBefore(o,s.firstChild)}const o=active(read(),true)||active();if(year(o)===Y){if(!on)activate();s.value=Y;s.dataset.savedYear=Y;const f=document.getElementById('profileYear');if(f)f.value=Y}}
function note(sheet,print){const h=print?(sheet.querySelector('.page-inner')||sheet):sheet;let b=h.querySelector(':scope > .ep-calendar-source-box');if(!b){b=document.createElement('div');b.className='ep-calendar-source-box';b.style.cssText='margin:7px 0 9px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:11px;line-height:1.45;color:#475569';const t=h.querySelector('.calendar-title-row,.print-cal-title');t?t.insertAdjacentElement('afterend',b):h.prepend(b)}b.innerHTML='<b>Sumber Kalender Pendidikan 2024/2025:</b> '+(/[ef]/.test(phase)?'Dinas Pendidikan Provinsi Sulawesi Tengah (SMA/SLB), SKB libur nasional/cuti bersama, dan revisi SEB Ramadan 1446 H.':'Dinas Pendidikan dan Kebudayaan Kabupaten Buol (SD/SMP), SKB libur nasional/cuti bersama, dan revisi SEB Ramadan 1446 H.')}
function render(){option();const o=active();if(year(o)!==Y||o?.calendar?.year!==Y)return;const c=o.calendar;const src=document.getElementById('epCalendarSource');if(src){src.value='buol';const z=src.querySelector('option[value="tolitoli"]');if(z)z.disabled=true;const h=document.getElementById('epCalendarSourceHint');if(h)h.textContent='Tahun 2024/2025 memakai sumber Buol/Sulawesi Tengah yang diverifikasi; sumber Tolitoli hanya untuk tahun lain.'}
 document.querySelectorAll('.calendar-sheet-web,.calendar-print-page').forEach(s=>{const p=s.classList.contains('calendar-print-page'),n=sem(s),tb=s.querySelector(p?'.print-calendar':'.calendar-main');if(!tb)return;const sig=JSON.stringify([c,n,phase]);if(tb.dataset.epYear!==sig){const body=tb.querySelector(':scope > tbody');if(body)body.innerHTML=base.tableBody(c,n,p);tb.dataset.epYear=sig}const title=s.querySelector('.calendar-title-row > b,.print-cal-title > b');if(title)title.textContent='KALENDER PENDIDIKAN TAHUN AJARAN '+Y;note(s,p)});
 const s=document.querySelector('.calendar-sheet-web'),list=document.querySelector('.calendar-event-list');if(s&&list){const n=sem(s),ms=base.months(Y,n),a=ms[0],b=ms[5],start=`${a[0]}-${String(a[1]+1).padStart(2,'0')}-01`,end=`${b[0]}-${String(b[1]+1).padStart(2,'0')}-${new Date(Date.UTC(b[0],b[1]+1,0)).getUTCDate()}`,sig=JSON.stringify([c,n]);if(list.dataset.epYear!==sig){list.innerHTML=c.events.filter(e=>e.end>=start&&e.start<=end).map(row).join('');list.dataset.epYear=sig}}}
function save(action,fn){const s=read(),o=active(s,true)||active(s);if(year(o)!==Y)return;const before=cp(o);delete before.history;fn(o);o.updatedAt=new Date().toISOString();o.history=Array.isArray(o.history)?o.history:[];o.history.unshift({id:'h-y24-'+Date.now(),time:o.updatedAt,action,detail:'Kalender '+Y,snapshot:before});localStorage.setItem(KEY,JSON.stringify(s));queue(0)}
function calClick(e){if(!on||year(active())!==Y)return;const b=e.target.closest?.('#saveCalendarBtn,#addCalendarEvent,#resetCalendarBtn,[data-delete-event]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.id==='resetCalendarBtn'){if(confirm('Reset Kalender Pendidikan 2024/2025 untuk pesanan aktif?'))save('Kalender 2024/2025 direset',o=>{o.calendar=preset();o.calendarYears={...(o.calendarYears||{}),[Y]:cp(o.calendar)}});return}if(b.id==='addCalendarEvent'){save('Kegiatan kalender ditambahkan',o=>{const st=sem(document.querySelector('.calendar-sheet-web'))===1?'2024-07-01':'2025-01-01';o.calendar.events.push({id:'y24-custom-'+Date.now(),start:st,end:st,type:'unit',title:'Kegiatan baru'})});return}if(b.dataset.deleteEvent){save('Kegiatan kalender dihapus',o=>o.calendar.events=o.calendar.events.filter(x=>x.id!==b.dataset.deleteEvent));return}const edits=[...document.querySelectorAll('.calendar-event-edit')].map(r=>{const v={id:r.dataset.eventId};r.querySelectorAll('[data-field]').forEach(i=>v[i.dataset.field]=i.value);return v});if(edits.some(x=>!x.start||!x.end||x.start>x.end)){alert('Tanggal kegiatan tidak valid.');return}save('Kalender Pendidikan 2024/2025 diperbarui',o=>{const map=new Map(edits.map(x=>[x.id,x]));o.calendar.events=o.calendar.events.map(x=>map.has(x.id)?{...x,...map.get(x.id)}:x);o.calendarYears[Y]=cp(o.calendar)})}
function orderSave(e){if(!on||!e.target.closest?.('#saveOrderBtn'))return;const sel=document.getElementById('epCalendarYear');if(!sel||!YEARS.includes(sel.value))return;const s=read(),o=active(s,true)||active(s);if(!o)return;const before=year(o),next=sel.value;switchYear(o,next);if(before!==next){o.history=Array.isArray(o.history)?o.history:[];o.history.unshift({id:'h-year-'+Date.now(),time:new Date().toISOString(),action:'Kalender pendidikan diperbarui',detail:`Kalender Pendidikan: “${before}” → “${next}”. Tahun Pelajaran mengikuti kalender.`,snapshot:null})}localStorage.setItem(KEY,JSON.stringify(s));const f=document.getElementById('profileYear');if(f)f.value=next;setTimeout(()=>location.reload(),250)}
function activate(){if(on)return;on=true;try{base.dispose?.()}catch(_){}window.EPCalendarYear=api();document.addEventListener('click',orderSave,true);document.addEventListener('click',calClick,true);queue(0)}
function queue(d=30){clearTimeout(timer);timer=setTimeout(render,d)}
document.addEventListener('change',e=>{if(e.target?.id==='epCalendarYear'&&e.target.value===Y)activate()},true);
new MutationObserver(()=>{option();if(on)queue(40)}).observe(document.documentElement,{childList:true,subtree:true});
function init(){option();if(year(active())===Y)activate()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
window.addEventListener('load',()=>{init();if(on){queue(0);setTimeout(()=>queue(0),400);setTimeout(()=>queue(0),1200)}},{once:true});
})();
