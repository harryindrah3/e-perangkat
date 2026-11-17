(()=>{
  'use strict';

  const D=window.EPERANGKAT_DATA||{};
  const ORDER_KEY='eperangkat.bahasa-arab.fased.v1.orders';
  const VIEW_KEY='eperangkat.bahasa-arab.fased.v1.view';
  const GRADE_KEY='eperangkat.bahasa-arab.fased.v1.grade';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gradeNumber={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
  let currentSemester=localStorage.getItem('eperangkat.bahasa-arab.fased.v1.analysis.semester')||'1';
  let draftOrder=null;
  let recalcTimer=null;

  function getStore(){
    try{return JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}')}
    catch(_){return {activeId:'',orders:[]}}
  }
  function setStore(store){localStorage.setItem(ORDER_KEY,JSON.stringify(store))}
  function activeOrder(store=getStore()){
    return store.orders?.find(o=>o.id===store.activeId)||store.orders?.[0]||null;
  }
  function snapshot(order){const x=clone(order);delete x.history;return x}
  function addHistory(order,action,detail,before){
    order.history=Array.isArray(order.history)?order.history:[];
    order.history.unshift({
      id:`h-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      time:new Date().toISOString(),action,detail,snapshot:before||null
    });
    order.histo¶»§q«^