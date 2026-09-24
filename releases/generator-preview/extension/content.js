'use strict';
(() => {
  if (!location.hostname.startsWith('genarator-e-perangkat')) return;
  const CHANNEL='genarator-e-perangkat-v1';
  window.addEventListener('message', event => {
    if (event.source!==window || event.origin!==location.origin) return;
    const m=event.data;
    if (!m || m.channel!==CHANNEL || m.direction!=='request' || !m.id) return;
    chrome.runtime.sendMessage({type:'GENERATOR_REQUEST',id:m.id,action:m.action,payload:m.payload||{}}, response => {
      const err=chrome.runtime.lastError?.message;
      window.postMessage({channel:CHANNEL,direction:'response',id:m.id,...(err?{error:err}:(response||{error:'Ekstensi tidak merespons.'}))},location.origin);
    });
  });
  chrome.runtime.onMessage.addListener(message => {
    if (!message || message.type!=='GENERATOR_PROGRESS') return;
    window.postMessage({channel:CHANNEL,direction:'progress',id:message.id,message:message.message||''},location.origin);
  });
})();
