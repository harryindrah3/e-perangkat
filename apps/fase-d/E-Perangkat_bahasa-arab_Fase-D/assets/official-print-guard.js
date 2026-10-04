(()=>{'use strict';
const root=document.getElementById('printRoot');
if(!root)return;

const replacements=[
  [/KURIKULUM MERDEKA\s*·\s*PEMBELAJARAN MENDALAM/gi,'KURIKULUM BERBASIS CINTA · KEMENTERIAN AGAMA'],
  [/E-?PERANGKAT PEMBELAJARAN/gi,'PERANGKAT PEMBELAJARAN'],
  [/Modul Ajar Deep Learning/gi,'Modul Ajar Kurikulum Berbasis Cinta'],
  [/MODUL AJAR DEEP LEARNING/g,'MODUL AJAR KURIKULUM BERBASIS CINTA'],
  [/BAHAN AJAR BAHASA INGGRIS/gi,'BAHAN AJAR BAHASA ARAB'],
  [/kalender pemesan/gi,'kalender pendidikan satuan pendidikan'],
  [/berdasarkan\s+(?:permintaan\s+)?(?:customer|pemesan)/gi,'berdasarkan data satuan pendidikan'],
  [/sesuai\s+permintaan\s+(?:customer|pemesan)/gi,'sesuai data satuan pendidikan'],
  [/berdasarkan\s+pesanan/gi,'berdasarkan data satuan pendidikan'],
  [/\balokasi rancangan preview\s*;?\s*validasi final sebelum production\b/gi,'alokasi pembelajaran'],
  [/\brancangan preview\b/gi,'rancangan pembelajaran'],
  [/\balokasi preview\b/gi,'alokasi pembelajaran'],
  [/\buntuk pengujian fitur dan wajib divalidasi sebelum production\b/gi,'sesuai ketentuan satuan pendidikan'],
  [/\bvalidasi final sebelum production\b/gi,''],
  [/\bsebelum production\b/gi,'sesuai ketentuan satuan pendidikan'],
  [/\bpada preview\b/gi,'pada perangkat ini'],
  [/\bdokumen pratinjau\b/gi,'dokumen'],
  [/\bcustomer\b/gi,'satuan pendidikan'],
  [/\bpemesan\b/gi,'satuan pendidikan'],
  [/\bpesanan\b/gi,'data perangkat'],
  [/\bproduction\b/gi,''],
  [/\bpreview\b/gi,'']
];

const forbidden=/\b(?:customer|pemesan|pesanan|production|preview)\b|berdasarkan\s+permintaan|validasi\s+final|pengujian\s+fitur|dokumen\s+pratinjau/gi;
let busy=false;

function cleanString(value){
  let out=String(value??'');
  for(const [pattern,replacement] of replacements)out=out.replace(pattern,replacement);
  return out.replace(/[ \t]{2,}/g,' ').replace(/\s+([,.;:])/g,'$1').trim();
}

function sanitize(){
  if(busy)return;
  busy=true;
  try{
    root.querySelectorAll('.payment-watermark').forEach(mark=>{
      const strong=mark.querySelector('strong');
      const status=cleanString(strong?.textContent||'');
      mark.replaceChildren();
      if(status){
        const s=document.createElement('strong');
        s.textContent=status;
        mark.appendChild(s);
      }else{
        mark.remove();
      }
    });

    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const before=node.nodeValue||'';
      const after=cleanString(before);
      if(after!==before)node.nodeValue=after;
    }

    root.querySelectorAll('[title],[aria-label],[alt]').forEach(el=>{
      for(const attr of ['title','aria-label','alt']){
        if(el.hasAttribute(attr))el.setAttribute(attr,cleanString(el.getAttribute(attr)));
      }
    });

    const leaked=(root.textContent||'').match(forbidden);
    document.body.dataset.officialPrint=leaked?'failed':'ok';
    const old=document.querySelector('.official-print-warning');
    if(old)old.remove();
    if(leaked){
      const bar=document.querySelector('.preview-bar');
      if(bar){
        const note=document.createElement('span');
        note.className='official-print-warning';
        note.textContent='Cetak diblokir: masih ditemukan teks internal pada dokumen.';
        bar.appendChild(note);
      }
    }
  }finally{busy=false}
}

sanitize();
const observer=new MutationObserver(()=>queueMicrotask(sanitize));
observer.observe(root,{subtree:true,childList:true,characterData:true});
window.addEventListener('beforeprint',sanitize,true);
window.addEventListener('load',sanitize,{once:true});
window.EPERANGKAT_OFFICIAL_PRINT_GUARD={sanitize};
})();