(()=>{
  'use strict';
  const D=window.EPERANGKAT_DATA||{};
  const PROFILE_KEY='eperangkat.informatika.fasee.v1.profile';
  const ORDER_KEY='eperangkat.informatika.fasee.v1.orders';
  const VIEW_KEY='eperangkat.informatika.fasee.v1.view';
  const GRADE_KEY='eperangkat.informatika.fasee.v1.grade';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let activeSemester='1';

  function clone(value){return JSON.parse(JSON.stringify(value))}
  function getStore(){
    try{return JSON.parse(localStorage.getItem(ORDER_KEY)||'{"activeId":"","orders":[]}')}
    catch(_){return {activeId:'',orders:[]}}
  }
  function activeOrder(store=getStore()){
    return (store.orders||[]).find(o=>o.id===store.activeId)||(store.orders||[])[0]||null;
  }
  function profile(){
    const store=getStore(),order=activeOrder(store);
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(_){}
    return {...(D.defaults||{}),...(order?.profile||{}),...saved};
  }
  function classLabel(value=''){
    const raw=String(value||'').trim().toUpperCase().replace(/\s+/g,' ');
    if(!raw)return '';
    return raw.replace(/^([IVX]+)\s*([A-Z])$/,'$1 $2');
  }
  function scheduleRows(p){
    const rows=Array.isArray(p.teachingSchedule)?clone(p.teachingSchedule):clone(D.defaults?.teachingSchedule||[]);
    return rows.map(row=>({
      semester:String(row.semester||'1'),
      className:String(row.className||''),
      day:String(row.day||''),
      time:String(row.time||''),
      hours:row.hours===''?'':Number(row.hours)||0
    }));
  }
  function dayOptions(value=''){
    const days=['','SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU'];
    return days.map(day=>`<option value="${day}" ${day===value?'selected':''}>${day||'Pilih hari'}</option>`).join('');
  }
  function saveRows(rows){
    const store=getStore(),order=activeOrder(store),p=profile();
    p.teachingSchedule=rows;
    localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
    if(order){
      order.profile={...(order.profile||{}),teachingSchedule:rows};
      order.updatedAt=new Date().toISOString();
      order.history=Array.isArray(order.history)?order.history:[];
      order.history.unshift({
        id:`h-${Date.now()}`,
        time:new Date().toISOString(),
        action:'Jadwal mengajar diperbarui',
        detail:'Jadwal Semester I dan Semester II disimpan.',
        snapshot:null
      });
      localStorage.setItem(ORDER_KEY,JSON.stringify(store));
    }
  }
  function currentRows(){
    return scheduleRows(profile());
  }
  function rowHtml(row,index){
    return `<tr data-schedule-index="${index}">
      <td class="center schedule-no"></td>
      <td><input data-field="className" value="${esc(row.className)}" placeholder="X"></td>
      <td><select data-field="day">${dayOptions(row.day)}</select></td>
      <td><input data-field="time" value="${esc(row.time)}" placeholder="07.20 – 09.20"></td>
      <td><input data-field="hours" type="number" min="0" step="1" value="${row.hours}"></td>
      <td><button class="btn danger small" data-delete-row="${index}">Hapus</button></td>
    </tr>`;
  }
  function collectRows(){
    const base=currentRows();
    $$('.schedule-editor tbody tr[data-schedule-index]').forEach(row=>{
      const index=Number(row.dataset.scheduleIndex);
      const item=base[index]||{semester:activeSemester};
      $$('[data-field]',row).forEach(input=>{
        item[input.dataset.field]=input.dataset.field==='hours'
          ?(input.value===''?'':Number(input.value)||0)
          :input.value.trim();
      });
      item.semester=activeSemester;
      base[index]=item;
    });
    return base;
  }
  function render(){
    const app=$('#app');
    if(!app)return;
    const p=profile(),grade=localStorage.getItem(GRADE_KEY)||'X';
    let rows=currentRows();
    const visible=rows.map((row,index)=>({...row,_index:index})).filter(row=>row.semester===activeSemester);
    const total=visible.reduce((sum,row)=>sum+(Number(row.hours)||0),0);
    app.innerHTML=`<div class="page-head"><div><span class="eyebrow">Kelas ${esc(grade)} · Fase E</span>
      <h1>Jadwal Mengajar</h1><p>Atur kelas, hari, waktu, dan jumlah jam untuk setiap semester. Data tersimpan khusus pada pesanan aktif.</p></div>
      <div class="actions"><a class="btn primary" href="print.html?grade=${encodeURIComponent(grade)}&section=schedule&semester=${activeSemester}" target="_blank">Pratinjau Cetak Semester ${activeSemester==='1'?'I':'II'}</a></div></div>
      <section class="card schedule-card">
        <div class="schedule-tabs"><button class="${activeSemester==='1'?'active':''}" data-schedule-semester="1">Semester I · Ganjil</button><button class="${activeSemester==='2'?'active':''}" data-schedule-semester="2">Semester II · Genap</button></div>
        <div class="schedule-identity">
          <div><span>Nama Sekolah</span><b>${esc(p.school||'')}</b></div>
          <div><span>Mata Pelajaran</span><b>Informatika</b></div>
          <div><span>Kelas / Semester</span><b>${esc(grade)} / ${activeSemester==='1'?'I':'II'}</b></div>
          <div><span>Tahun Pelajaran</span><b>${esc(p.year||'')}</b></div>
        </div>
        <div class="scroll"><table class="doc-table schedule-editor">
          <thead><tr><th style="width:55px">No.</th><th>Kelas</th><th>Hari</th><th>Jam</th><th style="width:125px">Jumlah Jam</th><th style="width:90px">Aksi</th></tr></thead>
          <tbody>${visible.map(row=>rowHtml(row,row._index)).join('')||'<tr><td colspan="6" class="center">Belum ada baris jadwal.</td></tr>'}</tbody>
          <tfoot><tr><td colspan="4" class="bold center">Jumlah</td><td class="bold center">${total} Jam</td><td></td></tr></tfoot>
        </table></div>
        <div class="actions schedule-actions"><button class="btn primary" id="saveScheduleBtn">Simpan Jadwal</button><button class="btn secondary" id="addScheduleRow">+ Tambah Baris</button><button class="btn secondary" id="resetScheduleExample">Gunakan Contoh Semester I</button></div>
        <div class="notice"><b>Tanggal pengesahan:</b> Semester I menggunakan ${esc(p.date||'tanggal Semester 1')}; Semester II menggunakan ${esc(p.dateSemester2||p.date||'tanggal Semester 2')}.</div>
      </section>`;
    $$('[data-schedule-semester]').forEach(btn=>btn.onclick=()=>{
      const collected=collectRows();saveRows(collected);
      activeSemester=btn.dataset.scheduleSemester;render();
    });
    $('#saveScheduleBtn').onclick=()=>{saveRows(collectRows());alert('Jadwal mengajar berhasil disimpan.');render()};
    $('#addScheduleRow').onclick=()=>{
      const rows=collectRows();
      rows.push({semester:activeSemester,className:'',day:'',time:'',hours:''});
      saveRows(rows);render();
    };
    $$('[data-delete-row]').forEach(btn=>btn.onclick=()=>{
      const rows=collectRows().filter((_,index)=>index!==Number(btn.dataset.deleteRow));
      saveRows(rows);render();
    });
    $('#resetScheduleExample').onclick=()=>{
      const rows=collectRows().filter(row=>row.semester!=='1');
      rows.push(
        {semester:'1',className:'X',day:'SENIN',time:'08.00 – 10.15',hours:3},
        {semester:'2',className:'X',day:'SENIN',time:'08.00 – 10.15',hours:3}
      );
      saveRows(rows);activeSemester='1';render();
    };
    $$('.schedule-editor tbody tr').forEach((row,index)=>{
      const no=row.querySelector('.schedule-no');if(no)no.textContent=index+1;
    });
    $$('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view==='schedule'));
  }

  const nav=$('[data-view="schedule"]');
  if(nav)nav.onclick=event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    localStorage.setItem(VIEW_KEY,'schedule');
    render();
    $('#sidebar')?.classList.remove('open');
  };
  $$('[data-grade]').forEach(button=>button.addEventListener('click',()=>{
    setTimeout(()=>{if(localStorage.getItem(VIEW_KEY)==='schedule')render()},0);
  }));
  if(localStorage.getItem(VIEW_KEY)==='schedule')setTimeout(render,0);
})();
