(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA;
  const KEY='eperangkat.matematika.fasea.v1.orders';
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
    if(!p.teacherIdType)p.teacherIdType=String(p.teacherId||'').toUpperCase().includes('NUPTK')?'NUPTK':'NIP';
    if(!p.principalIdType)p.principalIdType=String(p.principalId||'').toUpperCase().includes('NUPTK')?'NUPTK':'NIP';
    return p;
  }
  function logoConfig(profile={}){
    const p=normalizeProfile(profile),mode=p.logoMode||'buol';
    if(mode==='kemenag')return {mode,left:D.meta.logoKemenag||'assets/logos/logo-kemenag.png',right:'',leftAlt:'Logo Kementerian Agama',rightAlt:''};
    if(mode==='custom')return {mode,left:p.customLogoLeft||'',right:p.customLogoRightEnabled==='1'?(p.customLogoRight||''):'',leftAlt:'Logo instansi',rightAlt:'Logo pendamping'};
    return {mode:'buol',left:'assets/logos/logo-buol.png',right:'assets/logos/tut-wuri-handayani.png',leftAlt:'Logo Kabupaten Buol',rightAlt:'Logo Tut Wuri Handayani'};
  }
  function logoModeOptions(value='buol'){
    const v=['buol','kemenag','custom'].includes(String(value))?String(value):'buol';
    return `<option value="buol" ${v==='buol'?'selected':''}>Kabupaten Buol + Tut Wuri Handayani</option><option value="kemenag" ${v==='kemenag'?'selected':''}>Kementerian Agama (logo tunggal)</option><option value="custom" ${v==='custom'?'selected':''}>Unggah logo sendiri</option>`;
  }
  function calendarLetterhead(profile={}){
    const p=normalizeProfile(profile),logos=logoConfig(p);
    const image=(src,side,alt)=>src?`<img class="kop-logo kop-logo-${side}" src="${esc(src)}" alt="${esc(alt)}">`:`<span class="kop-logo-spacer" aria-hidden="true"></span>`;
    return `<div class="calendar-letterhead letterhead-with-logos logo-mode-${logos.mode}">${image(logos.left,'left',logos.leftAlt)}<div class="letterhead-text"><b>${esc(p.government)}</b><b>${esc(p.department)}</b><strong>${esc(p.school)}</strong><span>${esc(p.address||p.region||'')}</span></div>${image(logos.right,'right',logos.rightAlt)}</div>`;
  }
  function normalizeOrder(order){
    order.profile=normalizeProfile(order.profile||{});
    order.school=order.profile.school||order.school||'';
    order.students=Array.isArray(order.students)?order.students:[];
    order.history=Array.isArray(order.history)?order.history:[];
    return order;
  }
  function isQuotaError(error){
    return !!error&&(error.name==='QuotaExceededError'||error.name==='NS_ERROR_DOM_QUOTA_REACHED'||error.code===22||/quota/i.test(String(error.message||'')));
  }
  function sanitizeHistoryText(value=''){
    return String(value||'')
      .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g,'[gambar tanda tangan]')
      .replace(/[A-Za-z0-9+/=]{1000,}/g,'[data besar disederhanakan]')
      .slice(0,900);
  }
  function lightProfile(profile={}){
    const copy={...profile};
    delete copy.teacherSignature;
    delete copy.principalSignature;
    return copy;
  }
  function compactStore(store,level=1){
    const result=clone(store||{activeId:'',orders:[]});
    const historyLimit=level>=2?10:30;
    const snapshotLimit=level>=2?0:5;
    result.orders=(Array.isArray(result.orders)?result.orders:[]).map(order=>{
      const clean=normalizeOrder(order);
      clean.history=(Array.isArray(clean.history)?clean.history:[])
        .slice(0,historyLimit)
        .map((entry,index)=>({
          ...entry,
          detail:sanitizeHistoryText(entry.detail),
          snapshot:index<snapshotLimit&&entry.snapshot?entry.snapshot:null
        }));
      return clean;
    });
    if(!result.orders.some(order=>order.id===result.activeId))result.activeId=result.orders[0]?.id||'';
    return result;
  }
  function storageBytes(){
    let total=0,current=0,oldMath=0;
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index)||'';
      const value=localStorage.getItem(key)||'';
      const size=(key.length+value.length)*2;
      total+=size;
      if(key.startsWith('eperangkat.matematika.fasea.v1.'))current+=size;
      else if(key.startsWith('eperangkat.matematika.fasea.v1.legacy.')&&!key.startsWith('eperangkat.matematika.fasea.v1.'))oldMath+=size;
    }
    return {total,current,oldMath};
  }
  function formatBytes(bytes){
    if(bytes<1024)return `${bytes} B`;
    if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1024/1024).toFixed(2)} MB`;
  }
  function obsoleteMathKeys(){
    const keys=[];
    for(let index=0;index<localStorage.length;index++){
      const key=localStorage.key(index)||'';
      if(key.startsWith('eperangkat.matematika.fasea.v1.legacy.')&&!key.startsWith('eperangkat.matematika.fasea.v1.'))keys.push(key);
    }
    return keys;
  }
  function cleanupOldMathStorage(){
    const keys=obsoleteMathKeys();
    keys.forEach(key=>localStorage.removeItem(key));
    return keys.length;
  }
  function storageStatusHtml(){
    const size=storageBytes(),count=obsoleteMathKeys().length;
    return `<div class="storage-status-panel"><div><b>Penggunaan penyimpanan browser</b><span>Total ${formatBytes(size.total)} · V23.1 ${formatBytes(size.current)} · Matematika versi lama ${formatBytes(size.oldMath)}</span></div><div><b>${count}</b><span>kunci data Matematika versi lama</span></div></div>`;
  }
  function writeStore(store){
    localStorage.setItem(KEY,JSON.stringify(store));
  }
  function setStore(store){
    const normal=compactStore(store,1);
    try{
      writeStore(normal);
      return normal;
    }catch(error){
      if(!isQuotaError(error))throw error;
    }
    const lean=compactStore(store,2);
    try{
      writeStore(lean);
      return lean;
    }catch(error){
      if(!isQuotaError(error))throw error;
    }
    const oldKeys=obsoleteMathKeys();
    if(oldKeys.length&&confirm(`Penyimpanan browser penuh. Ditemukan ${oldKeys.length} data Matematika dari versi lama. Hapus data browser versi lama agar penyimpanan tersedia? File aplikasi lama tetap aman di komputer.`)){
      cleanupOldMathStorage();
      try{
        writeStore(lean);
        return lean;
      }catch(error){
        if(!isQuotaError(error))throw error;
      }
    }
    const storageError=new Error('Penyimpanan browser penuh. Gunakan tombol “Bersihkan Data Matematika Lama”, lalu ulangi impor.');
    storageError.name='StorageQuotaError';
    throw storageError;
  }
  function loadImage(dataUrl){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error('Gambar tanda tangan tidak dapat dibaca.'));
      image.src=dataUrl;
    });
  }
  async function compressSignatureData(dataUrl,targetLength=90000){
    if(!String(dataUrl||'').startsWith('data:image/')||dataUrl.length<=targetLength)return dataUrl||'';
    const image=await loadImage(dataUrl);
    let scale=Math.min(1,520/image.width,170/image.height);
    let output=dataUrl;
    for(const quality of [0.76,0.66,0.56,0.46,0.36]){
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.width*scale));
      canvas.height=Math.max(1,Math.round(image.height*scale));
      const context=canvas.getContext('2d');
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(image,0,0,canvas.width,canvas.height);
      output=canvas.toDataURL('image/webp',quality);
      if(output.length<=targetLength)return output;
      scale*=0.84;
    }
    return output;
  }
  async function optimizeStoreImages(store,aggressive=false){
    const result=compactStore(store,aggressive?2:1);
    const targetLength=aggressive?65000:90000;
    for(const order of result.orders){
      if(order.profile){
        order.profile.teacherSignature=await compressSignatureData(order.profile.teacherSignature,targetLength);
        order.profile.principalSignature=await compressSignatureData(order.profile.principalSignature,targetLength);
        order.profile.customLogoLeft=await compressSignatureData(order.profile.customLogoLeft,targetLength);
        order.profile.customLogoRight=await compressSignatureData(order.profile.customLogoRight,targetLength);
      }
    }
    return result;
  }
  function getStore(){
    try{
      const store=JSON.parse(localStorage.getItem(KEY)||'{"activeId":"","orders":[]}');
      store.orders=Array.isArray(store.orders)?store.orders.map(normalizeOrder):[];
      return store;
    }catch(_){return {activeId:'',orders:[]}}
  }
  function idTypeOptions(value){
    const v=String(value||'NIP').toUpperCase();
    return `<option value="NIP" ${v==='NIP'?'selected':''}>NIP</option><option value="NUPTK" ${v==='NUPTK'?'selected':''}>NUPTK</option><option value="NONE" ${v==='NONE'?'selected':''}>Tanpa Nomor</option>`;
  }
  function activeOrder(store=getStore()){return store.orders.find(o=>o.id===store.activeId)||store.orders[0]}
  function snapshot(order){
    const copy=clone(order);
    delete copy.history;
    if(copy.profile){
      delete copy.profile.teacherSignature;
      delete copy.profile.principalSignature;
      delete copy.profile.customLogoLeft;
      delete copy.profile.customLogoRight;
    }
    return copy;
  }
  function history(order,action,detail,before=null){
    order.history=Array.isArray(order.history)?order.history:[];
    order.history.unshift({
      id:`h-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      time:now(),
      action,
      detail:sanitizeHistoryText(detail),
      snapshot:before
    });
    order.history=order.history.slice(0,30).map((entry,index)=>({
      ...entry,
      detail:sanitizeHistoryText(entry.detail),
      snapshot:index<5?entry.snapshot:null
    }));
    order.updatedAt=now();
  }
  function saveAndSync(store,order,{reload=false}={}){
    const saved=setStore(store);
    const active=saved.orders.find(item=>item.id===saved.activeId)||saved.orders[0];
    if(active){
      localStorage.setItem('eperangkat.matematika.fasea.v1.profile',JSON.stringify(lightProfile(active.profile||D.defaults)));
      localStorage.setItem('eperangkat.matematika.fasea.v1.students',JSON.stringify(active.students||[]));
      localStorage.setItem('eperangkat.matematika.fasea.v1.grade',active.grade||'I');
    }
    refreshOrderBar();
    if(reload) location.reload();
  }
  function statusLabel(status){return status==='lunas'?'LUNAS':status==='dp'?'DP / SEBAGIAN':'BELUM LUNAS'}
  function statusClass(status){return status==='lunas'?'paid':status==='dp'?'partial':'unpaid'}

  function classLabel(grade,rombel=''){
    const g=String(grade||'I').trim().toUpperCase();
    const raw=String(rombel||'').trim().toUpperCase().replace(/\s+/g,' ');
    if(!raw)return g;
    const compact=raw.replace(/\s+/g,'');
    if(compact.startsWith(g)){
      const suffix=compact.slice(g.length);
      return suffix?`${g} ${suffix}`:g;
    }
    return `${g} ${compact}`;
  }
  function rombelCode(value=''){
    const raw=String(value||'').trim().toUpperCase().replace(/[\s-]+/g,'');
    if(!raw)return '';
    if(raw.endsWith('A'))return 'A';
    if(raw.endsWith('B'))return 'B';
    return '';
  }
  function rombelOptions(value=''){
    const code=rombelCode(value);
    return `<option value="" ${!code?'selected':''}>Kosong saja / tanpa rombel</option><option value="A" ${code==='A'?'selected':''}>Rombel A</option><option value="B" ${code==='B'?'selected':''}>Rombel B</option>`;
  }
  function pageHead(title,description,actions=''){
    const store=getStore(),order=activeOrder(store),grade=order?.grade||localStorage.getItem('eperangkat.matematika.fasea.v1.grade')||'I';
    const kelas=classLabel(grade,order?.profile?.rombel);
    return `<div class="page-head"><div><span class="eyebrow">Kelas ${kelas} · Fase A</span><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="actions">${actions}</div></div>`;
  }
  function newNumber(store){
    const d=new Date(),stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const count=store.orders.filter(o=>String(o.number||'').includes(stamp)).length+1;
    return `PSN-${stamp}-${String(count).padStart(3,'0')}`;
  }
  function createOrder(store){
    const id=`order-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const profile=normalizeProfile({...D.defaults,school:'Nama Satuan Pendidikan',teacher:'',teacherId:'',principal:'',principalId:''});
    const order={id,number:newNumber(store),customer:'',whatsapp:'',grade:'I',school:profile.school,total:0,paid:0,paymentStatus:'belum_lunas',watermark:'BELUM LUNAS',notes:'',createdAt:now(),updatedAt:now(),profile,students:[],calendar:defaultCalendar(),history:[]};
    history(order,'Pesanan dibuat','Pesanan baru dibuat.',null);
    store.orders.unshift(order);store.activeId=id;selectedOrderId=id;saveAndSync(store,order);return order;
  }
  function refreshOrderBar(){
    const top=$('.topbar');if(!top)return;
    let bar=$('#activeOrderBar');
    if(!bar){
      bar=document.createElement('div');bar.id='activeOrderBar';bar.className='active-order-bar';
      const school=$('.school');school?.after(bar);
    }
    const store=getStore(),active=activeOrder(store);
    if(!active){bar.innerHTML='';return}
    bar.innerHTML=`<label>Pesanan aktif<select id="activeOrderSelect">${store.orders.map(o=>`<option value="${o.id}" ${o.id===active.id?'selected':''}>${esc(o.number)} · ${esc(o.customer||o.profile?.school||'Tanpa nama')}</option>`).join('')}</select></label><span class="payment-badge ${statusClass(active.paymentStatus)}">${statusLabel(active.paymentStatus)}</span>`;
    $('#activeOrderSelect').onchange=e=>{
      const s=getStore(),old=activeOrder(s),next=s.orders.find(o=>o.id===e.target.value);if(!next)return;
      if(old)history(old,'Pesanan dinonaktifkan',`Beralih ke ${next.number}.`,snapshot(old));
      s.activeId=next.id;history(next,'Pesanan diaktifkan','Pesanan dipilih sebagai pesanan aktif.',snapshot(next));
      saveAndSync(s,next,{reload:true});
    };
  }

  function orderListHtml(store,selected){
    return store.orders.map(o=>`<button class="order-list-item ${o.id===selected?'active':''}" data-select-order="${o.id}"><div><b>${esc(o.number)}</b><span>${esc(o.customer||o.profile?.school||'Belum diberi nama')}</span></div><span class="payment-badge ${statusClass(o.paymentStatus)}">${statusLabel(o.paymentStatus)}</span></button>`).join('');
  }
  function renderOrders(){
    const store=getStore();
    if(!selectedOrderId||!store.orders.some(o=>o.id===selectedOrderId))selectedOrderId=store.activeId||store.orders[0]?.id;
    const o=store.orders.find(x=>x.id===selectedOrderId);
    if(!o)return;
    const p=normalizeProfile(o.profile||{});
    app.innerHTML=pageHead('Pesanan, Profil, dan Riwayat Pengeditan','Satu pesanan menyimpan satu profil dokumen, data pemesan, pembayaran, peserta, kalender, serta riwayat perubahan secara terpisah.',`<button class="btn primary" id="newOrderBtn">+ Pesanan Baru</button><button class="btn secondary" id="exportOrdersBtn">Ekspor Backup</button><label class="btn secondary import-label">Impor Backup<input type="file" id="importOrdersInput" accept="application/json"></label><button class="btn secondary" id="optimizeStorageBtn">Optimalkan Data</button><button class="btn danger" id="cleanupOldMathBtn">Bersihkan Data Versi Lama</button>`)+storageStatusHtml()+`
      <div class="orders-layout">
        <aside class="order-list-panel"><div class="panel-title"><b>Daftar Pesanan</b><small>${store.orders.length} pesanan tersimpan</small></div><div class="order-list">${orderListHtml(store,o.id)}</div></aside>
        <section class="order-detail-panel">
          <div class="order-detail-head"><div><span class="eyebrow">DETAIL PESANAN</span><h2>${esc(o.number)}</h2><p>Dibuat ${formatDate(o.createdAt)} · diperbarui ${formatDate(o.updatedAt)}</p></div><span class="payment-badge large ${statusClass(o.paymentStatus)}">${statusLabel(o.paymentStatus)}</span></div>
          <section class="order-block">
            <div class="order-block-head"><div><span class="eyebrow">DATA PEMESAN & PEMBAYARAN</span><h3>Informasi Pesanan</h3></div><small>Data ini hanya berlaku untuk pesanan ${esc(o.number)}</small></div>
            <div class="order-form-grid">
              <label>Nomor Pesanan<input id="ordNumber" value="${esc(o.number)}"></label>
              <label>Nama Pemesan<input id="ordCustomer" value="${esc(o.customer)}" placeholder="Nama pemesan"></label>
              <label>Nomor WhatsApp<input id="ordWhatsapp" value="${esc(o.whatsapp)}" placeholder="08xxxxxxxxxx"></label>
              <label>Kelas<select id="ordGrade"><option selected>X</option></select></label>
              <label>Status Pembayaran<select id="ordStatus"><option value="belum_lunas" ${o.paymentStatus==='belum_lunas'?'selected':''}>Belum Lunas</option><option value="dp" ${o.paymentStatus==='dp'?'selected':''}>DP / Sebagian</option><option value="lunas" ${o.paymentStatus==='lunas'?'selected':''}>Lunas</option></select></label>
              <label>Total Harga<input id="ordTotal" type="number" min="0" value="${Number(o.total)||0}"></label>
              <label>Sudah Dibayar<input id="ordPaid" type="number" min="0" value="${Number(o.paid)||0}"></label>
              <label class="span-2">Teks Watermark<input id="ordWatermark" value="${esc(o.watermark||'BELUM LUNAS')}"></label>
              <label class="span-2">Catatan Pesanan<textarea id="ordNotes" rows="3">${esc(o.notes||'')}</textarea></label>
            </div>
          </section>
          <section class="order-block order-profile-card" id="orderProfileCard">
            <div class="order-block-head"><div><span class="eyebrow">PROFIL DOKUMEN PESANAN</span><h3>Identitas Satuan Pendidikan dan Penanda Tangan</h3></div><span class="profile-order-chip">1 pesanan · 1 profil</span></div>
            <p class="order-block-note">Isi profil langsung di sini. Saat membuat atau memilih pesanan lain, formulir akan otomatis menampilkan profil milik pesanan tersebut.</p>
            <div class="order-form-grid profile-grid">
              <label>Pemerintah/Instansi<input id="profileGovernment" value="${esc(p.government)}"></label>
              <label>Dinas/Unit Pembina<input id="profileDepartment" value="${esc(p.department)}"></label>
              <label>Nama Satuan Pendidikan<input id="profileSchool" value="${esc(p.school)}"></label>
              <label>Program/Jenjang<input id="profileProgram" value="${esc(p.program)}"></label>
              <label>Rombel<select id="profileRombel">${rombelOptions(p.rombel)}</select></label>
              <label class="span-2">Alamat Sekolah<input id="profileAddress" value="${esc(p.address||'')}" placeholder="Jalan, desa/kelurahan, kecamatan, kabupaten/kota, provinsi"></label>
              <label>Peran Pengajar<select id="profileTeacherRole"><option value="Guru" ${p.teacherRole==='Guru'?'selected':''}>Guru</option><option value="Pamong Belajar" ${p.teacherRole==='Pamong Belajar'?'selected':''}>Pamong Belajar</option><option value="Tutor" ${p.teacherRole==='Tutor'?'selected':''}>Tutor</option></select></label>
              <label>Nama Pengajar<input id="profileTeacher" value="${esc(p.teacher)}"></label>
              <label>Jenis Nomor Pengajar<select id="profileTeacherIdType">${idTypeOptions(p.teacherIdType)}</select></label>
              <label>Nomor Identitas Pengajar<input id="profileTeacherId" value="${esc(p.teacherId)}" placeholder="Masukkan nomor sesuai pilihan"></label>
              <label>Nama Kepala Sekolah<input id="profilePrincipal" value="${esc(p.principal)}"></label>
              <label>Jenis Nomor Kepala Sekolah<select id="profilePrincipalIdType">${idTypeOptions(p.principalIdType)}</select></label>
              <label>Nomor Identitas Kepala Sekolah<input id="profilePrincipalId" value="${esc(p.principalId)}" placeholder="Masukkan nomor sesuai pilihan"></label>
              <label>Tahun Pelajaran<input id="profileYear" value="${esc(p.year)}"></label>
              <label>Tempat Penetapan<input id="profilePlace" value="${esc(p.place)}"></label>
              <label>Tanggal Penetapan Semester 1<input id="profileDate" value="${esc(p.date)}" placeholder="Contoh: 20 Juli 2026"></label>
              <label>Tanggal Penetapan Semester 2<input id="profileDateSemester2" value="${esc(p.dateSemester2||'')}" placeholder="Contoh: 21 Juni 2027"></label>
              <label>Wilayah<input id="profileRegion" value="${esc(p.region)}"></label>

              <div class="logo-settings-card span-2">
                <div class="logo-settings-head"><div><b>Logo Kop Dokumen</b><small>Pilih logo bawaan atau unggah logo sendiri agar E-Perangkat dapat digunakan oleh sekolah dan instansi di berbagai daerah.</small></div></div>
                <div class="logo-settings-grid">
                  <label>Jenis Logo<select id="profileLogoMode">${logoModeOptions(p.logoMode)}</select></label>
                  <label id="customRightLogoOption">Logo Kanan<select id="profileCustomLogoRightEnabled"><option value="1" ${p.customLogoRightEnabled==='1'?'selected':''}>Tampilkan jika tersedia</option><option value="0" ${p.customLogoRightEnabled==='0'?'selected':''}>Sembunyikan</option></select></label>
                </div>
                <div class="logo-mode-note" id="logoModeNote"></div>
                <div class="logo-preview-pair">
                  <div><span>Logo kiri/utama</span><div class="logo-preview" id="logoLeftPreview"></div></div>
                  <div><span>Logo kanan/pendamping</span><div class="logo-preview" id="logoRightPreview"></div></div>
                </div>
                <div class="custom-logo-controls" id="customLogoControls">
                  <div class="custom-logo-upload">
                    <input type="hidden" id="profileCustomLogoLeft" value="${esc(p.customLogoLeft||'')}">
                    <b>Logo kiri/utama</b><small>PNG, JPG, atau WEBP. Disarankan latar transparan.</small>
                    <div class="signature-upload-actions"><label class="btn secondary small import-label">Unggah Logo<input type="file" id="customLogoLeftFile" accept="image/png,image/jpeg,image/webp"></label><button type="button" class="btn secondary small" id="removeCustomLogoLeft">Hapus</button></div>
                  </div>
                  <div class="custom-logo-upload">
                    <input type="hidden" id="profileCustomLogoRight" value="${esc(p.customLogoRight||'')}">
                    <b>Logo kanan/pendamping</b><small>Opsional. Dapat disembunyikan melalui pilihan Logo Kanan.</small>
                    <div class="signature-upload-actions"><label class="btn secondary small import-label">Unggah Logo<input type="file" id="customLogoRightFile" accept="image/png,image/jpeg,image/webp"></label><button type="button" class="btn secondary small" id="removeCustomLogoRight">Hapus</button></div>
                  </div>
                </div>
              </div>

              <div class="signature-upload-grid span-2">
                <div class="signature-upload-card">
                  <div><b>Tanda Tangan Pengajar</b><small>PNG, JPG, atau WEBP. Gambar diperkecil otomatis.</small></div>
                  <div class="signature-preview ${p.teacherSignature?'has-image':''}" id="teacherSignaturePreview">${p.teacherSignature?`<img src="${esc(p.teacherSignature)}" alt="Tanda tangan pengajar">`:'Belum ada tanda tangan'}</div>
                  <input type="hidden" id="profileTeacherSignature" value="${esc(p.teacherSignature||'')}">
                  <div class="signature-upload-actions">
                    <label class="btn secondary small import-label">Unggah TTD<input type="file" id="teacherSignatureFile" accept="image/png,image/jpeg,image/webp"></label>
                    <button type="button" class="btn secondary small" id="removeTeacherSignature">Hapus</button>
                  </div>
                </div>
                <div class="signature-upload-card">
                  <div><b>Tanda Tangan Kepala Sekolah</b><small>Gunakan gambar tanda tangan yang sudah dipotong rapi.</small></div>
                  <div class="signature-preview ${p.principalSignature?'has-image':''}" id="principalSignaturePreview">${p.principalSignature?`<img src="${esc(p.principalSignature)}" alt="Tanda tangan kepala sekolah">`:'Belum ada tanda tangan'}</div>
                  <input type="hidden" id="profilePrincipalSignature" value="${esc(p.principalSignature||'')}">
                  <div class="signature-upload-actions">
                    <label class="btn secondary small import-label">Unggah TTD<input type="file" id="principalSignatureFile" accept="image/png,image/jpeg,image/webp"></label>
                    <button type="button" class="btn secondary small" id="removePrincipalSignature">Hapus</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="identifier-help"><b>Pilihan identitas:</b> pilih <strong>NIP</strong> untuk guru ASN, <strong>NUPTK</strong> untuk guru yang hanya memiliki NUPTK, atau <strong>Tanpa Nomor</strong> agar baris nomor tidak dicetak.</div>
          </section>
          <div class="payment-summary"><div><small>Total</small><b>${rupiah(o.total)}</b></div><div><small>Dibayar</small><b>${rupiah(o.paid)}</b></div><div><small>Sisa</small><b>${rupiah(Math.max(0,(+o.total||0)-(+o.paid||0)))}</b></div></div>
          <div class="actions order-actions"><button class="btn primary" id="saveOrderBtn">Simpan Pesanan & Profil</button><button class="btn teal" id="activateOrderBtn">Aktifkan Pesanan</button><button class="btn secondary" id="markPaidBtn">Tandai Lunas</button><button class="btn secondary" id="duplicateOrderBtn">Duplikat</button><button class="btn danger" id="deleteOrderBtn">Hapus</button></div>
          <div class="print-payment-panel"><div><span class="eyebrow">KONTROL CETAK</span><h3>Kontrol watermark pembayaran</h3><p>Dokumen pesanan yang belum lunas otomatis dicetak dengan watermark pada setiap halaman. Cetak bersih tersedia setelah status diubah menjadi Lunas.</p></div><div class="actions"><a class="btn warning" data-print-mode="watermark" href="print.html?grade=${o.grade}&section=all">Cetak Watermark</a><a class="btn primary ${o.paymentStatus!=='lunas'?'disabled':''}" data-print-mode="clean" href="print.html?grade=${o.grade}&section=all" ${o.paymentStatus!=='lunas'?'aria-disabled="true"':''}>Cetak Bersih</a></div></div>
          <section class="history-section"><div class="history-head"><div><span class="eyebrow">AUDIT TRAIL</span><h3>Riwayat Pengeditan Pesanan</h3></div><button class="btn secondary small" id="clearHistoryBtn">Bersihkan Riwayat</button></div>
            <div class="history-list">${(o.history||[]).length?(o.history||[]).map(h=>`<article class="history-item"><div class="history-dot"></div><div><b>${esc(h.action)}</b><span>${formatDate(h.time)}</span><p>${esc(h.detail||'')}</p></div>${h.snapshot?`<button class="btn secondary small" data-restore-history="${h.id}">Pulihkan</button>`:''}</article>`).join(''):'<div class="empty-state">Belum ada riwayat.</div>'}</div>
          </section>
        </section>
      </div>`;
    bindOrderEvents();
    updateIdentifierInputs();
    bindSignatureInputs();
    bindLogoInputs();
  }

  function resizeSignatureFile(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/')){
        reject(new Error('File bukan gambar.'));
        return;
      }
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Gambar tidak dapat dibaca.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Format gambar tidak didukung.'));
        img.onload=()=>{
          const maxWidth=520,maxHeight=170;
          let scale=Math.min(1,maxWidth/img.width,maxHeight/img.height);
          let output='';
          for(const quality of [0.76,0.66,0.56,0.46,0.36]){
            const canvas=document.createElement('canvas');
            canvas.width=Math.max(1,Math.round(img.width*scale));
            canvas.height=Math.max(1,Math.round(img.height*scale));
            const ctx=canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            output=canvas.toDataURL('image/webp',quality);
            if(output.length<=90000)break;
            scale*=0.84;
          }
          resolve(output);
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }
  function setSignaturePreview(kind,data){
    const cap=kind==='teacher'?'Teacher':'Principal';
    const preview=$(`#${kind}SignaturePreview`);
    const hidden=$(`#profile${cap}Signature`);
    if(hidden)hidden.value=data||'';
    if(preview){
      preview.classList.toggle('has-image',!!data);
      preview.innerHTML=data?`<img src="${data}" alt="Tanda tangan">`:'Belum ada tanda tangan';
    }
  }
  function bindSignatureInputs(){
    [
      ['teacher','teacherSignatureFile','removeTeacherSignature'],
      ['principal','principalSignatureFile','removePrincipalSignature']
    ].forEach(([kind,fileId,removeId])=>{
      const input=$(`#${fileId}`),remove=$(`#${removeId}`);
      if(input)input.onchange=async()=>{
        const file=input.files&&input.files[0];
        if(!file)return;
        try{
          const data=await resizeSignatureFile(file);
          setSignaturePreview(kind,data);
          toast('Tanda tangan siap disimpan.');
        }catch(error){
          alert(error.message||'Gambar tanda tangan tidak dapat diproses.');
        }
        input.value='';
      };
      if(remove)remove.onclick=()=>{
        setSignaturePreview(kind,'');
        toast('Tanda tangan dihapus dari formulir.');
      };
    });
  }
  function resizeLogoFile(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/')){reject(new Error('File bukan gambar.'));return}
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Gambar logo tidak dapat dibaca.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Format logo tidak didukung.'));
        img.onload=()=>{
          let scale=Math.min(1,320/img.width,320/img.height),output='';
          for(const quality of [0.86,0.76,0.66,0.56,0.46]){
            const canvas=document.createElement('canvas');
            canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
            const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
            output=canvas.toDataURL('image/webp',quality);
            if(output.length<=85000)break;
            scale*=0.84;
          }
          resolve(output);
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }
  function logoProfileFromForm(){
    return normalizeProfile({logoMode:$('#profileLogoMode')?.value||'buol',customLogoLeft:$('#profileCustomLogoLeft')?.value||'',customLogoRight:$('#profileCustomLogoRight')?.value||'',customLogoRightEnabled:$('#profileCustomLogoRightEnabled')?.value||'1'});
  }
  function refreshLogoSettings(){
    const p=logoProfileFromForm(),logos=logoConfig(p),controls=$('#customLogoControls'),rightOption=$('#customRightLogoOption'),note=$('#logoModeNote');
    if(controls)controls.hidden=p.logoMode!=='custom';
    if(rightOption)rightOption.hidden=p.logoMode!=='custom';
    const notes={buol:'Mode Buol menampilkan Logo Kabupaten Buol di kiri dan Logo Tut Wuri Handayani di kanan.',kemenag:'Mode Kementerian Agama menampilkan satu Logo Kemenag. Logo Tut Wuri Handayani otomatis disembunyikan.',custom:'Mode kustom memakai logo yang Anda unggah. Logo kanan bersifat opsional.'};
    if(note)note.textContent=notes[p.logoMode]||notes.buol;
    const apply=(id,src,emptyText)=>{const box=$(id);if(!box)return;box.classList.toggle('has-image',!!src);box.innerHTML=src?`<img src="${esc(src)}" alt="Pratinjau logo">`:`<span>${emptyText}</span>`};
    apply('#logoLeftPreview',logos.left,p.logoMode==='custom'?'Belum ada logo':'Tanpa logo');
    apply('#logoRightPreview',logos.right,p.logoMode==='kemenag'?'Disembunyikan':p.logoMode==='custom'&&p.customLogoRightEnabled==='0'?'Disembunyikan':'Belum ada logo');
  }
  function bindLogoInputs(){
    const mode=$('#profileLogoMode'),right=$('#profileCustomLogoRightEnabled');
    if(mode)mode.onchange=refreshLogoSettings;
    if(right)right.onchange=refreshLogoSettings;
    [['Left','customLogoLeftFile','removeCustomLogoLeft'],['Right','customLogoRightFile','removeCustomLogoRight']].forEach(([side,fileId,removeId])=>{
      const input=$(`#${fileId}`),remove=$(`#${removeId}`),hidden=$(`#profileCustomLogo${side}`);
      if(input)input.onchange=async()=>{
        const file=input.files&&input.files[0];if(!file)return;
        try{hidden.value=await resizeLogoFile(file);refreshLogoSettings();toast('Logo siap disimpan.')}catch(error){alert(error.message||'Logo tidak dapat diproses.')}
        input.value='';
      };
      if(remove)remove.onclick=()=>{if(hidden)hidden.value='';refreshLogoSettings();toast('Logo dihapus dari formulir.')};
    });
    refreshLogoSettings();
  }
  function updateIdentifierInputs(){
    const pairs=[['profileTeacherIdType','profileTeacherId'],['profilePrincipalIdType','profilePrincipalId']];
    pairs.forEach(([typeId,inputId])=>{const type=$("#"+typeId),input=$("#"+inputId);if(!type||!input)return;const apply=()=>{const none=type.value==='NONE';input.disabled=none;input.placeholder=none?'Tidak dicetak':`Masukkan ${type.value}`;if(none)input.value=''};type.onchange=apply;apply()});
  }
  function bindOrderEvents(){
    $$('[data-select-order]').forEach(b=>b.onclick=()=>{selectedOrderId=b.dataset.selectOrder;renderOrders()});
    $('#newOrderBtn').onclick=()=>{const s=getStore();createOrder(s);renderOrders()};
    $('#saveOrderBtn').onclick=()=>{
      const s=getStore(),o=s.orders.find(x=>x.id===selectedOrderId),before=snapshot(o),changes=[];
      const values={number:$('#ordNumber').value.trim(),customer:$('#ordCustomer').value.trim(),whatsapp:$('#ordWhatsapp').value.trim(),grade:$('#ordGrade').value,paymentStatus:$('#ordStatus').value,total:Number($('#ordTotal').value)||0,paid:Number($('#ordPaid').value)||0,watermark:$('#ordWatermark').value.trim()||'BELUM LUNAS',notes:$('#ordNotes').value.trim()};
      for(const [k,v] of Object.entries(values)){if(String(o[k]??'')!==String(v)){changes.push(`${k}: “${o[k]??''}” → “${v}”`);o[k]=v}}
      const nextProfile=normalizeProfile({
        ...(o.profile||{}),
        government:$('#profileGovernment').value.trim(),department:$('#profileDepartment').value.trim(),school:$('#profileSchool').value.trim(),program:$('#profileProgram').value.trim(),rombel:$('#profileRombel').value,address:$('#profileAddress').value.trim(),
        teacherRole:$('#profileTeacherRole').value,teacher:$('#profileTeacher').value.trim(),teacherIdType:$('#profileTeacherIdType').value,teacherId:$('#profileTeacherIdType').value==='NONE'?'':$('#profileTeacherId').value.trim(),
        principal:$('#profilePrincipal').value.trim(),principalIdType:$('#profilePrincipalIdType').value,principalId:$('#profilePrincipalIdType').value==='NONE'?'':$('#profilePrincipalId').value.trim(),
        year:$('#profileYear').value.trim(),place:$('#profilePlace').value.trim(),date:$('#profileDate').value.trim(),dateSemester2:$('#profileDateSemester2').value.trim(),region:$('#profileRegion').value.trim(),
        logoMode:$('#profileLogoMode').value,customLogoLeft:$('#profileCustomLogoLeft').value,customLogoRight:$('#profileCustomLogoRight').value,customLogoRightEnabled:$('#profileCustomLogoRightEnabled').value,
        teacherSignature:$('#profileTeacherSignature').value,
        principalSignature:$('#profilePrincipalSignature').value
      });
      const labels={government:'Pemerintah/instansi',department:'Dinas/unit pembina',school:'Satuan pendidikan',program:'Program/jenjang',rombel:'Rombel',address:'Alamat sekolah',teacherRole:'Peran pengajar',teacher:'Nama pengajar',teacherIdType:'Jenis nomor pengajar',teacherId:'Nomor pengajar',principal:'Nama kepala sekolah',principalIdType:'Jenis nomor kepala',principalId:'Nomor kepala',year:'Tahun pelajaran',place:'Tempat',date:'Tanggal penetapan Semester 1',dateSemester2:'Tanggal penetapan Semester 2',region:'Wilayah',logoMode:'Jenis logo kop',customLogoLeft:'Logo kiri kustom',customLogoRight:'Logo kanan kustom',customLogoRightEnabled:'Tampilan logo kanan',teacherSignature:'Tanda tangan pengajar',principalSignature:'Tanda tangan kepala sekolah'};
      const oldProfile=normalizeProfile(o.profile||{});
      Object.keys(nextProfile).forEach(k=>{
        if(String(oldProfile[k]??'')===String(nextProfile[k]??''))return;
        if(['teacherSignature','principalSignature','customLogoLeft','customLogoRight'].includes(k)){
          changes.push(`${labels[k]||k}: ${nextProfile[k]?'ditambahkan atau diperbarui':'dihapus'}`);
        }else{
          const beforeText=String(oldProfile[k]??'').slice(0,160);
          const afterText=String(nextProfile[k]??'').slice(0,160);
          changes.push(`${labels[k]||k}: “${beforeText}” → “${afterText}”`);
        }
      });
      o.profile=nextProfile;o.school=nextProfile.school;
      if(!changes.length){alert('Tidak ada perubahan untuk disimpan.');return}
      history(o,'Pesanan dan profil diperbarui',changes.join(' · '),before);saveAndSync(s,o);renderOrders();
    };
    $('#activateOrderBtn').onclick=()=>{
      const s=getStore(),o=s.orders.find(x=>x.id===selectedOrderId),before=snapshot(o);s.activeId=o.id;history(o,'Pesanan diaktifkan','Pesanan dipilih sebagai data kerja aktif.',before);saveAndSync(s,o,{reload:true});
    };
    $('#markPaidBtn').onclick=()=>{
      const s=getStore(),o=s.orders.find(x=>x.id===selectedOrderId),before=snapshot(o);o.paymentStatus='lunas';if(+o.total>0)o.paid=+o.total;history(o,'Pembayaran ditandai lunas',`Pembayaran ${rupiah(o.paid)} dari total ${rupiah(o.total)}.`,before);saveAndSync(s,o);renderOrders();
    };
    $('#duplicateOrderBtn').onclick=()=>{
      const s=getStore(),src=s.orders.find(x=>x.id===selectedOrderId),copy=clone(src);copy.id=`order-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;copy.number=newNumber(s);copy.customer=`${src.customer||'Pemesan'} (Salinan)`;copy.paymentStatus='belum_lunas';copy.paid=0;copy.createdAt=now();copy.updatedAt=now();copy.history=[];history(copy,'Pesanan diduplikasi',`Dibuat dari pesanan ${src.number}.`,null);s.orders.unshift(copy);selectedOrderId=copy.id;setStore(s);renderOrders();
    };
    $('#deleteOrderBtn').onclick=()=>{
      const s=getStore();if(s.orders.length<=1){alert('Minimal satu pesanan harus tetap tersedia.');return}const o=s.orders.find(x=>x.id===selectedOrderId);if(!confirm(`Hapus pesanan ${o.number}?`))return;s.orders=s.orders.filter(x=>x.id!==o.id);if(s.activeId===o.id)s.activeId=s.orders[0].id;selectedOrderId=s.activeId;saveAndSync(s,activeOrder(s));renderOrders();
    };
    $('#clearHistoryBtn').onclick=()=>{const s=getStore(),o=s.orders.find(x=>x.id===selectedOrderId);if(!confirm('Bersihkan seluruh riwayat pesanan ini?'))return;o.history=[];history(o,'Riwayat dibersihkan','Riwayat sebelumnya dihapus oleh pengguna.',null);setStore(s);renderOrders()};
    $$('[data-restore-history]').forEach(b=>b.onclick=()=>{
      const s=getStore(),o=s.orders.find(x=>x.id===selectedOrderId),entry=(o.history||[]).find(h=>h.id===b.dataset.restoreHistory);if(!entry?.snapshot)return;if(!confirm(`Pulihkan kondisi sebelum “${entry.action}”?`))return;const current=snapshot(o),keepHistory=o.history,currentImages={teacherSignature:o.profile?.teacherSignature||'',principalSignature:o.profile?.principalSignature||'',customLogoLeft:o.profile?.customLogoLeft||'',customLogoRight:o.profile?.customLogoRight||''};Object.assign(o,clone(entry.snapshot));o.profile=normalizeProfile({...o.profile,...currentImages});o.history=keepHistory;history(o,'Versi lama dipulihkan',`Dipulihkan dari riwayat ${formatDate(entry.time)}: ${entry.action}.`,current);saveAndSync(s,o);renderOrders();
    });
    $('#exportOrdersBtn').onclick=async()=>{
      const backup=await optimizeStoreImages(getStore(),false);
      const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=`backup-eperangkat-Matematika-v23-1-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),500);
    };
    $('#importOrdersInput').onchange=e=>{
      const file=e.target.files[0];if(!file)return;
      const reader=new FileReader();
      reader.onload=async()=>{
        try{
          const parsed=JSON.parse(reader.result);
          if(!Array.isArray(parsed.orders)||!parsed.orders.length)throw new Error('Format backup tidak sesuai.');
          let prepared=await optimizeStoreImages(parsed,false);
          try{
            const saved=setStore(prepared);
            selectedOrderId=saved.activeId||saved.orders[0].id;
            saveAndSync(saved,activeOrder(saved),{reload:true});
          }catch(error){
            if(!isQuotaError(error)&&error.name!=='StorageQuotaError')throw error;
            prepared=await optimizeStoreImages(parsed,true);
            const oldKeys=obsoleteMathKeys();
            if(oldKeys.length&&!confirm(`Backup sudah dipadatkan, tetapi ruang masih kurang. Hapus ${oldKeys.length} data browser Matematika versi lama lalu lanjutkan impor?`)){
              throw new Error('Impor dibatalkan karena ruang penyimpanan belum tersedia.');
            }
            if(oldKeys.length)cleanupOldMathStorage();
            const saved=setStore(prepared);
            selectedOrderId=saved.activeId||saved.orders[0].id;
            saveAndSync(saved,activeOrder(saved),{reload:true});
          }
        }catch(err){
          alert(`Gagal mengimpor: ${err.message}`);
        }finally{
          e.target.value='';
        }
      };
      reader.readAsText(file);
    };
    $('#optimizeStorageBtn').onclick=async()=>{
      try{
        const optimized=await optimizeStoreImages(getStore(),true);
        const saved=setStore(optimized);
        saveAndSync(saved,activeOrder(saved));
        alert('Data berhasil dioptimalkan. Riwayat dibatasi dan gambar tanda tangan diperkecil.');
        renderOrders();
      }catch(error){
        alert(`Optimasi gagal: ${error.message}`);
      }
    };
    $('#cleanupOldMathBtn').onclick=()=>{
      const keys=obsoleteMathKeys();
      if(!keys.length){alert('Tidak ada data Matematika versi lama di penyimpanan browser.');return}
      if(!confirm(`Hapus ${keys.length} data browser Matematika versi lama? File ZIP dan folder aplikasi lama di komputer tidak ikut terhapus.`))return;
      cleanupOldMathStorage();
      alert('Data browser Matematika versi lama berhasil dibersihkan.');
      renderOrders();
    };
  }

  const CAL_STATS={
    '2026-07':[3,3,15,14],'2026-08':[4,4,19,19],'2026-09':[5,5,22,22],'2026-10':[5,4,21,21],'2026-11':[4,4,20,20],'2026-12':[3,1,15,4],
    '2027-01':[5,4,23,22],'2027-02':[4,4,23,23],'2027-03':[5,3,14,13],'2027-04':[4,4,26,26],'2027-05':[5,5,22,22],'2027-06':[4,1,16,4]
  };
  function defaultCalendar(){return {year:'2026/2027',events:[{id:'k1',start:'2026-07-13',end:'2026-07-13',type:'unit',title:'Awal Masuk Sekolah Tahun Ajaran 2026/2027'},{id:'k2',start:'2026-07-14',end:'2026-07-17',type:'unit',title:'MPLS Peserta Didik Baru'},{id:'k3',start:'2026-08-17',end:'2026-08-17',type:'national',title:'HUT Kemerdekaan Republik Indonesia'},{id:'k4',start:'2026-08-25',end:'2026-08-25',type:'national',title:'Maulid Nabi Muhammad SAW'},{id:'k5',start:'2026-10-12',end:'2026-10-12',type:'unit',title:'Hari Ulang Tahun Daerah'},{id:'k6',start:'2026-11-25',end:'2026-11-25',type:'unit',title:'Hari Guru Nasional dan HUT PGRI (fakultatif)'},{id:'k7',start:'2026-12-07',end:'2026-12-11',type:'assessment',title:'Sumatif Akhir Semester SMA/SMK'},{id:'k8',start:'2026-12-14',end:'2026-12-18',type:'unit',title:'Pengolahan Nilai Rapor SMA/SMK'},{id:'k9',start:'2026-12-21',end:'2026-12-21',type:'report',title:'Penyerahan Rapor SMA/SMK'},{id:'k10',start:'2026-12-22',end:'2026-12-31',type:'semester',title:'Libur Semester Ganjil'},{id:'k11',start:'2026-12-24',end:'2026-12-25',type:'national',title:'Cuti Bersama / Hari Raya Natal 2026'},{id:'k20',start:'2027-01-01',end:'2027-01-01',type:'national',title:'Tahun Baru Masehi 2027'},{id:'k21',start:'2027-01-04',end:'2027-01-04',type:'unit',title:'Awal masuk Semester Genap'},{id:'k22',start:'2027-01-05',end:'2027-01-05',type:'national',title:'Isra Mikraj Nabi Muhammad SAW (proyeksi)'},{id:'k23',start:'2027-02-06',end:'2027-02-06',type:'national',title:'Tahun Baru Imlek 2578 Kongzili (proyeksi)'},{id:'k24',start:'2027-03-08',end:'2027-03-20',type:'semester',title:'Penyesuaian Ramadan dan Idulfitri (proyeksi)'},{id:'k25',start:'2027-03-09',end:'2027-03-09',type:'national',title:'Hari Suci Nyepi Tahun Baru Saka 1949 (proyeksi)'},{id:'k26',start:'2027-03-10',end:'2027-03-11',type:'national',title:'Hari Raya Idulfitri 1448 H (proyeksi)'},{id:'k27',start:'2027-03-22',end:'2027-03-22',type:'unit',title:'Awal masuk pasca-Idulfitri (proyeksi)'},{id:'k28',start:'2027-03-26',end:'2027-03-26',type:'national',title:'Wafat Yesus Kristus (proyeksi)'},{id:'k29',start:'2027-05-01',end:'2027-05-01',type:'national',title:'Hari Buruh Internasional'},{id:'k30',start:'2027-05-06',end:'2027-05-06',type:'national',title:'Kenaikan Yesus Kristus (proyeksi)'},{id:'k31',start:'2027-05-17',end:'2027-05-17',type:'national',title:'Hari Raya Iduladha 1448 H (proyeksi)'},{id:'k32',start:'2027-05-20',end:'2027-05-20',type:'national',title:'Hari Raya Waisak (proyeksi)'},{id:'k33',start:'2027-06-01',end:'2027-06-01',type:'national',title:'Hari Lahir Pancasila'},{id:'k34',start:'2027-06-06',end:'2027-06-06',type:'national',title:'1 Muharam 1449 H (proyeksi)'},{id:'k35',start:'2027-06-07',end:'2027-06-12',type:'assessment',title:'Sumatif Akhir Semester Genap'},{id:'k36',start:'2027-06-14',end:'2027-06-18',type:'unit',title:'Pengolahan nilai dan penyelesaian laporan'},{id:'k37',start:'2027-06-19',end:'2027-06-19',type:'report',title:'Penyerahan laporan hasil belajar'},{id:'k38',start:'2027-06-21',end:'2027-06-30',type:'semester',title:'Libur akhir Tahun Ajaran 2026/2027'}]};}
  function eventForDate(events,date){
    const ds=date.toISOString().slice(0,10),priority={national:5,semester:4,assessment:3,report:2,unit:1};
    return events.filter(e=>ds>=e.start&&ds<=e.end).sort((a,b)=>(priority[b.type]||0)-(priority[a.type]||0))[0];
  }
  function monthGrid(year,month,events){
    const headers=['M','S','S','R','K','J','S'],first=new Date(Date.UTC(year,month,1)).getUTCDay(),days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
    let cells=Array(first).fill('');for(let d=1;d<=days;d++)cells.push(d);while(cells.length%7)cells.push('');
    return `<table class="mini-cal"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${Array.from({length:cells.length/7},(_,r)=>`<tr>${cells.slice(r*7,r*7+7).map((d,c)=>{if(!d)return '<td></td>';const date=new Date(Date.UTC(year,month,d)),ev=eventForDate(events,date);return `<td class="${c===0?'sunday ':''}${ev?'ev-'+ev.type:''}" title="${ev?esc(ev.title):''}">${d}</td>`}).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function rangeLabel(e){const a=e.start.slice(8,10).replace(/^0/,''),b=e.end.slice(8,10).replace(/^0/,'');return e.start===e.end?a:`${a}–${b}`}
  function calendarTable(calendar,semester){
    const months=semester===1?[[2026,6],[2026,7],[2026,8],[2026,9],[2026,10],[2026,11]]:[[2027,0],[2027,1],[2027,2],[2027,3],[2027,4],[2027,5]],names=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
    let totals=[0,0,0,0];
    const rows=months.map(([y,m])=>{const key=`${y}-${String(m+1).padStart(2,'0')}`,stats=CAL_STATS[key]||[0,0,0,0];stats.forEach((v,i)=>totals[i]+=v);const monthStart=`${key}-01`,monthEnd=`${key}-${String(new Date(y,m+1,0).getDate()).padStart(2,'0')}`;const events=calendar.events.filter(e=>e.end>=monthStart&&e.start<=monthEnd);return `<tr><td class="month-cell"><b>${names[m]} ${y}</b>${monthGrid(y,m,calendar.events)}</td>${stats.map((v,i)=>`<td class="cal-stat"><b>${v}</b><small>${['MES','MEB','HES','HEB'][i]}</small></td>`).join('')}<td class="event-cell">${events.length?events.map(e=>`<div class="event-row ${e.type}"><b>${rangeLabel(e)}</b><span>${esc(e.title)}</span></div>`).join(''):'<div class="event-row learning"><b>—</b><span>Kegiatan pembelajaran reguler</span></div>'}</td></tr>`}).join('');
    return `<table class="calendar-main"><thead><tr><th>Hari / Tanggal</th><th>MES</th><th>MEB</th><th>HES</th><th>HEB</th><th>Keterangan / Rambu-rambu</th></tr></thead><tbody>${rows}<tr class="calendar-total"><td>JUMLAH SEMESTER ${semester===1?'I':'II'}</td>${totals.map(v=>`<td>${v}</td>`).join('')}<td></td></tr></tbody></table>`;
  }
  function renderCalendar(){
    const store=getStore(),o=activeOrder(store);if(!o.calendar)o.calendar=defaultCalendar();const cal=o.calendar,p=o.profile||D.defaults;
    const sem=calendarSemester;
    app.innerHTML=pageHead('Kalender Pendidikan','Kalender Pendidikan: MES 24, MEB 21, HES 112 hari, dan HEB 100 hari menjadi dasar Program Tahunan serta Program Semester Matematika.',`<a class="btn primary" href="print.html?grade=${o.grade}&section=calendar&semester=${sem}">Cetak Semester ${sem===1?'I':'II'}</a><a class="btn secondary" href="print.html?grade=${o.grade}&section=calendar&semester=both">Cetak Keduanya</a>`)+`
      <div class="calendar-toolbar"><div class="semester-tabs"><button class="${sem===1?'active':''}" data-semester="1">Semester I · Ganjil</button><button class="${sem===2?'active':''}" data-semester="2">Semester II · Genap</button></div><div class="actions"><button class="btn secondary" id="resetCalendarBtn">Reset Contoh</button><button class="btn primary" id="saveCalendarBtn">Simpan Kalender</button></div></div>
      <section class="calendar-sheet-web">${calendarLetterhead(p)}<div class="calendar-title-row"><b>KALENDER PENDIDIKAN TAHUN AJARAN ${esc(p.year)}</b><strong>SEMESTER ${sem===1?'I (GANJIL)':'II (GENAP)'}</strong></div>${calendarTable(cal,sem)}<div class="calendar-legend"><span class="national">Libur nasional</span><span class="semester">Libur semester</span><span class="unit">Kegiatan satuan</span><span class="assessment">Asesmen</span><span class="report">Rapor</span><span class="learning">Pembelajaran/kegiatan</span></div></section>
      <section class="card calendar-editor"><div class="history-head"><div><span class="eyebrow">EDITOR KALENDER</span><h2>Kegiatan dan Hari Libur</h2><p>Perubahan disimpan khusus untuk pesanan aktif <b>${esc(o.number)}</b> dan masuk ke riwayat pengeditan.</p></div><button class="btn teal" id="addCalendarEvent">+ Tambah Kegiatan</button></div><div class="calendar-event-list">${cal.events.filter(e=>sem===1?e.end<'2027-01-03':e.end>='2027-01-01').map(e=>calendarEventRow(e)).join('')}</div></section>`;
    bindCalendarEvents();
  }
  function calendarEventRow(e){return `<div class="calendar-event-edit" data-event-id="${e.id}"><input type="date" data-field="start" value="${e.start}"><input type="date" data-field="end" value="${e.end}"><select data-field="type"><option value="national" ${e.type==='national'?'selected':''}>Libur nasional</option><option value="semester" ${e.type==='semester'?'selected':''}>Libur semester</option><option value="unit" ${e.type==='unit'?'selected':''}>Kegiatan satuan</option><option value="assessment" ${e.type==='assessment'?'selected':''}>Asesmen</option><option value="report" ${e.type==='report'?'selected':''}>Rapor</option><option value="learning" ${e.type==='learning'?'selected':''}>Pembelajaran</option></select><input data-field="title" value="${esc(e.title)}" placeholder="Keterangan kegiatan"><button class="btn danger small" data-delete-event="${e.id}">Hapus</button></div>`}
  function bindCalendarEvents(){
    $$('[data-semester]').forEach(b=>b.onclick=()=>{calendarSemester=+b.dataset.semester;renderCalendar()});
    $('#addCalendarEvent').onclick=()=>{const s=getStore(),o=activeOrder(s);if(!o.calendar)o.calendar=defaultCalendar();const start=calendarSemester===1?'2026-07-01':'2027-01-01';o.calendar.events.push({id:`e-${Date.now()}`,start,end:start,type:'unit',title:'Kegiatan baru'});setStore(s);renderCalendar()};
    $$('[data-delete-event]').forEach(b=>b.onclick=()=>{const s=getStore(),o=activeOrder(s),before=snapshot(o);o.calendar.events=o.calendar.events.filter(e=>e.id!==b.dataset.deleteEvent);history(o,'Kegiatan kalender dihapus',`Kegiatan dengan ID ${b.dataset.deleteEvent} dihapus.`,before);saveAndSync(s,o);renderCalendar()});
    $('#saveCalendarBtn').onclick=()=>{
      const s=getStore(),o=activeOrder(s),before=snapshot(o),map=new Map(o.calendar.events.map(e=>[e.id,e]));
      $$('.calendar-event-edit').forEach(row=>{const e=map.get(row.dataset.eventId);if(!e)return;$$('[data-field]',row).forEach(inp=>e[inp.dataset.field]=inp.value)});
      history(o,'Kalender pendidikan diperbarui',`Data kegiatan Semester ${calendarSemester===1?'I':'II'} disimpan.`,before);saveAndSync(s,o);renderCalendar();
    };
    $('#resetCalendarBtn').onclick=()=>{if(!confirm('Kembalikan kalender ke contoh Tahun Ajaran 2026/2027?'))return;const s=getStore(),o=activeOrder(s),before=snapshot(o);o.calendar=defaultCalendar();history(o,'Kalender direset','Kalender dikembalikan ke data contoh 2026/2027.',before);saveAndSync(s,o);renderCalendar()};
  }

  function currentCustomView(){return localStorage.getItem('eperangkat.matematika.fasea.v1.view')}
  function renderCustom(){const v=currentCustomView();if(v==='orders')renderOrders();if(v==='calendar')renderCalendar();enhancePrintView()}
  function enhancePrintView(){
    if(currentCustomView()!=='print')return;const store=getStore(),o=activeOrder(store),root=$('#app');if(!root||$('#paymentPrintNotice'))return;
    const box=document.createElement('div');box.id='paymentPrintNotice';box.className=`payment-print-notice ${statusClass(o.paymentStatus)}`;box.innerHTML=`<div><span class="eyebrow">PESANAN AKTIF</span><h3>${esc(o.number)} · ${esc(o.customer||o.profile?.school||'Pemesan')}</h3><p>Status pembayaran: <b>${statusLabel(o.paymentStatus)}</b>. ${o.paymentStatus==='lunas'?'Pratinjau otomatis dicetak bersih.':'Semua pratinjau otomatis diberi watermark “'+esc(o.watermark||'BELUM LUNAS')+'”.'}</p></div><span class="payment-badge large ${statusClass(o.paymentStatus)}">${statusLabel(o.paymentStatus)}</span>`;root.prepend(box);
  }
  function openPrint(raw,mode='auto'){
    const store=getStore(),o=(currentCustomView()==='orders'&&selectedOrderId?store.orders.find(x=>x.id===selectedOrderId):null)||activeOrder(store);if(o&&store.activeId!==o.id){store.activeId=o.id;saveAndSync(store,o)}if(mode==='clean'&&o.paymentStatus!=='lunas'){alert('Cetak bersih dikunci karena pesanan belum lunas. Ubah status pembayaran menjadi Lunas terlebih dahulu.');return}
    const url=new URL(raw,location.href);url.searchParams.set('order',o.id);url.searchParams.set('wm',mode==='watermark'?'1':mode==='clean'?'0':'auto');
    history(o,'Pratinjau cetak dibuka',`${url.searchParams.get('section')||'paket'} · mode ${mode==='watermark'?'watermark':mode==='clean'?'bersih':'otomatis'}.`,snapshot(o));setStore(store);window.open(url.href,'_blank');
  }

  // Navigasi custom berjalan setelah renderer versi 2 selesai.
  $$('[data-view="orders"],[data-view="calendar"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderCustom,0)));
  $$('[data-grade]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{
    const v=currentCustomView();if(v==='orders'||v==='calendar')renderCustom();
    const s=getStore(),o=activeOrder(s),g=localStorage.getItem('eperangkat.matematika.fasea.v1.grade')||b.dataset.grade;if(o&&o.grade!==g){const before=snapshot(o);o.grade=g;history(o,'Kelas pesanan diubah',`Kelas diubah menjadi ${g}.`,before);setStore(s)}
  },0)));

  // Semua tautan cetak mendapatkan identitas pesanan dan mode watermark otomatis.
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href*="print.html"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();if(a.classList.contains('disabled')||a.getAttribute('aria-disabled')==='true'){alert('Cetak bersih belum tersedia karena pesanan belum lunas.');return}openPrint(a.getAttribute('href'),a.dataset.printMode||'auto');
  },true);
  $('#quickPrint')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openPrint(`print.html?grade=${localStorage.getItem('eperangkat.matematika.fasea.v1.grade')||'I'}&section=all`,'auto')},true);

  // Profil menjadi milik pesanan aktif dan setiap penyimpanan dicatat.
  $('#saveProfile')?.addEventListener('click',()=>{const s=getStore(),o=activeOrder(s);beforeProfileSnapshot=o?snapshot(o):null},true);
  document.addEventListener('click',e=>{
    if(e.target.id==='saveProfile')setTimeout(()=>{const s=getStore(),o=activeOrder(s);if(!o)return;let p={...D.defaults};try{p={...p,...JSON.parse(localStorage.getItem('eperangkat.matematika.fasea.v1.profile')||'{}')}}catch(_){}o.profile=p;o.school=p.school;history(o,'Profil satuan pendidikan diperbarui','Identitas dokumen disimpan melalui menu Profil.',beforeProfileSnapshot);setStore(s);refreshOrderBar()},20);
    if(e.target.id==='saveStudents')setTimeout(()=>{const s=getStore(),o=activeOrder(s);if(!o)return;const before=snapshot(o);try{o.students=JSON.parse(localStorage.getItem('eperangkat.matematika.fasea.v1.students')||'[]')}catch(_){o.students=[]}history(o,'Data peserta dan nilai diperbarui',`${o.students.length} peserta tersimpan.`,before);setStore(s)},20);
  });

  // Tombol profil diarahkan ke profil milik pesanan aktif, bukan profil global terpisah.
  $('#profileBtn')?.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    localStorage.setItem('eperangkat.matematika.fasea.v1.view','orders');
    const s=getStore();selectedOrderId=activeOrder(s)?.id||selectedOrderId;
    const nav=$('[data-view="orders"]');
    nav?.click();
    setTimeout(()=>{renderOrders();$('#orderProfileCard')?.scrollIntoView({behavior:'smooth',block:'start'});$('#profileSchool')?.focus()},40);
  },true);


  // Sinkronisasi nama peserta dari impor CSV Daftar Hadir ke pesanan aktif.
  window.addEventListener('eperangkat:students-updated',event=>{
    const s=getStore(),o=activeOrder(s);if(!o)return;
    const before=snapshot(o);
    try{o.students=JSON.parse(localStorage.getItem('eperangkat.matematika.fasea.v1.students')||'[]')}
    catch(_){o.students=[]}
    o.students=Array.isArray(o.students)?o.students.slice(0,30):[];
    const info=event.detail||{};
    history(o,info.action||'Data peserta didik diperbarui',info.detail||`${o.students.length} peserta tersimpan.`,before);
    saveAndSync(s,o);
  });

  refreshOrderBar();
  renderCustom();
})();

