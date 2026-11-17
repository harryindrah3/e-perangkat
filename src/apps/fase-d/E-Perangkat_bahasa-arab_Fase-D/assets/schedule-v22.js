(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const PROFILE_KEY='eperangkat.bahasa-arab.fased.v1.profile';
  const ORDER_KEY='eperangkat.bahasa-arab.fased.v1.orders';
  const VIEW_KEY='eperangkat.bahasa-arab.fased.v1.view';
  const GRADE_KEY='eperangkat.bahasa-arab.fased.v1.grade';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeSemester='1';

  function clone(value){return JSON.parse(JSON.stringify(value))}
  function getStore(){
    try{return JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}')}
    catch(_){return {activeId:'',orders:[]}}
  }
  function activeOrder(store=getStore()){
    return (store.orders||[]).find(o=>o.id===store.activeId)||(store.orders||[])[0]||null;
  }
  function profile(){
    const store=getStore(),order=activeOrder(store);
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(_){}
    return {...(D.defaults||{}),...(order?.profile||{}),...saved};
  }
  function classLabel(value=''){
    const raw=String(value||'').trim().toUpperCase().replace(/\s+/g,' ');
    if(!raw)return '';
    return raw.replace(/^([IVX]+)\s*([A-Z])$/,'$1 $2');
  }
  function scheduleRows(p){
    const rows=Array.isArray(p.teachingSchedule)?clone(p.teachingSchedule):clone(D.defaults?.teachingSchedule||[]);
    return r¶»§q«^