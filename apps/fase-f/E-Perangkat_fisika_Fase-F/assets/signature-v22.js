(()=>{
  'use strict';
  const PROFILE_KEY='eperangkat.fisika.fasef.v1.profile';
  const ORDER_KEY='eperangkat.fisika.fasef.v1.orders';
  const $=(s,r=document)=>r.querySelector(s);
  const form=$('#profileForm');
  if(!form)return;

  function profile(){
    let cached={};try{cached=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(_){}
    let orderProfile={};
    try{
      const store=JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}');
      const order=(store.orders||[]).find(item=>item.id===store.activeId)||(store.orders||[])[0];
      orderProfile=order?.profile||{};
    }catch(_){}
    return {...orderProfile,...cached};
  }
  function setPreview(kind,data){
    const cap=kind==='teacher'?'Teacher':'Principal';
    const hidden=form.elements[`${kind}Signature`];
    const preview=$(`#quick${cap}SignaturePreview`);
    if(hidden)hidden.value=data||'';
    if(preview){
      preview.classList.toggle('has-image',!!data);
      preview.innerHTML=data?`<img src="${data}" alt="Tanda tangan">`:'Belum ada tanda tangan';
    }
  }
  function load(){
    const p=profile();
    setPreview('teacher',p.teacherSignature||'');
    setPreview('principal',p.principalSignature||'');
  }
  function resize(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/'))return reject(new Error('File bukan gambar.'));
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Gambar tidak dapat dibaca.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Format gambar tidak didukung.'));
        img.onload=()=>{
          let scale=Math.min(1,520/img.width,170/img.height);
          let out='';
          for(const quality of [0.76,0.66,0.56,0.46,0.36]){
            const canvas=document.createElement('canvas');
            canvas.width=Math.max(1,Math.round(img.width*scale));
            canvas.height=Math.max(1,Math.round(img.height*scale));
            const ctx=canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            out=canvas.toDataURL('image/webp',quality);
            if(out.length<=90000)break;
            scale*=0.84;
          }
          resolve(out);
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }
  [
    ['teacher','quickTeacherSignatureFile','quickRemoveTeacherSignature'],
    ['principal','quickPrincipalSignatureFile','quickRemovePrincipalSignature']
  ].forEach(([kind,fileId,removeId])=>{
    const input=$(`#${fileId}`),remove=$(`#${removeId}`);
    input?.addEventListener('change',async()=>{
      const file=input.files&&input.files[0];
      if(!file)return;
      try{setPreview(kind,await resize(file))}
      catch(error){alert(error.message||'Gambar tidak dapat diproses.')}
      input.value='';
    });
    remove?.addEventListener('click',()=>setPreview(kind,''));
  });

  $('#profileBtn')?.addEventListener('click',()=>setTimeout(load,0));
  $('#saveProfile')?.addEventListener('click',()=>{
    const teacherSignature=form.elements.teacherSignature?.value||'';
    const principalSignature=form.elements.principalSignature?.value||'';
    setTimeout(()=>{
      const p={...profile(),teacherSignature,principalSignature};
      try{
        const store=JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}');
        const order=(store.orders||[]).find(o=>o.id===store.activeId)||(store.orders||[])[0];
        if(order){
          order.profile={...(order.profile||{}),...p};
          order.history=Array.isArray(order.history)?order.history.slice(0,30):[];
          order.updatedAt=new Date().toISOString();
          localStorage.setItem(ORDER_KEY,JSON.stringify(store));
        }
      }catch(error){
        if(error?.name==='QuotaExceededError'||/quota/i.test(String(error?.message||''))){
          alert('Tanda tangan belum tersimpan karena ruang browser penuh. Buka Pesanan & Profil, lalu pilih Optimalkan Data atau Bersihkan Data Versi Lama.');
        }
      }
    },0);
  });
  load();
})();
