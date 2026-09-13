'use strict';
const $=id=>document.getElementById(id);
const CHANNEL='genarator-e-perangkat-v1';
let apps=[],records=[],connected=false,busy=false,cancelled=false;
const pending=new Map();
const checkedOrders=new Set();let visibleOrders=[],queue=[],activeLabel="";
const batchMode=()=>document.querySelector('[name=mode]:checked').value==='batch';
const chosenOrders=()=>batchMode()?records.filter(r=>checkedOrders.has(GeneratorBatch.key(r))):[selected()].filter(Boolean);
const appFor=r=>apps.find(a=>a.id===r.appId);
const labelFor=r=>`${appFor(r)?.subject||r.appId} · Kelas ${r.grade} · ${r.teacher||r.customer||r.number} · ${r.school||"Sekolah belum diisi"} · ${r.year||""} · ${r.number||r.orderId}`;
function request(action,payload={},timeout=12000) {
  const id=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(Error(action==='hello'?'Ekstensi belum terhubung.':'Tidak ada respons dari ekstensi. Periksa Chrome dan ulangi.'))},timeout);
    pending.set(id,{resolve,reject,timer});
    window.postMessage({channel:CHANNEL,direction:'request',id,action,payload},location.origin);
  });
}
window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.channel!==CHANNEL)return;
  const m=event.data;
  if(m.direction==='progress'&&pending.has(m.id)){$('progress').textContent=activeLabel+' — '+m.message;return}
  if(m.direction!=='response')return;
  const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);
  if(m.error)p.reject(Error(m.error));else if(m.result===undefined)p.reject(Error('Ekstensi berhenti tanpa hasil. Muat ulang ekstensi dan generator.'));else p.resolve(m.result);
});
function notice(text,success=false){$('notice').textContent=text;$('notice').classList.toggle('success',success);$('notice').hidden=!text}
function refreshButtons(){
 const count=chosenOrders().length,sem=document.querySelector('[name=semester]:checked').value;
 const total=count*(sem==='both'?2:1);
 $('generate').disabled=!connected||busy||!count;$('refresh').disabled=!connected||busy;$('connect').disabled=busy;
 for(const id of ['phase','subject','order','search','grade','school','selectVisible','clearSelection'])$(id).disabled=busy;
 document.querySelectorAll('[name=mode],[name=semester],#batchOrders input,#selectionList button').forEach(e=>e.disabled=busy);
 $('generate').textContent=total?`Unduh ${total} PDF ↓`:'Unduh PDF ↓';
 $('downloadSummary').textContent=count?`${count} pesanan dipilih · ${total} PDF · diunduh berurutan, file terpisah.`:'Pilih pesanan untuk mengunduh PDF.';
 $('resumeQueue').hidden=busy||!queue.some(j=>j.status!=='done');$('resumeQueue').disabled=!connected||busy;
}
async function connect() {
  $('connection').textContent='Memeriksa koneksi…';$('connect').disabled=true;
  try {
    const result=await request('hello',{},1800);connected=result.version.split('.').map(Number).reduce((v,n)=>v*1000+n,0)>=1000003;
    $('update').hidden=connected;
    $('connection').textContent='Terhubung · v'+result.version;$('connectionHint').textContent=connected?'Siap membaca pesanan dari Chrome ini.':'Pembaruan 1.0.3 diperlukan; ikuti petunjuk di bawah.';
    $('connection').parentElement.classList.toggle('connected',connected);$('setup').hidden=true;notice('');
  } catch {
    connected=false;$('update').hidden=true;$('connection').textContent='Belum terpasang';$('connectionHint').textContent='Pasang ekstensi pendamping untuk mengunduh PDF.';
    $('connection').parentElement.classList.remove('connected');$('setup').hidden=false;
  } finally {$('connect').disabled=false;refreshButtons()}
}
function fillSubjects() {
  const prev=$('subject').value;
  const matching=apps.filter(a=>!$('phase').value||a.phase===$('phase').value);
  $('subject').replaceChildren(new Option('Semua mata pelajaran',''));
  for(const subject of [...new Set(matching.map(a=>a.subject))].sort((a,b)=>a.localeCompare(b,'id'))) $('subject').add(new Option(subject,subject));
  if([...$('subject').options].some(o=>o.value===prev))$('subject').value=prev;
  renderOrders();
}
function selected(){return records.find(r=>r.appId+'::'+r.orderId===$('order').value)}
function renderOrders() {
  const previous=$('order').value;
  const query=$('search').value.trim().toLocaleLowerCase('id');
  const list=records.filter(r=>{
    const a=apps.find(a=>a.id===r.appId);if(!a)return false;
    return (!$('phase').value||a.phase===$('phase').value)&&(!$('subject').value||a.subject===$('subject').value)&&(!$('grade').value||($('grade').value==='sd'?['I','II','III','IV','V','VI'].includes(r.grade):r.grade===$('grade').value))&&(!$('school').value||r.school===$('school').value)&&(!query||[r.teacher,r.customer,r.school,r.number].join(' ').toLocaleLowerCase('id').includes(query));
  }).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  visibleOrders=list;
  $('order').replaceChildren();
  for(const r of list){const a=apps.find(a=>a.id===r.appId);$('order').add(new Option(`${r.teacher||r.customer||r.number} · ${a.subject} · ${r.grade}`,r.appId+'::'+r.orderId))}
  if(list.some(r=>r.appId+'::'+r.orderId===previous))$('order').value=previous;
  else if(list.length)$('order').selectedIndex=0;
  $('orderCount').textContent=records.length?`${list.length} pesanan ditampilkan dari ${records.length} pesanan di browser ini.`:'Belum ada data pesanan. Klik Ambil data pesanan setelah E-Perangkat tersinkron.';
  renderBatch();renderIdentity();
}
function renderIdentity() {
  const r=selected();$('identity').replaceChildren();$('identity').hidden=!r||batchMode();
  if(r){const a=apps.find(a=>a.id===r.appId);for(const [tag,text] of [['strong',r.teacher||r.customer||'Tanpa nama'],['span',r.school||'Sekolah belum diisi'],['span',`${a.subject} · Fase ${a.phase} · Kelas ${r.grade} · ${r.year}`],['span',`${r.number} · ${r.paymentStatus==='lunas'?'Lunas — cetak bersih':'Belum lunas — mengikuti watermark asli'}`],['span',`${r.hasSignature?'Tanda tangan tersimpan':'Tanpa tanda tangan unggahan'} · ${r.hasCustomLogo?'Logo khusus tersimpan':'Logo mengikuti pengaturan pesanan'}`]]){const el=document.createElement(tag);el.textContent=text;$('identity').append(el)}}
  refreshButtons();
}
function renderBatch(){
 const batch=batchMode();$('batchPicker').hidden=!batch;$('order').hidden=batch;
 $('batchOrders').replaceChildren();
 for(const r of visibleOrders){
  const label=document.createElement('label');label.className='batch-row';
  const input=document.createElement('input');input.type='checkbox';input.checked=checkedOrders.has(GeneratorBatch.key(r));input.setAttribute('aria-label',labelFor(r));
  const span=document.createElement('span'),title=document.createElement('b'),detail=document.createElement('small');
  title.textContent=`${appFor(r).subject} · Kelas ${r.grade}`;
  detail.textContent=`${r.teacher||r.customer||'Tanpa nama'} · ${r.school||'Sekolah belum diisi'} · ${r.year||''} · ${r.number||r.orderId} · ${r.paymentStatus==='lunas'?'Lunas':'Belum lunas'}`;
  span.append(title,detail);label.append(input,span);$('batchOrders').append(label);
  input.onchange=()=>{const k=GeneratorBatch.key(r);input.checked?checkedOrders.add(k):checkedOrders.delete(k);renderSelection();};
 }
 if(!visibleOrders.length){const p=document.createElement('p');p.className='small-note';p.textContent='Tidak ada pesanan sesuai filter. Ambil data pesanan atau ubah filter.';$('batchOrders').append(p);}
 renderSelection();
}
function renderSelection(){
 const chosen=records.filter(r=>checkedOrders.has(GeneratorBatch.key(r))),hidden=chosen.filter(r=>!visibleOrders.includes(r)).length;
 $('selectionCount').textContent=`${chosen.length} pesanan dipilih`+(hidden?` (${hidden} di luar filter saat ini)`:'');
 $('selectionList').replaceChildren();
 for(const r of chosen){const li=document.createElement('li'),button=document.createElement('button');li.textContent=labelFor(r);button.type='button';button.className='text-button';button.textContent='Hapus pilihan';button.onclick=()=>{checkedOrders.delete(GeneratorBatch.key(r));renderBatch();};li.append(button);$('selectionList').append(li);}
 refreshButtons();
}
async function loadOrders(){
  $('refresh').disabled=true;$('refresh').textContent='Mengambil data…';notice('');
  try{const result=await request('orders',{},45000);records=result.records||[];const valid=new Set(records.map(GeneratorBatch.key));for(const k of checkedOrders)if(!valid.has(k))checkedOrders.delete(k);const school=$('school').value;$('school').replaceChildren(new Option('Semua sekolah',''));for(const value of [...new Set(records.map(r=>r.school).filter(Boolean))].sort())$('school').add(new Option(value,value));if([...$('school').options].some(o=>o.value===school))$('school').value=school;renderOrders();if(!records.length)notice('Belum ditemukan pesanan. Buka portal E-Perangkat, tunggu sinkronisasi selesai, lalu klik Ambil data pesanan kembali.')}
  catch(error){notice(error.message)}finally{$('refresh').textContent='Ambil data pesanan ↻';refreshButtons()}
}
function renderQueue(){
 $('queueBox').hidden=!queue.length;$('queueList').replaceChildren();
 const names={pending:'Menunggu',running:'Sedang dibuat',done:'Selesai',failed:'Gagal'};
 for(const job of queue){const li=document.createElement('li');li.dataset.status=job.status;li.textContent=`${labelFor(job.order)} · Semester ${job.semester} — ${names[job.status]}`+(job.error?' · '+job.error:'');$('queueList').append(li);}
 const done=queue.filter(j=>j.status==='done').length,failed=queue.filter(j=>j.status==='failed').length;
 $('queueSummary').textContent=`${done} dari ${queue.length} PDF selesai`+(failed?` · ${failed} gagal`:'');
}
function recordResult(result){
 const li=document.createElement('li'),name=document.createElement('b'),meta=document.createElement('span');name.textContent=result.filename;
 meta.textContent=`${result.pages} halaman · ${(result.bytes/1048576).toFixed(1)} MB · Selesai${result.warning?' — '+result.warning:''}`;
 li.append(name,meta);$('resultList').prepend(li);$('results').hidden=false;
}
async function processQueue(){
 if(busy||!queue.length)return;
 busy=true;cancelled=false;refreshButtons();notice('');$('progressBox').hidden=false;$('cancel').hidden=false;
 try{
  await GeneratorBatch.run(queue,{
   cancelled:()=>cancelled,
   onChange:()=>renderQueue(),
   generate:async job=>{
    const index=queue.indexOf(job)+1;activeLabel=`PDF ${index}/${queue.length} · ${appFor(job.order)?.subject||''} kelas ${job.order.grade} · Semester ${job.semester}`;
    $('progress').textContent=activeLabel+' — Menyiapkan…';
    const result=await request('generate',{appId:job.order.appId,orderId:job.order.orderId,grade:job.order.grade,semester:job.semester},960000);
    recordResult(result);return result;
   }
  });
  const done=queue.filter(j=>j.status==='done').length,failed=queue.filter(j=>j.status==='failed').length,warnings=queue.filter(j=>j.result?.warning).length;
  notice(`${done} dari ${queue.length} PDF selesai diunduh.`+(cancelled?' Proses dihentikan.': '')+(failed?` ${failed} gagal; gunakan tombol Lanjutkan / ulangi yang belum selesai.`:'')+(warnings?` ${warnings} PDF memiliki catatan jumlah halaman; lihat hasil unduhan.`:''),!cancelled&&!failed&&!warnings);
 }catch(error){notice(error.message)}
 finally{busy=false;activeLabel='';$('progressBox').hidden=true;$('cancel').hidden=true;refreshButtons();if(!$('notice').hidden)$('notice').scrollIntoView({behavior:'smooth',block:'center'});}
}
async function generate(){
 if(busy||!chosenOrders().length)return;
 queue=GeneratorBatch.jobs(chosenOrders(),document.querySelector('[name=semester]:checked').value);
 renderQueue();await processQueue();
}
$('connect').onclick=connect;$('refresh').onclick=loadOrders;$('generate').onclick=generate;
$('cancel').onclick=async()=>{cancelled=true;$('cancel').disabled=true;try{await request('cancel')}catch(error){notice(error.message)}finally{$('cancel').disabled=false}};
$('resumeQueue').onclick=processQueue;
$('selectVisible').onclick=()=>{visibleOrders.forEach(r=>checkedOrders.add(GeneratorBatch.key(r)));renderBatch();};
$('clearSelection').onclick=()=>{checkedOrders.clear();renderBatch();};
document.querySelectorAll('[name=mode]').forEach(e=>e.onchange=()=>{renderBatch();renderIdentity();});
document.querySelectorAll('[name=semester]').forEach(e=>e.onchange=refreshButtons);
$('grade').onchange=renderOrders;$('school').onchange=renderOrders;
$('phase').onchange=fillSubjects;$('subject').onchange=renderOrders;$('search').oninput=renderOrders;$('order').onchange=renderIdentity;
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue=''}});
(async()=>{try{const r=await fetch('/catalog.json');if(!r.ok)throw Error('Katalog gagal dimuat.');apps=await r.json();fillSubjects();await connect()}catch(error){notice(error.message)}})();
