(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search),section=params.get('section')||'all',semester=params.get('semester')||'both',orderId=params.get('order')||'',wm=params.get('wm')||'auto';
  const STORE='eperangkat.bahasa-arab.fased.v1.orders';
  function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{"activeId":"","orders":[]}')}catch(_){return {activeId:'',orders:[]}}}
  function setStore(s){localStorage.setItem(STORE,JSON.stringify(s))}
  const store=getStore(),order=store.orders.find(o=>o.id===orderId)||store.orders.find(o=>o.id===store.activeId)||store.orders[0]||{};
  const profile={...(window.EPERANGKAT_DATA?.defaults||{}),...(order.profile||{})};
  const teacherRole=profile.teacherRole||'Guru';
  const grade=params.get('grade')||order.grade||'VII';
  function classLabel(g,r=''){g=String(g||'VII').trim().toUpperCase();const raw=String(r||'').trim().toUpperCase().replace(/\s+/g,' ');if(!raw)return g;const compact=raw.replace(/\s+/g,'');if(compact.startsWith(g)){const suffix=compact.slice(g.length);return suffix?`${g} ${suffix}`:g}return `${g} ${compact}`}
  const className=classLabel(grade,profile.rombel);
  const status=order.paymentStatus||'belum_lunas';
  const watermarkEnabled=wm==='1'||(wm==='auto'&&status!==¶»§q«^