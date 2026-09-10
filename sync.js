(function(){
  "use strict";
  const KNOWN_KEY="portal.eperangkat.sync.known.v1";
  const TOMBSTONE_KEY="portal.eperangkat.sync.tombstones.v1";
  const STATE_KEY="portal.eperangkat.sync.state.v1";
  const catalog=window.EPERANGKAT_CATALOG?.apps||[];
  const listeners=new Set();
  let syncing=false;
  let scanTimer=0;

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch(_){return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const now=()=>new Date().toISOString();
  const config=()=>({url:"/api/database",autoSync:true});
  const state=()=>({dirty:false,lastSync:"",lastError:"",...read(STATE_KEY,{})});
  const appById=id=>catalog.find(app=>app.id===id);
  const orderKey=id=>`${id.appId}::${id.orderId}`;

  function notify(){const snapshot=getStatus();listeners.forEach(listener=>listener(snapshot));}
  function updateState(patch){write(STATE_KEY,{...state(),...patch});notify();}
  function getStore(app){return read(app.storageKey,{activeId:"",orders:[]});}
  function setStore(app,store){write(app.storageKey,{activeId:store.activeId||store.orders?.[0]?.id||"",orders:Array.isArray(store.orders)?store.orders:[]});}

  function cloudOrder(order){
    const copy=clone(order||{});
    copy.profile=copy.profile||{};
    for(const key of ["teacherSignature","principalSignature","customLogoLeft","customLogoRight"])delete copy.profile[key];
    copy.students=Array.isArray(copy.students)?copy.students.slice(0,40):[];
    copy.history=(Array.isArray(copy.history)?copy.history:[]).slice(0,50).map(entry=>({
      id:entry.id||`h-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      time:entry.time||copy.updatedAt||now(),
      action:String(entry.action||"Perubahan").slice(0,180),
      detail:String(entry.detail||"").replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,"[gambar lokal]").slice(0,1200),
      snapshot:null
    }));
    return copy;
  }

  function collect({trackDeletions=true}={}){
    const records=[];
    const current=[];
    for(const app of catalog){
      const store=getStore(app);
      for(const rawOrder of Array.isArray(store.orders)?store.orders:[]){
        if(!rawOrder?.id)continue;
        const order=cloudOrder(rawOrder);
        current.push(`${app.id}::${order.id}`);
        records.push({
          appId:app.id,appName:app.name,phase:app.phase,subject:app.subject,
          orderId:order.id,orderNumber:order.number||"",customer:order.customer||"",
          whatsapp:order.whatsapp||"",grade:order.grade||"",school:order.profile?.school||order.school||"",
          total:Number(order.total)||0,paid:Number(order.paid)||0,paymentStatus:order.paymentStatus||"belum_lunas",
          createdAt:order.createdAt||now(),updatedAt:order.updatedAt||order.createdAt||now(),payload:order
        });
      }
    }
    if(trackDeletions){
      const previous=read(KNOWN_KEY,[]),currentSet=new Set(current),tombstones=read(TOMBSTONE_KEY,[]);
      const tombstoneKeys=new Set(tombstones.map(orderKey));
      for(const item of previous){
        if(currentSet.has(item)||!item.includes("::"))continue;
        const [appId,...parts]=item.split("::"),orderId=parts.join("::");
        const deletion={appId,orderId,updatedAt:now()};
        if(!tombstoneKeys.has(orderKey(deletion)))tombstones.push(deletion);
      }
      write(TOMBSTONE_KEY,tombstones);
      write(KNOWN_KEY,current);
    }
    return records;
  }

  function preserveLocalImages(remote,local){
    if(!local?.profile)return remote;
    remote.profile=remote.profile||{};
    for(const key of ["teacherSignature","principalSignature","customLogoLeft","customLogoRight"]){
      if(local.profile[key]&&!remote.profile[key])remote.profile[key]=local.profile[key];
    }
    return remote;
  }

  function mergeRemote(records=[],deletions=[]){
    const deletedMap=new Map(deletions.map(item=>[`${item.appId}::${item.orderId}`,item.updatedAt||""]));
    const grouped=new Map();
    for(const record of records){
      if(!record?.appId||!record?.orderId)continue;
      if(!grouped.has(record.appId))grouped.set(record.appId,[]);
      grouped.get(record.appId).push(record);
    }
    for(const app of catalog){
      const store=getStore(app),localOrders=Array.isArray(store.orders)?store.orders:[],localMap=new Map(localOrders.map(order=>[order.id,order]));
      for(const record of grouped.get(app.id)||[]){
        const local=localMap.get(record.orderId),remote=clone(record.payload||{});
        if(!remote.id)remote.id=record.orderId;
        const remoteTime=Date.parse(remote.updatedAt||record.updatedAt||0),localTime=Date.parse(local?.updatedAt||0);
        if(!local||remoteTime>localTime)localMap.set(remote.id,preserveLocalImages(remote,local));
      }
      for(const [id,local] of [...localMap]){
        const deletedAt=deletedMap.get(`${app.id}::${id}`);
        if(deletedAt&&Date.parse(deletedAt)>=Date.parse(local.updatedAt||0))localMap.delete(id);
      }
      const orders=[...localMap.values()].sort((a,b)=>Date.parse(b.updatedAt||0)-Date.parse(a.updatedAt||0));
      const activeId=orders.some(order=>order.id===store.activeId)?store.activeId:(orders[0]?.id||"");
      setStore(app,{activeId,orders});
    }
    write(KNOWN_KEY,collect({trackDeletions:false}).map(record=>`${record.appId}::${record.orderId}`));
  }

  async function sync(){
    if(syncing)return {ok:false,message:"Sinkronisasi sedang berjalan."};
    const cfg=config();
    if(!navigator.onLine)throw new Error("Perangkat sedang offline. Data tetap aman dalam antrean lokal.");
    syncing=true;updateState({lastError:""});
    try{
      const records=collect(),deletions=read(TOMBSTONE_KEY,[]);
      const response=await fetch(cfg.url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"sync",clientId:getClientId(),records,deletions})});
      if(!response.ok)throw new Error(`Database menjawab HTTP ${response.status}.`);
      const result=await response.json();
      if(!result.ok)throw new Error(result.message||"Database menolak sinkronisasi.");
      mergeRemote(result.records||[],result.deletions||[]);
      write(TOMBSTONE_KEY,[]);
      updateState({dirty:false,lastSync:result.serverTime||now(),lastError:""});
      return result;
    }catch(error){
      updateState({dirty:true,lastError:error.message||String(error)});
      throw error;
    }finally{syncing=false;notify();}
  }

  async function test(){
    const response=await fetch("/api/database?action=ping",{headers:{"Accept":"application/json"}});
    if(!response.ok)throw new Error(`Database menjawab HTTP ${response.status}.`);
    const result=await response.json();
    if(!result.ok)throw new Error(result.message||"Database menolak koneksi.");
    return result;
  }

  function getClientId(){
    const key="portal.eperangkat.client.v1";let id=localStorage.getItem(key);
    if(!id){id=`client-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;localStorage.setItem(key,id)}
    return id;
  }

  function markDirty(){updateState({dirty:true});scheduleAutoSync();}
  function scheduleScan(){clearTimeout(scanTimer);scanTimer=setTimeout(()=>{collect();markDirty();notify();},350);}
  function scheduleAutoSync(){if(navigator.onLine)setTimeout(()=>sync().catch(()=>{}),1200);}
  function getStatus(){const syncState=state();return {configured:true,online:navigator.onLine,syncing,dirty:syncState.dirty,lastSync:syncState.lastSync,lastError:syncState.lastError,tombstones:read(TOMBSTONE_KEY,[]).length};}

  function exportBackup(){
    const stores={};for(const app of catalog){const store=getStore(app);if(store.orders?.length)stores[app.storageKey]=store;}
    return {type:"Portal E-Perangkat Backup",version:1,exportedAt:now(),catalogVersion:window.EPERANGKAT_CATALOG?.generatedAt||"",stores,portal:{known:read(KNOWN_KEY,[]),tombstones:read(TOMBSTONE_KEY,[])}};
  }
  function importBackup(data){
    if(data?.type!=="Portal E-Perangkat Backup"||!data.stores||typeof data.stores!=="object")throw new Error("Berkas bukan backup Portal E-Perangkat yang valid.");
    const allowed=new Set(catalog.map(app=>app.storageKey));let imported=0;
    for(const [key,store] of Object.entries(data.stores)){if(!allowed.has(key)||!Array.isArray(store?.orders))continue;write(key,store);imported+=store.orders.length;}
    collect();markDirty();return imported;
  }

  window.addEventListener("storage",event=>{if(catalog.some(app=>app.storageKey===event.key))scheduleScan();});
  window.addEventListener("online",()=>{notify();scheduleAutoSync();});
  window.addEventListener("offline",notify);
  collect();

  window.PortalSync={config,state,getStatus,collect,sync,test,markDirty,exportBackup,importBackup,onChange(listener){listeners.add(listener);return()=>listeners.delete(listener)},getStore,setStore};
})();
