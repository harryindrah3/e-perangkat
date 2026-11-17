(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  const section=params.get('section')||'all';
  if(section!=='all'&&section!=='analysis')return;
  const semesterParam=params.get('semester')||'both';
  const STORE='eperangkat.bahasa-arab.fased.v1.orders';
  const gradeNumber={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  const store=getStore(),orderId=params.get('order')||'',order=store.orders?.find(o=>o.id===orderId)||store.orders?.find(o=>o.id===store.activeId)||store.orders?.[0]||{};
  const grade=params.get('grade')||order.grade||localStorage.getItem('eperangkat.bahasa-arab.fased.v1.grade')||'VII';
  const profile={...(D.defaults||{}),...(order.profile||{})};
  function classLabel(g,r=''){g=String(g||'VII').trim().toUpperCase();const raw=String(r||'').trim().toUpperCase().replace(/\s+/g,' ');if(!raw)return g;const compact=raw.replace(/\s+/g,'');if(compact.startsWith(g)){const suffix=compact.slice(g.length);return suffix?`${g} ${suffix}`:g}return `${g} ${compact}`}
  const className=classLabel(grade,profile.rombel);
  const teacherRole=profile.teacherRole||'Guru';
  const students=¶»§q«^