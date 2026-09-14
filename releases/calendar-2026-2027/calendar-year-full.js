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
    ['2027-02-08','2027-02-12','semester','Libur Awal Bulan Ramadan (estimasi)'],
    ['2027-03-01','2027-03-19','semester','Libur Ramadan dan Hari Raya Idulfitri (estimasi)'],
    ['2027-03-09','2027-03-09','national','Hari Suci Nyepi Tahun Baru Saka 1949 (estimasi)'],
    ['2027-03-10','2027-03-11','national','Hari Raya Idulfitri 1448 H (estimasi)'],
    ['2027-03-26','2027-03-26','national','Wafat Yesus Kristus (estimasi)'],
    ['2027-03-28','2027-03-28','national','Kebangkitan Yesus Kristus (estimasi)'],
    ['2027-04-12','2027-04-16','assessment','Prediksi Tes Kemampuan Akademik'],
    ['2027-05-01','2027-05-01','national','Hari Buruh Internasional'],
    ['2027-05-02','2027-05-02','unit','Hari Pendidikan Nasional'],
    ['2027-05-06','2027-05-06','national','Kenaikan Yesus Kristus (estimasi)'],
    ['2027-05-10','2027-05-14','assessment','Asesmen Akhir Jenjang'],
    ['2027-05-17','2027-05-17','national','Hari Raya Iduladha 1448 H (estimasi)'],
    ['2027-05-20','2027-05-20','national','Hari Raya Waisak (estimasi)'],
    ['2027-06-01','2027-06-01','national','Hari Lahir Pancasila'],
    ['2027-06-06','2027-06-06','national','Tahun Baru Islam 1449 H (estimasi)'],
    ['2027-06-07','2027-06-11','assessment','Asesmen Sumatif Akhir Semester Genap'],
    ['2027-06-14','2027-06-18','unit','Pengolahan Nilai Rapor'],
    ['2027-06-21','2027-06-21','report','Penyerahan Rapor'],
    ['2027-06-22','2027-06-30','semester','Libur Semester Genap']
  ].map((row, index) => ({id:'jenjang-'+(index+1),start:row[0],end:row[1],type:row[2],title:row[3]}));

