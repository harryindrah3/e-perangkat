'use strict';
importScripts('core.js', 'pdf-lib.min.js');
const {ORIGIN,safeFilename,choose,snapshotForOrder,printUrl} = GeneratorCore;
const CHANNEL = 'genarator-e-perangkat-v1';
const SITE = 'https://genarator-e-perangkat.vercel.app';
const catalogPromise = fetch(chrome.runtime.getURL('catalog.json')).then(r=>r.json());
let running = null;
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:SITE}));

function allowedSender(sender) {
  try { return sender.tab?.id != null && new URL(sender.url).origin === SITE; } catch { return false; }
}
async function sourceTab() {
  const tabs = await chrome.tabs.query({url:ORIGIN+'/*'});
  let tab = tabs.find(t=>t.id !== running?.renderTabId && /\/index\.html|\.app\/$/.test(t.url||'')) || tabs.find(t=>t.id !== running?.renderTabId);
  if (!tab) tab = await chrome.tabs.create({url:ORIGIN+'/',active:false});
  for(let i=0;i<60;i++) {
    const current = await chrome.tabs.get(tab.id);
    if(current.status==='complete') return current;
    await delay(500);
  }
  throw Error('E-Perangkat belum selesai dimuat. Buka portal lalu coba kembali.');
}
async function readStorage() {
  const tab = await sourceTab();
  const results = await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{
    const data={};
    for(let i=0;i<localStorage.length;i++) {
      const k=localStorage.key(i);
      if(k?.startsWith('eperangkat.')) data[k]=localStorage.getItem(k);
    }
    return data;
  }});
  return results[0]?.result || {};
}
async function listOrders() {
  const [raw,apps] = await Promise.all([readStorage(),catalogPromise]);
  const records=[];
  for(const app of apps) {
    let store;
    try {store=JSON.parse(raw[app.storageKey]||'{}')} catch {continue}
    for(const o of store.orders||[]) {
      if(!o.id) continue;
      records.push({appId:app.id,orderId:o.id,number:o.number||'',customer:o.customer||'',teacher:o.profile?.teacher||'',school:o.profile?.school||'',year:o.profile?.year||'',grade:o.grade||'',paymentStatus:o.paymentStatus||'belum_lunas',updatedAt:o.updatedAt||'',hasSignature:!!(o.profile?.teacherSignature||o.profile?.principalSignature),hasCustomLogo:!!(o.profile?.customLogoLeft||o.profile?.customLogoRight)});
    }
  }
  return {records,version:chrome.runtime.getManifest().version};
}
async function progress(job,message,extra={}) {
  try {await chrome.tabs.sendMessage(job.owner,{channel:CHANNEL,direction:'progress',id:job.id,message,...extra})} catch {}
}
function ensureActive(job) {if(job.cancelled) throw Error('Proses dibatalkan.');}
async function command(job,method,params={}) {
  ensureActive(job);
  return chrome.debugger.sendCommand({tabId:job.renderTabId},method,params);
}
async function evaluate(job,expression) {
  const r=await command(job,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
  return r.result?.value;
}
const auditExpression = `(() => {
 const pages=[...document.querySelectorAll('#printRoot .page')];
 const images=[...document.images].filter(i=>i.closest('#printRoot'));
 const pending=images.filter(i=>!i.complete).length;
 const broken=images.filter(i=>i.complete&&!i.naturalWidth&&i.getAttribute('src')).map(i=>i.alt||'Gambar');
 const text=pages.map(p=>p.innerText).join('');let hash=2166136261;
 for(let i=0;i<text.length;i++) hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 const sizes=pages.map(p=>{const r=p.getBoundingClientRect();return Math.round(r.width)+','+Math.round(r.height)+','+p.scrollHeight}).join(';');
 return {pages:pages.length,hash,sizes,pending,broken,ready:document.readyState==='complete'&&document.fonts.status==='loaded',title:document.title,
 firstText:pages.slice(0,5).map(p=>p.innerText).join(''), fonts:[...new Set(pages.slice(0,4).flatMap(p=>[...p.querySelectorAll('*')].map(e=>getComputedStyle(e).fontFamily)))]};
})()`;
async function stable(job,timeout=100000) {
  const start=Date.now();let last='',matches=0,lastState;
  while(Date.now()-start<timeout) {
    ensureActive(job);
    let s;
    try {s=await evaluate(job,auditExpression)} catch(error) {
      if(job.cancelled) throw error;
      await delay(500);continue;
    }
    lastState=s;
    const sig=JSON.stringify([s.pages,s.hash,s.sizes,s.pending,s.broken,s.ready]);
    if(s.ready&&s.pages>0&&!s.pending&&sig===last) matches++;else matches=0;
    last=sig;
    if(matches>=6) {
      if(s.broken.length) throw Error('Gambar belum termuat: '+[...new Set(s.broken)].slice(0,3).join(', ')+'. Coba buka pratinjau E-Perangkat terlebih dahulu.');
      return s;
    }
    await delay(700);
  }
  throw Error('Halaman cetak belum stabil'+(lastState?' ('+lastState.pages+' halaman terbaca)':'')+'. Coba kembali setelah memeriksa pratinjau asli.');
}
function isolatedStorageScript(storage) {
  return `(() => {
    if(location.origin!==${JSON.stringify(ORIGIN)})return;
    const data=${JSON.stringify(storage)};
    const methods={getItem:k=>Object.prototype.hasOwnProperty.call(data,String(k))?data[String(k)]:null,
      setItem:(k,v)=>{data[String(k)]=String(v)},removeItem:k=>{delete data[String(k)]},clear:()=>{for(const k of Object.keys(data))delete data[k]},
      key:i=>Object.keys(data)[Number(i)]??null};
    const memory=new Proxy(methods,{get:(t,k)=>k==='length'?Object.keys(data).length:k in t?t[k]:data[k],set:(t,k,v)=>{data[k]=String(v);return true},
      ownKeys:()=>Object.keys(data),getOwnPropertyDescriptor:(t,k)=>({enumerable:true,configurable:true,value:data[k]})});
    Object.defineProperty(window,'localStorage',{configurable:true,get:()=>memory});
  })()`;
}
async function waitDownload(id) {
  for(let i=0;i<120;i++) {
    const [item]=await chrome.downloads.search({id});
    if(item?.state==='complete')return;
    if(item?.state==='interrupted')throw Error('Unduhan terhenti: '+(item.error||'periksa folder unduhan Chrome'));
    await delay(500);
  }
  throw Error('PDF telah dikirim ke Chrome, tetapi penyimpanan belum selesai. Periksa menu Unduhan Chrome.');
}
async function generate(payload,job) {
  let attached=false;
  try {
    const app=choose(await catalogPromise,payload);
    await progress(job,'Membaca data lengkap pesanan…');
    const {storage,order}=snapshotForOrder(await readStorage(),app,payload.orderId);
    if(order.grade!==payload.grade)throw Error('Kelas pesanan berubah. Ambil ulang data sebelum membuat PDF.');
    const tab=await chrome.tabs.create({url:'about:blank',active:false});
    job.renderTabId=tab.id;
    await chrome.debugger.attach({tabId:tab.id},'1.3');attached=true;
    await command(job,'Page.enable');
    await command(job,'Network.enable');
    // The print tab is an isolated read-only view: no cloud synchronization.
    await command(job,'Network.setBlockedURLs',{urls:['*://*/api/database*','*://script.google.com/*','*://script.googleusercontent.com/*']});
    await command(job,'Page.addScriptToEvaluateOnNewDocument',{source:isolatedStorageScript(storage)});
    await progress(job,'Memuat halaman cetak asli…');
    await command(job,'Page.navigate',{url:printUrl(app,payload)});
    await stable(job);
    await progress(job,'Menyiapkan margin, font, dan pembagian halaman…');
    await command(job,'Emulation.setEmulatedMedia',{media:'print'});
    await evaluate(job,`document.fonts.ready.then(()=>{window.dispatchEvent(new Event('beforeprint'));return true})`);
    let before=await stable(job);
    const teacher=String(order.profile?.teacher||'').replace(/\s+/g,' ').trim();
    if(teacher&&!before.firstText.replace(/\s+/g,' ').includes(teacher))throw Error('Identitas pada halaman cetak tidak cocok dengan pesanan. PDF dibatalkan.');
    await progress(job,'Membuat PDF dari '+before.pages+' halaman…',{pages:before.pages});
    // Never restrict pageRanges or re-typeset the document. Native Chrome
    // print uses the original CSS, locally installed fonts and named pages.
    let output=await command(job,'Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,scale:1,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,transferMode:'ReturnAsBase64'});
    let after=await stable(job,30000);
    // Some source handlers repaginate on beforeprint. Render again only if
    // the first native print changed content or page count.
    if(before.pages!==after.pages||before.hash!==after.hash) {
      before=after;
      output=await command(job,'Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,scale:1,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,transferMode:'ReturnAsBase64'});
      after=await stable(job,30000);
      if(before.pages!==after.pages||before.hash!==after.hash)throw Error('Isi masih berubah ketika dicetak. Tunggu lalu ulangi proses.');
    }
    const bytes=Uint8Array.from(atob(output.data),c=>c.charCodeAt(0));
    const pdf=await PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
    const pages=pdf.getPageCount();
    if(pages!==after.pages)throw Error('Jumlah halaman PDF ('+pages+') berbeda dari pratinjau ('+after.pages+'). Tidak ada halaman yang dipotong; unduhan dibatalkan untuk pemeriksaan.');
    const filename=safeFilename(after.title)+'.pdf';
    await progress(job,'Menyimpan '+pages+' halaman ke Unduhan…',{pages});
    const downloadId=await chrome.downloads.download({url:'data:application/pdf;base64,'+output.data,filename,saveAs:false});
    await waitDownload(downloadId);
    return {filename,pages,bytes:bytes.length,fonts:after.fonts,semester:String(payload.semester)};
  } finally {
    if(attached) {try{await chrome.debugger.detach({tabId:job.renderTabId})}catch{}}
    if(job.renderTabId) {try{await chrome.tabs.remove(job.renderTabId)}catch{}}
  }
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!allowedSender(sender)||message?.channel!==CHANNEL) return;
  (async()=>{
    if(message.action==='hello')return {version:chrome.runtime.getManifest().version};
    if(message.action==='orders')return listOrders();
    if(message.action==='cancel') {
      if(running?.owner===sender.tab.id) {running.cancelled=true;if(running.renderTabId)try{await chrome.tabs.remove(running.renderTabId)}catch{}}
      return {cancelled:true};
    }
    if(message.action==='generate') {
      if(running)throw Error('Masih ada PDF yang diproses. Tunggu sampai selesai.');
      const job={owner:sender.tab.id,id:message.id,renderTabId:null,cancelled:false};running=job;
      try{return await generate(message.payload,job)}finally{if(running===job)running=null}
    }
    throw Error('Perintah tidak dikenal.');
  })().then(result=>respond({result}),error=>respond({error:error?.message||String(error)}));
  return true;
});
