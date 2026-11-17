(()=>{'use strict';
  if(!/\/apps\/fase-[a-f]\//i.test(location.pathname))return;

  const MARK='data-ep-supervision-detail';
  const D=window.EPERANGKAT_DATA||{};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const list=items=>`<ul class="ep-supervision-list">${(items||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;

  function minutesFrom(text=''){
    const minuteMatch=String(text).match(/(\d+)\s*menit/i);
    if(minuteMatch)return Number(minuteMatch[1]);
    const jpMatch=String(text).match(/(\d+)\s*JP/i);
    return jpMatch?Number(jpMatch[1])*35:70;
  }

  function timeParts(text=''){
    const total=Math.max(1,minutesFrom(text));
    const opening=total<=35?5:10;
    const closing=total<=35?5:10;
    return{total,opening,core:Math.max(1,total-opening-closing),closing};
  }

  const titleCase=value=>String(value||'').toLowerCase().replace(/(^|\s)([a-zÃ -Ã¿])/g,(_,space,char)=>space+char.toUpperCase()).replace(/\b(Dan|Yang|Di|Ke|Dari|Untuk|Pada|Dalam|Atau)\b/g,word=>word.toLowerCase());
  const cleanSentence=value=>String(value||'').trim().replace(/\s+/g,' ').replace(/\.,/g,',').replace(/\.+$/,'');

  function meetingFocus(meeting){
    const parts=String(meeting?.topic||'').split(':');
    return titleCase(parts.length>1?parts.slice(1).join(':').trim():meeting?.topic||'materi pertemuan');
  }

  function meetingStage(meeting){
    return String(meeting?.topic||'').spl¶»§q«^