(function(){
'use strict';
const ORIGINAL_CALENDAR='https://e-perangkat-online-a-afanit1w0-harryindrah3-6239s-projects.vercel.app/calendar-year.js?v=20260914-1';
const match=location.pathname.match(/\/apps\/fase-([a-f])\/E-Perangkat_(.+?)_Fase-([A-F])/i);
if(!match)return;
const subject=decodeURIComponent(match[2]||'').toLowerCase();
const phase=String(match[3]||match[1]||'').toLowerCase();
const KEY=`eperangkat.${subject}.fase${phase}.v1.orders`;
const clamp=v=>{if(v===''||v==null)return null;const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):null};
function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'{"activeId":"","orders":[]}');s.orders=Array.isArray(s.orders)?s.orders:[];return s}catch(_){return{activeId:'',orders:[]}}}
function current(s=read()){const n=document.getElementById('ordNumber')?.value?.trim();return(n&&s.orders.find(o=>String(o.number||'').trim()===n))||s.orders.find(o=>o.id===s.activeId)||s.orders[0]||null}
function resolve(o){const d=clamp(o?.kktp);if(d!==null)return d;const set=o?.analysis?.settings||{};const g=clamp(set.thresholds?.[o?.grade]);if(g!==null)return g;return clamp(set.threshold)??75}
function sync(o){if(!o||typeof o!=='object')return;o.kktp=resolve(o);o.analysis=o.analysis&&typeof o.analysis==='object'?o.analysis:{};o.analysis.settings=o.analysis.settings&&typeof o.analysis.settings==='object'?o.analysis.settings:{};o.analysis.settings.threshold=o.kktp;o.analysis.settings.thresholds=o.analysis.settings.thresholds&&typeof o.analysis.settings.thresholds==='object'?o.analysis.settings.thresholds:{};if(o.grade)o.analysis.settings.thresholds[o.grade]=o.kktp}
function write(s){for(const o of s.orders||[])sync(o);localStorage.setItem(KEY,JSON.stringify(s))}
function saveKktp(){const input=document.getElementById('ordKktp');if(!input)return false;const value=clamp(input.value),s=read(),o=current(s);if(value===null||!o)return false;const before=resolve(o);if(before===value&&clamp(o.kktp)===value)return false;o.kktp=value;sync(o);o.history=Array.isArray(o.history)?o.history:[];o.history.unshift({id:'h-kktp-'+Date.now(),time:new Date().toISOString(),action:'KKTP pesanan diperbarui',detail:`KKTP: “${before}” → “${value}”. Nilai ini digunakan otomatis pada menu Analisis Nilai.`,snapshot:null});o.history=o.history.slice(0,30);o.updatedAt=new Date().toISOString();write(s);return true}
function installKktp(){
 const grade=document.getElementById('ordGrade');
 if(grade){const s=read(),o=current(s);if(o){sync(o);let input=document.getElementById('ordKktp');if(!input){const label=document.createElement('label');label.id='epOrderKktpLabel';label.innerHTML='KKTP<input id="ordKktp" type="number" min="0" max="100" step="1"><small style="display:block;margin-top:4px;color:#64748b;line-height:1.3">Dipakai otomatis pada Analisis Nilai.</small>';const calendarLabel=document.getElementById('epCalendarYear')?.closest('label');(calendarLabel||grade.closest('label'))?.insertAdjacentElement('afterend',label);input=label.querySelector('input')}input.value=String(resolve(o));
  const save=document.getElementById('saveOrderBtn');if(save&&save.dataset.epKktpCombined!=='1'){save.dataset.epKktpCombined='1';const old=save.onclick;save.onclick=function(e){const changed=saveKktp();let result;const nativeAlert=window.alert;if(changed)window.alert=function(msg){if(/Tidak ada perubahan untuk disimpan/i.test(String(msg||'')))return;return nativeAlert.apply(this,arguments)};try{result=typeof old==='function'?old.call(this,e):undefined}finally{window.alert=nativeAlert}if(changed)setTimeout(()=>document.querySelector('.order-list-item.active[data-select-order]')?.click(),0);return result}}
 }}
 const threshold=document.getElementById('analysisThreshold');if(threshold){const o=current();if(o){const v=resolve(o);threshold.value=String(v);threshold.readOnly=true;threshold.setAttribute('aria-readonly','true');threshold.title='KKTP mengikuti Pesanan & Riwayat';const label=threshold.closest('label');if(label&&!label.querySelector('.ep-kktp-analysis-note')){const note=document.createElement('small');note.className='ep-kktp-analysis-note';note.textContent='Otomatis dari Pesanan & Riwayat.';note.style.cssText='display:block;margin-top:4px;color:#64748b;line-height:1.3';label.appendChild(note)}const badge=document.querySelector('.analysis-kktp-badge b');if(badge)badge.textContent=String(v)}}
}
function startKktp(){installKktp();let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(installKktp,30)}).observe(document.documentElement,{childList:true,subtree:true});let count=0;const timer=setInterval(()=>{installKktp();if(++count>=20)clearInterval(timer)},500);window.addEventListener('storage',e=>{if(e.key===KEY)setTimeout(installKktp,0)})}
function loadCalendarThenStart(){if(window.EPCalendarYear){startKktp();return}const s=document.createElement('script');s.src=ORIGINAL_CALENDAR;s.async=false;s.onload=startKktp;s.onerror=startKktp;(document.head||document.documentElement).appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadCalendarThenStart,{once:true});else loadCalendarThenStart();
})();
