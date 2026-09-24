'use strict';
const VERSION='1.0.4';
const DEFAULT_PORTAL='https://e-perangkat-online-a-f.vercel.app';
let activeJob={cancelled:false,printTabId:null,debuggee:null,generatorTabId:null};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function safeOrigin(value){try{const u=new URL(value);return u.origin===DEFAULT_PORTAL?u.origin:DEFAULT_PORTAL}catch(_){return DEFAULT_PORTAL}}
function sanitize(name){return String(name||'E-Perangkat').replace(/[<>:"/\\|?*\x00-\x1F]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)||'E-Perangkat'}
function sendProgress(id,message){
  if(!activeJob.generatorTabId)return;
  chrome.tabs.sendMessage(activeJob.generatorTabId,{type:'GENERATOR_PROGRESS',id,message}).catch(()=>{});
}
function tabComplete(tabId,timeout=45000){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{chrome.tabs.onUpdated.removeListener(onUpdate);reject(Error('Tab E-Perangkat terlalu lama dimuat.'))},timeout);
    const onUpdate=(id,info,tab)=>{if(id===tabId&&info.status==='complete'){clearTimeout(timer);chrome.tabs.onUpdated.removeListener(onUpdate);resolve(tab)}};
    chrome.tabs.onUpdated.addListener(onUpdate);
    chrome.tabs.get(tabId).then(tab=>{if(tab.status==='complete'){clearTimeout(timer);chrome.tabs.onUpdated.removeListener(onUpdate);resolve(tab)}}).catch(()=>{});
  });
}
async function ensurePortalTab(origin){
  const tabs=await chrome.tabs.query({url:origin+'/*'});
  let tab=tabs.find(t=>t.url?.startsWith(origin+'/apps/'))||tabs[0];
  if(tab)return tab;
  tab=await chrome.tabs.create({url:origin+'/',active:false});
  await tabComplete(tab.id,60000);
  return tab;
}
async function execute(tabId,func,args=[]){
  const res=await chrome.scripting.executeScript({target:{tabId},func,args});
  return res?.[0]?.result;
}
async function collectOrders(tabId,apps){
  return execute(tabId,(apps)=>{
    const records=[];
    for(const app of Array.isArray(apps)?apps:[]){
      if(!app?.storageKey)continue;
      let store;try{store=JSON.parse(localStorage.getItem(app.storageKey)||'{}')}catch(_){store={}};
      for(const order of Array.isArray(store?.orders)?store.orders:[]){
        if(!order?.id)continue;
        const p=order.profile||{};
        records.push({
          appId:app.id,orderId:order.id,number:order.number||'',customer:order.customer||'',
          teacher:p.teacher||order.teacher||order.customer||'',school:p.school||order.school||'',
          year:p.year||order.year||'',grade:order.grade||localStorage.getItem(app.storageKey.replace(/\.orders$/,'.grade'))||'',
          paymentStatus:order.paymentStatus||'belum_lunas',updatedAt:order.updatedAt||order.createdAt||'',
          hasSignature:Boolean(p.teacherSignature||p.principalSignature),
          hasCustomLogo:Boolean(p.customLogoLeft||p.customLogoRight)
        });
      }
    }
    return records;
  },[apps]);
}
async function snapshotAndActivate(tabId,app,orderId,grade){
  return execute(tabId,(app,orderId,grade)=>{
    const k=app.storageKey,prefix=k.replace(/\.orders$/,'');
    const keys=[k,prefix+'.profile',prefix+'.students',prefix+'.grade'];
    const before={};for(const key of keys)before[key]=localStorage.getItem(key);
    const store=JSON.parse(localStorage.getItem(k)||'{}');
    const order=(store.orders||[]).find(o=>o.id===orderId);
    if(!order)throw new Error('Pesanan tidak ditemukan di browser E-Perangkat.');
    store.activeId=order.id;
    localStorage.setItem(k,JSON.stringify(store));
    localStorage.setItem(prefix+'.profile',JSON.stringify(order.profile||{}));
    localStorage.setItem(prefix+'.students',JSON.stringify(order.students||[]));
    localStorage.setItem(prefix+'.grade',String(grade||order.grade||''));
    return {before,keys};
  },[app,orderId,grade]);
}
async function restore(tabId,snapshot){
  if(!snapshot)return;
  await execute(tabId,(snapshot)=>{
    for(const key of snapshot.keys||[]){
      const value=snapshot.before?.[key];
      if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value);
    }
  },[snapshot]).catch(()=>{});
}
async function waitPrintReady(tabId,id,timeout=100000){
  const started=Date.now();let stable=0,last=-1;
  while(Date.now()-started<timeout){
    if(activeJob.cancelled)throw Error('Proses dibatalkan.');
    const state=await execute(tabId,async()=>{
      const text=(document.body?.innerText||'').slice(0,5000);
      const error=/E-Perangkat gagal dimuat|Failed to fetch|TypeError:\s*Failed to fetch/i.test(text)?text:'';
      if(document.fonts?.ready)await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]);
      const imagesReady=[...document.images].every(i=>i.complete);
      const pages=document.querySelectorAll('#printRoot > .page').length;
      return {ready:document.readyState,pages,imagesReady,title:document.title||'',status:document.getElementById('pageStatus')?.textContent||'',error};
    });
    if(state?.error)throw Error('Halaman cetak gagal dimuat: '+state.error.replace(/\s+/g,' ').slice(0,500));
    if(state?.ready==='complete'&&state.pages>0&&state.imagesReady){
      stable=state.pages===last?stable+1:0;last=state.pages;
      sendProgress(id,'Menunggu layout cetak stabil · '+state.pages+' halaman…');
      if(stable>=3){await sleep(1200);return state}
    }else sendProgress(id,'Menunggu halaman cetak dan aset…');
    await sleep(900);
  }
  throw Error('Halaman cetak belum stabil dalam batas waktu.');
}
function debugSend(debuggee,method,params={}){
  return new Promise((resolve,reject)=>chrome.debugger.sendCommand(debuggee,method,params,result=>{
    const e=chrome.runtime.lastError;if(e)reject(Error(e.message));else resolve(result||{});
  }));
}
async function waitDownload(downloadId,timeout=180000){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{chrome.downloads.onChanged.removeListener(listener);reject(Error('Unduhan PDF melewati batas waktu.'))},timeout);
    const listener=delta=>{
      if(delta.id!==downloadId)return;
      if(delta.state?.current==='complete'){clearTimeout(timer);chrome.downloads.onChanged.removeListener(listener);resolve()}
      else if(delta.state?.current==='interrupted'){clearTimeout(timer);chrome.downloads.onChanged.removeListener(listener);reject(Error('Unduhan PDF terputus.'))}
    };
    chrome.downloads.onChanged.addListener(listener);
  });
}
async function generate(id,payload){
  const origin=safeOrigin(payload.portalOrigin);
  const app=payload.app;
  if(!app?.appPath||!app?.storageKey)throw Error('Data perangkat tidak lengkap. Muat ulang Generator.');
  const portalTab=await ensurePortalTab(origin);
  let snap=null,attached=false;
  activeJob.cancelled=false;
  try{
    sendProgress(id,'Menyiapkan data pesanan…');
    snap=await snapshotAndActivate(portalTab.id,app,payload.orderId,payload.grade);
    const u=new URL(origin+app.appPath+'/print.html');
    u.searchParams.set('grade',payload.grade||'');
    u.searchParams.set('section','all');
    u.searchParams.set('semester',payload.semester||'1');
    u.searchParams.set('order',payload.orderId||'');
    sendProgress(id,'Membuka jalur cetak Production terbaru…');
    const printTab=await chrome.tabs.create({url:u.href,active:false});
    activeJob.printTabId=printTab.id;
    await tabComplete(printTab.id,70000);
    const ready=await waitPrintReady(printTab.id,id,100000);
    sendProgress(id,'Membuat PDF dengan mesin cetak Chrome…');
    const debuggee={tabId:printTab.id};activeJob.debuggee=debuggee;
    await chrome.debugger.attach(debuggee,'1.3');attached=true;
    await debugSend(debuggee,'Page.enable');
    const pdf=await debugSend(debuggee,'Page.printToPDF',{
      printBackground:true,displayHeaderFooter:false,preferCSSPageSize:true,
      scale:1,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0
    });
    if(!pdf?.data)throw Error('Chrome tidak mengembalikan data PDF.');
    const filename=sanitize(ready.title||('E-Perangkat '+(app.subject||'')+' Kelas '+payload.grade+' Semester '+payload.semester))+'.pdf';
    sendProgress(id,'Mengirim PDF ke folder Unduhan…');
    const downloadId=await chrome.downloads.download({url:'data:application/pdf;base64,'+pdf.data,filename,saveAs:false,conflictAction:'uniquify'});
    await waitDownload(downloadId);
    const bytes=Math.floor(pdf.data.length*3/4);
    return {filename,pages:ready.pages,bytes,warning:'',printUrl:u.href};
  } finally {
    if(attached&&activeJob.debuggee)await chrome.debugger.detach(activeJob.debuggee).catch(()=>{});
    if(activeJob.printTabId)await chrome.tabs.remove(activeJob.printTabId).catch(()=>{});
    await restore(portalTab.id,snap);
    activeJob.printTabId=null;activeJob.debuggee=null;
  }
}
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(!message||message.type!=='GENERATOR_REQUEST')return;
  activeJob.generatorTabId=sender.tab?.id||null;
  (async()=>{
    const {id,action,payload={}}=message;
    if(action==='hello')return {result:{version:VERSION}};
    if(action==='cancel'){activeJob.cancelled=true;if(activeJob.printTabId)await chrome.tabs.remove(activeJob.printTabId).catch(()=>{});return {result:{ok:true}}}
    if(action==='orders'){
      const origin=safeOrigin(payload.portalOrigin);
      sendProgress(id,'Membaca pesanan dari E-Perangkat…');
      const tab=await ensurePortalTab(origin);
      const records=await collectOrders(tab.id,payload.apps||[]);
      return {result:{records}};
    }
    if(action==='generate')return {result:await generate(id,payload)};
    throw Error('Aksi ekstensi tidak dikenal: '+action);
  })().then(sendResponse).catch(error=>sendResponse({error:error?.message||String(error)}));
  return true;
});
