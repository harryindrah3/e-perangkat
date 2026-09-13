'use strict';
const $=id=>document.getElementById(id);
const CHANNEL='genarator-e-perangkat-v1';
let apps=[],records=[],connected=false,busy=false,cancelled=false;
const pending=new Map();
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
  if(m.direction==='progress'&&pending.has(m.id)){$('progress').textContent=m.message;return}
  if(m.direction!=='response')return;
  const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);
  if(m.error)p.reject(Error(m.error));else if(m.result===undefined)p.reject(Error('Ekstensi berhenti tanpa hasil. Muat ulang ekstensi dan generator.'));else p.resolve(m.result);
});
function notice(text,success=false){$('notice').textContent=text;$('notice').classList.toggle('success',success);$('notice').hidden=!text}
function refreshButtons(){$('generate').disabled=!connected||busy||!selected();$('refresh').disabled=!connected||busy;for(const id of ['phase','subject','order','search'])$(id).disabled=busy}
async function connect() {
  $('connection').textContent='Memeriksa koneksi…';$('connect').disabled=true;
  try {
    const result=await request('hello',{},1800);connected=result.version.split('.').map(Number).reduce((v,n)=>v*1000+n,0)>=1000002;
    $('update').hidden=connected;
    $('connection').textContent='Terhubung · v'+result.version;$('connectionHint').textContent=connected?'Siap membaca pesanan dari Chrome ini.':'Pembaruan 1.0.2 diperlukan; ikuti petunjuk di bawah.';
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
    return (!$('phase').value||a.phase===$('phase').value)&&(!$('subject').value||a.subject===$('subject').value)&&(!query||[r.teacher,r.customer,r.school,r.number].join(' ').toLocaleLowerCase('id').includes(query));
  }).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  $('order').replaceChildren();
  for(const r of list){const a=apps.find(a=>a.id===r.appId);$('order').add(new Option(`${r.teacher||r.customer||r.number} · ${a.subject} · ${r.grade}`,r.appId+'::'+r.orderId))}
  if(list.some(r=>r.appId+'::'+r.orderId===previous))$('order').value=previous;
  else if(list.length)$('order').selectedIndex=0;
  $('orderCount').textContent=records.length?`${list.length} pesanan ditampilkan dari ${records.length} pesanan di browser ini.`:'Belum ada data pesanan. Klik Ambil data pesanan setelah E-Perangkat tersinkron.';
  renderIdentity();
}
function renderIdentity() {
  const r=selected();$('identity').replaceChildren();$('identity').hidden=!r;
  if(r){const a=apps.find(a=>a.id===r.appId);for(const [tag,text] of [['strong',r.teacher||r.customer||'Tanpa nama'],['span',r.school||'Sekolah belum diisi'],['span',`${a.subject} · Fase ${a.phase} · Kelas ${r.grade} · ${r.year}`],['span',`${r.number} · ${r.paymentStatus==='lunas'?'Lunas — cetak bersih':'Belum lunas — mengikuti watermark asli'}`],['span',`${r.hasSignature?'Tanda tangan tersimpan':'Tanpa tanda tangan unggahan'} · ${r.hasCustomLogo?'Logo khusus tersimpan':'Logo mengikuti pengaturan pesanan'}`]]){const el=document.createElement(tag);el.textContent=text;$('identity').append(el)}}
  refreshButtons();
}
async function loadOrders(){
  $('refresh').disabled=true;$('refresh').textContent='Mengambil data…';notice('');
  try{const result=await request('orders',{},45000);records=result.records||[];renderOrders();if(!records.length)notice('Belum ditemukan pesanan. Buka portal E-Perangkat, tunggu sinkronisasi selesai, lalu klik Ambil data pesanan kembali.')}
  catch(error){notice(error.message)}finally{$('refresh').textContent='Ambil data pesanan ↻';refreshButtons()}
}
async function generate(){
  const order=selected();if(!order||busy)return;
  busy=true;cancelled=false;refreshButtons();notice('');$('progressBox').hidden=false;$('cancel').hidden=false;$('progress').textContent='Menyiapkan unduhan…';
  const semester=document.querySelector('[name=semester]:checked').value;
  const semesters=semester==='both'?['1','2']:[semester];
  let completed=0;
  try{
    for(const sem of semesters){
      if(cancelled)break;
      const result=await request('generate',{appId:order.appId,orderId:order.orderId,grade:order.grade,semester:sem},300000);
      const li=document.createElement('li'),name=document.createElement('b'),meta=document.createElement('span');name.textContent=result.filename;meta.textContent=`${result.pages} halaman · ${(result.bytes/1048576).toFixed(1)} MB · Selesai`;li.append(name,meta);$('resultList').prepend(li);$('results').hidden=false;completed++;
    }
    notice(cancelled?`Proses dibatalkan. ${completed} PDF selesai diunduh.`:`${completed} PDF selesai disimpan ke folder Unduhan.`,!cancelled);
  }catch(error){notice((completed?`${completed} PDF sudah selesai. `:'')+error.message)}
  finally{busy=false;$('progressBox').hidden=true;$('cancel').hidden=true;refreshButtons()}
}
$('connect').onclick=connect;$('refresh').onclick=loadOrders;$('generate').onclick=generate;
$('cancel').onclick=async()=>{cancelled=true;$('cancel').disabled=true;try{await request('cancel')}catch(error){notice(error.message)}finally{$('cancel').disabled=false}};
$('phase').onchange=fillSubjects;$('subject').onchange=renderOrders;$('search').oninput=renderOrders;$('order').onchange=renderIdentity;
window.addEventListener('beforeunload',event=>{if(busy){event.preventDefault();event.returnValue=''}});
(async()=>{try{const r=await fetch('/catalog.json');if(!r.ok)throw Error('Katalog gagal dimuat.');apps=await r.json();fillSubjects();await connect()}catch(error){notice(error.message)}})();
