(function(){
'use strict';
const UP='https://e-perangkat-online-a-42zr3swyv-harryindrah3-6239s-projects.vercel.app/identity-fix.js?v=20260905-generator-stable';
const s=document.createElement('script');s.src=UP;s.async=false;document.head.appendChild(s);
if(/\/print\.html$/i.test(location.pathname))return;
const $=id=>document.getElementById(id),MAX=2,LIMIT=15*1024*1024,TARGET=300*1024;
function key(){const m=location.pathname.match(/\/fase-([a-f])\/E-Perangkat_([^/]+)_Fase-[A-F]/i);return m?`eperangkat.${m[2].toLowerCase()}.fase${m[1].toLowerCase()}.v1.orders`:''}
function J(v,d){try{return JSON.parse(v||'')||d}catch(_){return d}}
function ctx(){const k=key();if(!k)return null;const st=J(localStorage.getItem(k),{activeId:'',orders:[]}),num=String($('ordNumber')?.value||'').trim(),os=Array.isArray(st.orders)?st.orders:[],o=os.find(x=>num&&String(x.number||'').trim()===num)||os.find(x=>x.id===st.activeId)||os[0]||null;return{k,st,o}}
function sk(){const c=ctx();if(!c?.k)return'';return`${c.k.replace(/\.orders$/,'')}.uploaded-schedule.${String(c.o?.id||'profile')}`}
function state(){const k=sk(),v=k?J(localStorage.getItem(k),{}):{};return{include:v.include!==false,semester1:v.semester1||null,semester2:v.semester2||null}}
function save(fn){const k=sk();if(!k)return false;const v=J(localStorage.getItem(k),{version:1,include:true});fn(v);v.version=1;v.updatedAt=new Date().toISOString();try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){alert('Penyimpanan jadwal pen¶»§q«^