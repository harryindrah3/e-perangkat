(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const KEY='eperangkat.bahasa-arab.fased.v1.orders';
  const now=()=>new Date().toISOString();
  const clone=x=>JSON.parse(JSON.stringify(x));
  const isQuotaError=error=>!!error&&(error.name==='QuotaExceededError'||error.code===22||/quota/i.test(String(error.message||'')));
  const lightProfile=profile=>{const copy={...(profile||{})};delete copy.teacherSignature;delete copy.principalSignature;return copy};
  const cleanupOldMath=()=>{
    const keys=[];
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index)||'';
      if(key.startsWith('eperangkat.bahasa-arab.fased.v1.legacy.')&&!key.startsWith('eperangkat.bahasa-arab.fased.v1.'))keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    return keys.length;
  };
  const safeSet=(key,value)=>{
    try{localStorage.setItem(key,value);return true}
    catch(error){
      if(!isQuotaError(error))throw error;
      if(confirm('Penyimpanan browser penuh. Hapus data B. Arab versi lama agar V23.1 dapat dijalankan? File aplikasi lama di komputer tetap aman.')){
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
    return `PSN-${st¶»§q«^