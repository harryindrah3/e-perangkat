'use strict';
importScripts('core.js', 'job-utils.js', 'pdf-lib.min.js');
const {bounded, readPdfStream} = GeneratorJobs;
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
  job.stage=message;
  if(job.renderTabId && job.loaded) {
    try { await bounded(chrome.scripting.executeScript({target:{tabId:job.renderTabId},func:(message)=>{
      let box=document.getElementById('ep-generator-progress');
      if(!box){box=document.createElement('aside');box.id='ep-generator-progress';box.setAttribute('role','status');
        box.style.cssText='position:fixed;z-index:2147483647;top:12px;right:12px;max-width:380px;padding:16px 20px;background:#123c35;color:white;border-radius:12px;font:15px/1.5 Arial;box-shadow:0 4px 20px #0005';
        const style=document.createElement('style');style.textContent='@media print {#ep-generator-progress{display:none!important}}';box.append(style);
        const label=document.createElement('span');box.append(label);document.body.append(box);}
      box.querySelector('span').textContent='Generator PDF: '+message;
    },args:[message]}),2000,'Status tab'); } catch {}
  }
  try {await chrome.tabs.sendMessage(job.owner,{channel:CHANNEL,direction:'progress',id:job.id,message,...extra})} catch {}
}
function ensureActive(job) {if(job.cancelled) throw Error('Proses dibatalkan.');if(job.detached)throw Error('Koneksi mesin cetak terputus: '+job.detached);if(Date.now()>job.deadline)throw Error('Batas waktu pembuatan PDF terlampaui.');}
async function command(job,method,params={},limit) {
  ensureActive(job);
  const timeout=Math.min(limit??(method==='Page.printToPDF'?600000:30000),job.deadline-Date.now());
  return bounded(chrome.debugger.sendCommand({tabId:job.renderTabId},method,params),timeout,method);
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
 const text=pages.map(p=>p.textContent).join('');let hash=2166136261;
 for(let i=0;i<text.length;i++) hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 const sizes=pages.map(p=>{const r=p.getBoundingClientRect();return Math.round(r.width)+','+Math.round(r.height)+','+p.scrollHeight}).join(';');
 return {pages:pages.length,hash,sizes,pending,broken,ready:document.readyState==='complete'&&document.fonts.status==='loaded',title:document.title,printedPages:Number(document.documentElement.dataset.generatorPrintedPages)||0,
 firstText:pages.slice(0,5).map(p=>p.innerText).join(''), fonts:[...new Set(pages.slice(0,4).flatMap(p=>[...p.querySelectorAll('*')].map(e=>getComputedStyle(e).fontFamily)))]};
})()`;
async function stable(job,timeout=100000) {
  const start=Date.now();let last='',matches=0,lastState;
  while(Date.now()-start<timeout) {
    ensureActive(job);
    let s;
    try {s=await evaluate(job,auditExpression)} catch(error) {
      ensureActive(job);
      if(!/context|navigat/i.test(error.message))throw error;
      await delay(500);continue;
    }
    if(!s){await delay(500);continue;}
    lastState=s;
    if(job.loaded && Date.now()-(job.lastReport||0)>5000){job.lastReport=Date.now();await progress(job,'Menyiapkan '+s.pages+' halaman'+(s.pending?' · '+s.pending+' gambar menunggu':'')+'…',{pages:s.pages});}
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
    const {storage,order}=snapshotForOrder(await bounded(readStorage(),45000,'Membaca pesanan'),app,payload.orderId);
    if(order.grade!==payload.grade)throw Error('Kelas pesanan berubah. Ambil ulang data sebelum membuat PDF.');
    // Pagination uses requestAnimationFrame. Keep the temporary print tab
    // visible so Chrome does not suspend layout work in a background tab.
    const tab=await chrome.tabs.create({url:'about:blank',active:true});
    job.renderTabId=tab.id;
    await bounded(chrome.debugger.attach({tabId:tab.id},'1.3'),10000,'Menghubungkan mesin cetak');attached=true;
    await command(job,'Page.enable');
    await progress(job,'Memeriksa mesin PDF Chrome…');
    const probe=await command(job,'Page.printToPDF',{transferMode:'ReturnAsBase64',generateTaggedPDF:false},15000);
    if(!probe.data||!atob(probe.data).startsWith('%PDF-'))throw Error('Chrome tidak menghasilkan PDF pada pemeriksaan awal.');
    await command(job,'Network.enable');
    // The print tab is an isolated read-only view: no cloud synchronization.
    await command(job,'Network.setBlockedURLs',{urls:['*://*/api/database*','*://script.google.com/*','*://script.googleusercontent.com/*']});
    await command(job,'Page.addScriptToEvaluateOnNewDocument',{source:isolatedStorageScript(storage)});
    await progress(job,'Memuat halaman cetak asli…');
    await command(job,'Page.navigate',{url:printUrl(app,payload)});
    await stable(job);
    job.loaded=true;
    await progress(job,'Memeriksa identitas dan kesiapan halaman…');
    let before=await stable(job);
    const teacher=String(order.profile?.teacher||'').replace(/\s+/g,' ').trim();
    if(teacher&&!before.firstText.replace(/\s+/g,' ').includes(teacher))throw Error('Identitas pada halaman cetak tidak cocok dengan pesanan. PDF dibatalkan.');
    // Complete the source's synchronous print preparation once, then wait for
    // its deferred pagination to settle. Pause source JS only in this isolated
    // tab so beforeprint/observers cannot rebuild it during the native PDF job.
    await progress(job,'Menyiapkan hasil cetak akhir…');
    await evaluate(job,`(() => {window.dispatchEvent(new Event('beforeprint'));return true})()`);
    before=await stable(job);
    await progress(job,'Membuat PDF '+before.pages+' halaman. Dokumen besar bisa memerlukan beberapa menit; biarkan tab ini terbuka.',{pages:before.pages});
    await command(job,'Emulation.setScriptExecutionDisabled',{value:true});
    let output;
    try {
      output=await command(job,'Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,generateTaggedPDF:false,scale:1,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,transferMode:'ReturnAsStream'});
    } finally {
      // Use the transport directly so cancellation/deadline does not prevent
      // resetting the override. The tab is closed before debugger detachment.
      try{await bounded(chrome.debugger.sendCommand({tabId:job.renderTabId},'Emulation.setScriptExecutionDisabled',{value:false}),3000,'Memulihkan tab cetak');}catch{}
    }
    await progress(job,'Membaca file PDF dari Chrome…');
    const bytes=await readPdfStream(output,(method,params)=>command(job,method,params));
    const pdf=await PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
    const pages=pdf.getPageCount();
    const warning=GeneratorJobs.pageCountWarning(pages,before.pages);
    const filename=safeFilename(before.title)+'.pdf';
    await progress(job,'Menyimpan '+pages+' halaman ke Unduhan…',{pages});
    const downloadId=await bounded(chrome.downloads.download({url:'data:application/pdf;base64,'+GeneratorJobs.toBase64(bytes),filename,saveAs:false}),45000,'Mengirim PDF ke folder Unduhan');
    await waitDownload(downloadId);
    return {filename,pages,bytes:bytes.length,fonts:before.fonts,semester:String(payload.semester),warning};
  } catch(error) {
    throw Error('Tahap: '+(job.stage||'Persiapan')+' — '+(error?.message||String(error)));
  } finally {
    // Close the isolated document while network blocking is still attached,
    // so queued synchronization cannot resume on a restored source script.
    if(job.renderTabId) {try{await bounded(chrome.tabs.remove(job.renderTabId),3000,'Menutup tab sementara')}catch{}}
    if(attached) {try{await bounded(chrome.debugger.detach({tabId:job.renderTabId}),3000,'Melepas mesin cetak')}catch{}}
    try{await bounded(chrome.tabs.update(job.owner,{active:true}),3000,'Kembali ke generator')}catch{}
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
      const job={owner:sender.tab.id,id:message.id,renderTabId:null,cancelled:false,deadline:Date.now()+900000};running=job;
      try{return await generate(message.payload,job)}finally{if(running===job)running=null}
    }
    throw Error('Perintah tidak dikenal.');
  })().then(result=>respond({result}),error=>respond({error:error?.message||String(error)}));
  return true;
});

chrome.debugger.onDetach.addListener((source,reason)=>{if(running?.renderTabId===source.tabId)running.detached=reason;});
