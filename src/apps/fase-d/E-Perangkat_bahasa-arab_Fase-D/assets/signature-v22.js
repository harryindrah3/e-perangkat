(()=>{
  'use strict';
  const PROFILE_KEY='eperangkat.bahasa-arab.fased.v1.profile';
  const ORDER_KEY='eperangkat.bahasa-arab.fased.v1.orders';
  const $=(s,r=document)=>r.querySelector(s);
  const form=$('#profileForm');
  if(!form)return;

  function profile(){
    let cached={};try{cached=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(_){}
    let orderProfile={};
    try{
      const store=JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}');
      const order=(store.orders||[]).find(item=>item.id===store.activeId)||(store.orders||[])[0];
      orderProfile=order?.profile||{};
    }catch(_){}
    return {...orderProfile,...cached};
  }
  function setPreview(kind,data){
    const cap=kind==='teacher'?'Teacher':'Principal';
    const hidden=form.elements[`${kind}Signature`];
    const preview=$(`#quick${cap}SignaturePreview`);
    if(hidden)hidden.value=data||'';
    if(preview){
      preview.classList.toggle('has-image',!!data);
      preview.innerHTML=data?`<img src="${data}" alt="Tanda tangan">`:'Belum ada tanda tangan';
    }
  }
  function load(){
    const p=profile();
    setPreview('teacher',p.teacherSignature||'');
    setPreview('principal',p.principalSignature||'');
  }
  function resize(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/'))return reject(new Error('File bukan gambar.'));
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Gambar¶»§q«^