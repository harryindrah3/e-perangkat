(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA;
  const KEY='eperangkat.bahasa-arab.fased.v1.orders';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=x=>JSON.parse(JSON.stringify(x));
  const now=()=>new Date().toISOString();
  const formatDate=s=>new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(s));
  const rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
  const app=$('#app');
  let selectedOrderId=null;
  let calendarSemester=1;
  let beforeProfileSnapshot=null;

  function normalizeProfile(profile={}){
    const p={...D.defaults,...profile};
    if(!p.address)p.address='';
    if(!p.rombel)p.rombel='';
    if(!p.teacherSignature)p.teacherSignature='';
    if(!p.principalSignature)p.principalSignature='';
    if(!p.dateSemester2)p.dateSemester2='';
    if(!['buol','kemenag','custom'].includes(String(p.logoMode||'')))p.logoMode='buol';
    if(!p.customLogoLeft)p.customLogoLeft='';
    if(!p.customLogoRight)p.customLogoRight='';
    p.customLogoRightEnabled=String(p.customLogoRightEnabled??'1')==='0'?'0':'1';
    if(!Array.isArray(p.teachingSchedule))p.teachingSchedule=clone(D.defaults.teachingSchedule||[]);
    if(!p.teacherRole)p.teacherRole='Guru';
    if(!p.teacherIdType¶»§q«^