(function(){
'use strict';
if(window.__epPromesRuntimeSchoolStartV3)return;
window.__epPromesRuntimeSchoolStartV3=true;
const DAYS={MINGGU:0,SENIN:1,SELASA:2,RABU:3,KAMIS:4,JUMAT:5,SABTU:6};
const MONTH=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function J(v,d){try{return JSON.parse(v||'')||d}catch(_){return d}}
function prefix(){
  const m=location.pathname.match(/\/apps\/fase-([a-f])\/E-Perangkat_(.+?)_Fase-[A-F](?:\/|$)/i);
  return m?`eperangkat.${decodeURIComponent(m[2]).toLowerCase()}.fase${m[1].toLowerCase()}.v1`:'';
}
const PRE=prefix();
function store(){return PRE?J(localStorage.getItem(PRE+'.orders'),{activeId:'',orders:[]}):{activeId:'',orders:[]}}
function order(){
  const s=store(),n=String($('#ordNumber')?.value||'').trim(),qid=new URLSearchParams(location.search).get('order')||'';
  return (s.orders||[]).find(o=>qid&&o.id===qid)||(s.orders||[]).find(o=>n&&String(o.number||'')===n)||(s.orders||[]).find(o=>o.id===s.activeId)||(s.orders||[])[0]||null;
}
function prof(){return {...(order()?.profile||{}),...J(PRE&&localStorage.getItem(PRE+'.profile'),{})}}
function grade(){return String(new URLSearchParams(location.search).get('grade')||(PRE&&localStorage.getItem(PRE+'.grade'))||order()?.grade||'V').toUpperCase()}
function ck(){return PRE+'.promes-date.'+String(order()?.id||'profile')}
function sharedKey(){r¶»§q«^