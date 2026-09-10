(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const KEY='eperangkat.geografi.fasee.v1.orders';
  const now=()=>new Date().toISOString();
  const clone=x=>JSON.parse(JSON.stringify(x));
  const isQuotaError=error=>!!error&&(error.name==='QuotaExceededError'||error.code===22||/quota/i.test(String(error.message||'')));
  const lightProfile=profile=>{const copy={...(profile||{})};delete copy.teacherSignature;delete copy.principalSignature;return copy};
  const cleanupOldMath=()=>{
    const keys=[];
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index)||'';
      if(key.startsWith('eperangkat.geografi.fasee.v1.legacy.')&&!key.startsWith('eperangkat.geografi.fasee.v1.'))keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    return keys.length;
  };
  const safeSet=(key,value)=>{
    try{localStorage.setItem(key,value);return true}
    catch(error){
      if(!isQuotaError(error))throw error;
      if(confirm('Penyimpanan browser penuh. Hapus data Geografi versi lama agar V23.1 dapat dijalankan? File aplikasi lama di komputer tetap aman.')){
        cleanupOldMath();
        localStorage.setItem(key,value);
        return true;
      }
      window.EPERANGKAT_STORAGE_ERROR='Penyimpanan penuh';
      return false;
    }
  };
  const makeNo=()=>{
    const d=new Date(), stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    return `PSN-${stamp}-001`;
  };
  let store;
  try{store=JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){store=null}
  if(!store||!Array.isArray(store.orders)||!store.orders.length){
    let profile={...(D.defaults||{})};
    try{profile={...profile,...JSON.parse(localStorage.getItem('eperangkat.geografi.fasee.v1.profile')||'{}')}}catch(_){}
    let students=[];
    try{students=JSON.parse(localStorage.getItem('eperangkat.geografi.fasee.v1.students')||'[]')}catch(_){}
    const grade=localStorage.getItem('eperangkat.geografi.fasee.v1.grade')||'X';
    const id=`order-${Date.now()}`;
    store={activeId:id,orders:[{
      id,number:makeNo(),customer:'',whatsapp:'',grade,school:profile.school||'',total:0,paid:0,
      paymentStatus:'belum_lunas',watermark:'BELUM LUNAS',notes:'',createdAt:now(),updatedAt:now(),
      profile:clone(profile),students:clone(students),calendar:null,
      history:[{id:`h-${Date.now()}`,time:now(),action:'Pesanan dibuat',detail:'Data awal diimpor dari aplikasi versi sebelumnya.',snapshot:null}]
    }]};
    safeSet(KEY,JSON.stringify(store));
  }
  const active=store.orders.find(o=>o.id===store.activeId)||store.orders[0];
  store.activeId=active.id;
  active.profile={...(D.defaults||{}),...(active.profile||{})};
  active.students=Array.isArray(active.students)?active.students:[];
  active.grade=active.grade||'X';
  safeSet(KEY,JSON.stringify(store));
  safeSet('eperangkat.geografi.fasee.v1.profile',JSON.stringify(lightProfile(active.profile)));
  safeSet('eperangkat.geografi.fasee.v1.students',JSON.stringify(active.students));
  safeSet('eperangkat.geografi.fasee.v1.grade',active.grade);
})();

