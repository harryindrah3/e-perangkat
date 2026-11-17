(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const $=(s,r=document)=>r.querySelector(s);
  const params=new URLSearchParams(location.search);
  const section=params.get('section')||'all';
  if(!['all','core','schedule'].includes(section))return;
  const semester=params.get('semester')||'both';
  const STORE='eperangkat.bahasa-arab.fased.v1.orders';
  const PROFILE='eperangkat.bahasa-arab.fased.v1.profile';
  const grade=params.get('grade')||localStorage.getItem('eperangkat.bahasa-arab.fased.v1.grade')||'VII';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  const store=getStore(),orderId=params.get('order')||'',order=(store.orders||[]).find(o=>o.id===orderId)||(store.orders||[]).find(o=>o.id===store.activeId)||(store.orders||[])[0]||{};
  let localProfile={};try{localProfile=JSON.parse(localStorage.getItem(PROFILE)||'{}')}catch(_){}
  const P={...(D.defaults||{}),...(order.profile||{}),...localProfile};
  const teacherRole=P.teacherRole||'Guru';
  function idLine(type,value){const t=String(type||'NIP').toUpperCase(),v=String(value||'').trim();if(t==='NONE'||!v)return '';return `<br>${esc(t==='NUPTK'?'NUPTK':'NIP')}. ${esc(v)}`}
  function signatureSpace(data,alt){return data?`<div class="space signature-image-wrap"><img class="signature-image" ¶»§q«^