return {year:'2026/2027',events};
}
function preset(year,phase){
  if(year==='2026/2027')return {...preset2026(phase),epCalendarYear:year};
  const rows=[
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
    ['2025-12-22','2026-01-03','semester','Libur semester ganjil'],
    ['2025-12-25','2025-12-25','national','Natal'],
    ['2025-12-26','2025-12-26','national','Cuti bersama Natal'],
    ['2026-01-01','2026-01-01','national','Tahun Baru Masehi'],
    ['2026-01-05','2026-01-05','unit','Awal semester genap'],
    ['2026-01-16','2026-01-16','national','Isra Mikraj'],
    ['2026-02-16','2026-02-21','unit','Belajar mandiri di rumah pada awal Ramadan'],
    ['2026-02-16','2026-02-16','national','Cuti bersama Imlek'],
    ['2026-02-17','2026-02-17','national','Tahun Baru Imlek'],
    ['2026-03-16','2026-03-25','semester','Libur sekitar Idulfitri'],
    ['2026-03-18','2026-03-18','national','Cuti bersama Nyepi'],
    ['2026-03-19','2026-03-19','national','Nyepi'],
    ['2026-03-20','2026-03-20','national','Cuti bersama Idulfitri'],
    ['2026-03-21','2026-03-22','national','Idulfitri 1447 H'],
    ['2026-03-23','2026-03-24','national','Cuti bersama Idulfitri'],
    ['2026-03-26','2026-03-26','unit','Masuk setelah libur Idulfitri'],
    ['2026-04-03','2026-04-03','national','Wafat Yesus Kristus'],
    ['2026-04-05','2026-04-05','national','Paskah'],
    ['2026-05-01','2026-05-01','national','Hari Buruh'],
    ['2026-05-02','2026-05-02','unit','Hari Pendidikan Nasional'],
    ['2026-05-14','2026-05-14','national','Kenaikan Yesus Kristus'],
    ['2026-05-15','2026-05-15','national','Cuti bersama Kenaikan Yesus Kristus'],
    ['2026-05-27','2026-05-27','national','Iduladha'],
    ['2026-05-28','2026-05-28','national','Cuti bersama Iduladha'],
    ['2026-05-31','2026-05-31','national','Waisak'],
    ['2026-06-01','2026-06-01','national','Hari Lahir Pancasila'],
    ['2026-06-08','2026-06-13','assessment','Asesmen akhir semester genap'],
    ['2026-06-15','2026-06-19','unit','Pengolahan nilai rapor'],
    ['2026-06-16','2026-06-16','national','Tahun Baru Islam'],
    ['2026-06-20','2026-06-20','report','Pembagian rapor genap'],
    ['2026-06-22','2026-06-30','semester','Libur akhir tahun pelajaran']
  ];
  return {year,epCalendarYear:year,schoolDays:6,reference:'buol-2025-2026',events:rows.map((r,i)=>({id:'y25-'+i,start:r[0],end:r[1],type:r[2],title:r[3]}))};
}
function switchYear(order,year,phase){
  if(!YEARS.includes(year))throw new Error('Tahun kalender tidak didukung');
  const current=order.calendar||{},old=current.epCalendarYear||current.year||order.profile?.year;
  if(old===year){order.calendar={...current,year,epCalendarYear:year};}
  else{
    order.calendarYears=order.calendarYears||{};
    if(YEARS.includes(old))order.calendarYears[old]=clone(current);
    order.calendar=clone(order.calendarYears[year]||preset(year,phase));
    order.calendar.year=year;order.calendar.epCalendarYear=year;
  }
  order.profile={...order.profile,year};
  return order;
}
const names=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function months(year,semester){const start=Number(year.slice(0,4));return Array.from({length:6},(_,i)=>[semester===1?start:start+1,semester===1?i+6:i]);}
function stats(cal,y,m){
  let hes=0,heb=0;const school=new Set(),learning=new Set(),first=new Date(Date.UTC(y,m,1)).getUTCDay();
  for(let d=1;d<=new Date(Date.UTC(y,m+1,0)).getUTCDate();d++){
    const date=new Date(Date.UTC(y,m,d)),dow=date.getUTCDay(),iso=date.toISOString().slice(0,10);
    if(dow===0||(cal.schoolDays!==6&&dow===6))continue;
    const hits=(cal.events||[]).filter(e=>iso>=e.start&&iso<=e.end),week=Math.floor((d+first-1)/7);
    if(!hits.some(e=>['national','semester'].includes(e.type))){hes++;school.add(week);}
    if(!hits.some(e=>['national','semester','assessment','report'].includes(e.type)||/pengolahan nilai|HUT PGRI|Tes Kemampuan Akademik/i.test(e.title))){heb++;learning.add(week);}
  }
  return [school.size,learning.size,hes,heb];
}
function grid(cal,y,m,print){
  const first=new Date(Date.UTC(y,m,1)).getUTCDay(),days=new Date(Date.UTC(y,m+1,0)).getUTCDate(),cells=Array(first).fill('');
  for(let d=1;d<=days;d++)cells.push(d);while(cells.length%7)cells.push('');
  const rank={national:5,semester:4,assessment:3,report:2,unit:1,learning:0};
  return '<table class="'+(print?'print-mini-cal':'mini-cal')+'"><thead><tr>'+['M','S','S','R','K','J','S'].map(n=>'<th>'+n+'</th>').join('')+'</tr></thead><tbody>'+Array.from({length:cells.length/7},(_,r)=>'<tr>'+cells.slice(r*7,r*7+7).map((d,c)=>{
    if(!d)return '<td></td>';const iso=new Date(Date.UTC(y,m,d)).toISOString().slice(0,10),hit=(cal.events||[]).filter(e=>iso>=e.start&&iso<=e.end).sort((a,b)=>(rank[b.type]||0)-(rank[a.type]||0))[0];
    return '<td class="'+(c===0?(print?'sun ':'sunday '):'')+(hit?(print?'evt-':'ev-')+esc(hit.type):'')+'" title="'+esc(hit?.title||'')+'">'+d+'</td>';
  }).join('')+'</tr>').join('')+'</tbody></table>';
}
function tableBody(cal,semester,print){
  const totals=[0,0,0,0],rows=months(cal.year,semester).map(([y,m])=>{
    const key=y+'-'+String(m+1).padStart(2,'0'),end=key+'-'+new Date(Date.UTC(y,m+1,0)).getUTCDate(),ev=(cal.events||[]).filter(e=>e.end>=key+'-01'&&e.start<=end),s=stats(cal,y,m);s.forEach((v,i)=>totals[i]+=v);
    return '<tr><td class="'+(print?'pcm':'month-cell')+'"><b>'+names[m]+' '+y+'</b>'+grid(cal,y,m,print)+'</td>'+s.map((v,i)=>'<td class="'+(print?'pcs':'cal-stat')+'"><'+(print?'strong':'b')+'>'+v+'</'+(print?'strong':'b')+'><small>'+['MES','MEB','HES','HEB'][i]+'</small></td>').join('')+'<td class="'+(print?'pce':'event-cell')+'">'+ev.map(e=>'<div class="'+(print?'p-event':'event-row')+' '+esc(e.type)+'"><b>'+esc(e.start.slice(8)+(e.end!==e.start?'–'+e.end.slice(8):''))+'</b><span>'+esc(e.title)+'</span></div>').join('')+'</td></tr>';
  });
  return rows.join('')+'<tr class="'+(print?'print-cal-total':'calendar-total')+'"><td>JUMLAH SEMESTER '+(semester===1?'I':'II')+'</td>'+totals.map(n=>'<td>'+n+'</td>').join('')+'<td></td></tr>';
}
const api={preset,switchYear,months,stats,tableBody};
if(typeof module==='object'&&module.exports){module.exports=api;return;}
root.EPCalendarYear?.dispose?.();
const match=location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);if(!match)return;
const phase=match[2].toLowerCase(),prefix='eperangkat.'+decodeURIComponent(match[1]).toLowerCase()+'.fase'+phase+'.v1',key=prefix+'.orders';
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(_){return {}}};
function current(edit=false){const s=read(),id=edit?document.querySelector('[data-select-order].active')?.dataset.selectOrder:new URLSearchParams(location.search).get('order');return (s.orders||[]).find(o=>o.id===(id||s.activeId))||(s.orders||[])[0];}
api.current=current;root.EPCalendarYear=api;
let pending=null;
const proto=Storage.prototype;
if(!proto.__epCalendarYearBridge){
 const nativeSet=proto.setItem;proto.__epCalendarYearBridge={transform:(_storage,_key,value)=>value};
 proto.setItem=function(k,v){return nativeSet.call(this,k,proto.__epCalendarYearBridge.transform(this,k,v));};
}
proto.__epCalendarYearBridge.transform=function(storage,k,v){
  if(storage===localStorage&&String(k)===key){
    try{
      const data=JSON.parse(v);let changed=false;
      for(const o of data.orders||[]){
        if(pending&&o.id===pending.id&&o.profile?.year===pending.year){switchYear(o,pending.year,phase);changed=true;}
        // Persist the chosen calendar year when older renderers save a profile.
        else if(o.calendar?.epCalendarYear&&o.profile?.year!==o.calendar.year){o.profile={...o.profile,year:o.calendar.year};changed=true;}
      }
      if(changed)v=JSON.stringify(data);
    }catch(e){if(e.name==='QuotaExceededError')throw e;}
  }
  return v;
};
function picker(){
  const field=document.getElementById('profileYear');if(!field)return;
  const o=current(true);if(!o)return;
  const year=o.calendar?.epCalendarYear||o.calendar?.year||o.profile?.year||'2026/2027';
  const existing=document.getElementById('epCalendarYear');
  if(existing){if(existing.dataset.savedYear!==year){existing.value=year;existing.dataset.savedYear=year;field.value=year;}return;}
  const label=document.createElement('label');label.innerHTML='Kalender Pendidikan<select id="epCalendarYear">'+YEARS.map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select><small>Tahun pelajaran mengikuti kalender. Klik Simpan Pesanan &amp; Profil.</small>';
  field.closest('label').before(label);const select=label.querySelector('select');select.value=YEARS.includes(year)?year:'2026/2027';
  select.dataset.savedYear=year;select.setAttribute('aria-label','Kalender Pendidikan');
  field.value=select.value;field.readOnly=true;field.setAttribute('aria-readonly','true');
  const hint=document.createElement('small');hint.textContent='Kalender 2025/2026 memakai acuan SD/SMP Buol. Untuk fase E/F atau daerah lain, sesuaikan jadwal sekolah di menu Kalender Pendidikan.';label.appendChild(hint);
  select.addEventListener('change',()=>{field.value=select.value;field.dispatchEvent(new Event('input',{bubbles:true}));});
}
function captureSave(e){
  if(e.target.closest?.('#saveOrderBtn')){const select=document.getElementById('epCalendarYear'),o=current(true);if(select&&o){pending={id:o.id,year:select.value};document.getElementById('profileYear').value=select.value;setTimeout(()=>{pending=null;},0);}}
}
document.addEventListener('click',captureSave,true);
function editorRow(e){return '<div class="calendar-event-edit" data-event-id="'+esc(e.id)+'"><input type="date" data-field="start" value="'+esc(e.start)+'"><input type="date" data-field="end" value="'+esc(e.end)+'"><select data-field="type">'+['national','semester','unit','assessment','report','learning'].map((t,i)=>'<option value="'+t+'" '+(t===e.type?'selected':'')+'>'+['Libur nasional','Libur semester','Kegiatan satuan','Asesmen','Rapor','Pembelajaran'][i]+'</option>').join('')+'</select><input data-field="title" value="'+esc(e.title)+'"><button class="btn danger small" data-delete-event="'+esc(e.id)+'">Hapus</button></div>';}
function semesterOf(sheet){return /II|GENAP/i.test(sheet.querySelector('.calendar-title-row strong,.print-cal-title strong')?.textContent||'')?2:1;}
function render(){
  picker();const o=current();if(o?.calendar?.year!=='2025/2026')return;
  const cal=o.calendar;
  const note=document.querySelector('.calendar-sheet-web')&&document.querySelector('#app .page-head p');
  if(note){const text='Kalender '+cal.year+'. Jumlah hari efektif dihitung dari kegiatan pesanan ini. Jadwal sekolah dapat disesuaikan melalui editor kalender.';if(note.textContent!==text)note.textContent=text;}
  document.querySelectorAll('.calendar-sheet-web,.calendar-print-page').forEach(sheet=>{
    const print=sheet.classList.contains('calendar-print-page'),sem=semesterOf(sheet),table=sheet.querySelector(print?'.print-calendar':'.calendar-main');if(!table)return;
    const signature=JSON.stringify([cal,sem]);
    if(table.dataset.epYear!==signature){const tbody=table.querySelector(':scope > tbody');if(tbody)tbody.innerHTML=tableBody(cal,sem,print);table.dataset.epYear=signature;}
    const title=sheet.querySelector('.calendar-title-row > b,.print-cal-title > b');const text='KALENDER PENDIDIKAN TAHUN AJARAN '+cal.year;if(title&&title.textContent!==text)title.textContent=text;
  });
  if(cal.year!=='2025/2026')return;
  const sheet=document.querySelector('.calendar-sheet-web'),list=document.querySelector('.calendar-event-list');
  if(sheet&&list){const sem=semesterOf(sheet),sig=JSON.stringify([cal,sem]);if(list.dataset.epYear!==sig){const [y,m]=months(cal.year,sem)[0],start=y+'-'+(m===6?'07':'01')+'-01',end=y+'-'+(m===6?'12-31':'06-30');list.innerHTML=cal.events.filter(e=>e.end>=start&&e.start<=end).map(editorRow).join('');list.dataset.epYear=sig;}}
}
function saveCalendarAction(action,change){
  const s=read(),o=(s.orders||[]).find(x=>x.id===s.activeId);if(!o)return;
  const before=clone(o);delete before.history;
  change(o);
  const now=new Date().toISOString();o.updatedAt=now;o.history=Array.isArray(o.history)?o.history:[];o.history.unshift({id:'h-year-'+Date.now(),time:now,action,detail:'Kalender '+o.calendar.year,snapshot:before});
  localStorage.setItem(key,JSON.stringify(s));render();
}
function captureCalendar(e){
  const o=current();if(o?.calendar?.year!=='2025/2026')return;
  const b=e.target.closest?.('#saveCalendarBtn,#addCalendarEvent,#resetCalendarBtn,[data-delete-event]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(b.id==='resetCalendarBtn'){if(confirm('Reset kalender 2025/2026 untuk pesanan aktif?'))saveCalendarAction('Kalender direset',o=>{o.calendar=preset('2025/2026',phase);});}
  else if(b.id==='addCalendarEvent'){saveCalendarAction('Kegiatan kalender ditambahkan',o=>{const sem=semesterOf(document.querySelector('.calendar-sheet-web')),start=sem===1?'2025-07-01':'2026-01-01';o.calendar.events.push({id:'e-'+Date.now(),start,end:start,type:'unit',title:'Kegiatan baru'});});}
  else if(b.dataset.deleteEvent){saveCalendarAction('Kegiatan kalender dihapus',o=>{o.calendar.events=o.calendar.events.filter(x=>x.id!==b.dataset.deleteEvent);});}
  else{
    const edits=[...document.querySelectorAll('.calendar-event-edit')].map(row=>{const value={id:row.dataset.eventId};row.querySelectorAll('[data-field]').forEach(i=>value[i.dataset.field]=i.value);return value;});
    if(edits.some(x=>!x.start||!x.end||x.start>x.end)){alert('Tanggal kegiatan tidak valid. Tanggal akhir harus sama atau setelah tanggal mulai.');return;}
    saveCalendarAction('Kalender pendidikan diperbarui',o=>{const map=new Map(edits.map(x=>[x.id,x]));o.calendar.events=o.calendar.events.map(x=>map.has(x.id)?{...x,...map.get(x.id)}:x);});
  }
}
document.addEventListener('click',captureCalendar,true);
let timer=0;const observer=new MutationObserver(()=>{if(!timer)timer=setTimeout(()=>{timer=0;render();},50);});observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
root.addEventListener('beforeprint',render);
api.dispose=()=>{observer.disconnect();clearTimeout(timer);document.removeEventListener('click',captureSave,true);document.removeEventListener('click',captureCalendar,true);document.removeEventListener('DOMContentLoaded',render);root.removeEventListener('beforeprint',render);};
})(typeof window==='object'?window:globalThis);
