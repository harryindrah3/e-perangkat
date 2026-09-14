(function () {
  'use strict';

  const VERSION = '2026-2027-sd-smp-v1';
  const phaseMatch = location.pathname.match(/\/apps\/fase-([a-f])\//i);
  const phase = phaseMatch ? phaseMatch[1].toLowerCase() : '';
  if (!/[a-d]/.test(phase)) return;

  const level = phase === 'd' ? 'SMP/MTs' : 'SD/MI';
  const events = [
    ['2026-07-07','2026-07-11','semester','Libur Semester Genap Tahun Pelajaran 2025/2026'],
    ['2026-07-13','2026-07-13','unit','Awal Masuk Sekolah Tahun Pelajaran 2026/2027'],
    ['2026-08-17','2026-08-17','national','HUT Kemerdekaan Republik Indonesia'],
    ['2026-08-25','2026-08-25','national','Maulid Nabi Muhammad SAW'],
    ['2026-10-12','2026-10-12','unit','Hari Ulang Tahun Daerah'],
    ['2026-11-25','2026-11-25','unit','Hari Guru Nasional dan HUT PGRI (fakultatif)'],
    ['2026-12-07','2026-12-11','assessment','Sumatif Akhir Semester '+level],
    ['2026-12-14','2026-12-18','unit','Pengolahan Nilai Rapor '+level],
    ['2026-12-21','2026-12-21','report','Penyerahan Rapor '+level],
    ['2026-12-22','2026-12-31','semester','Libur Semester Ganjil'],
    ['2026-12-24','2026-12-24','national','Cuti Bersama Hari Raya Natal 2026'],
    ['2026-12-25','2026-12-25','national','Hari Raya Natal 2026'],
    ['2027-01-01','2027-01-01','national','Tahun Baru Masehi 2027'],
    ['2027-01-05','2027-01-05','national','Isra Mikraj Nabi Muhammad SAW (estimasi)'],
    ['2027-01-06','2027-01-06','unit','Awal Masuk Sekolah Semester Genap'],
    ['2027-02-06','2027-02-06','national','Tahun Baru Imlek 2578 Kongzili (estimasi)'],
    ['2027-02-08','2027-02-12','semester','Libur Awal Bulan Ramadan (estimasi)'],
    ['2027-03-01','2027-03-19','semester','Libur Ramadan dan Hari Raya Idulfitri (estimasi)'],
    ['2027-03-09','2027-03-09','national','Hari Suci Nyepi Tahun Baru Saka 1949 (estimasi)'],
    ['2027-03-10','2027-03-11','national','Hari Raya Idulfitri 1448 H (estimasi)'],
    ['2027-03-26','2027-03-26','national','Wafat Yesus Kristus (estimasi)'],
    ['2027-03-28','2027-03-28','national','Kebangkitan Yesus Kristus (estimasi)'],
    ['2027-04-12','2027-04-16','assessment','Prediksi Tes Kemampuan Akademik'],
    ['2027-05-01','2027-05-01','national','Hari Buruh Internasional'],
    ['2027-05-02','2027-05-02','unit','Hari Pendidikan Nasional'],
    ['2027-05-06','2027-05-06','national','Kenaikan Yesus Kristus (estimasi)'],
    ['2027-05-10','2027-05-14','assessment','Asesmen Akhir Jenjang'],
    ['2027-05-17','2027-05-17','national','Hari Raya Iduladha 1448 H (estimasi)'],
    ['2027-05-20','2027-05-20','national','Hari Raya Waisak (estimasi)'],
    ['2027-06-01','2027-06-01','national','Hari Lahir Pancasila'],
    ['2027-06-06','2027-06-06','national','Tahun Baru Islam 1449 H (estimasi)'],
    ['2027-06-07','2027-06-11','assessment','Asesmen Sumatif Akhir Semester Genap'],
    ['2027-06-14','2027-06-18','unit','Pengolahan Nilai Rapor'],
    ['2027-06-21','2027-06-21','report','Penyerahan Rapor'],
    ['2027-06-22','2027-06-30','semester','Libur Semester Genap']
  ].map((row, index) => ({id:'jenjang-'+(index+1),start:row[0],end:row[1],type:row[2],title:row[3]}));

  function migrateCalendar(calendar) {
    const current = calendar && typeof calendar === 'object' ? calendar : {};
    if (current.year === '2025/2026' || current.epCalendarYear || current.epLevelCalendarVersion === VERSION) return current;
    const titles = Array.isArray(current.events) ? current.events.map(e => String(e && e.title || '')).join(' | ') : '';
    const isOldDefault = !current.events || /SMA\/SMK|Penyesuaian Ramadan|Awal masuk Semester Genap/i.test(titles);
    if (!isOldDefault) return current;
    return {...current,year:'2026/2027',level,epLevelCalendarVersion:VERSION,events:events.map(e=>({...e}))};
  }

  function migrateOrders(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.orders)) return raw;
      let changed = false;
      data.orders = data.orders.map(order => {
        if (!order || typeof order !== 'object') return order;
        const next = migrateCalendar(order.calendar);
        if (next === order.calendar) return order;
        changed = true;
        return {...order,calendar:next};
      });
      return changed ? JSON.stringify(data) : raw;
    } catch (_) { return raw; }
  }

  const storage = Storage.prototype;
  if (!storage.__epLevelCalendarPatched) {
    storage.__epLevelCalendarPatched = true;
    const nativeGet = storage.getItem;
    const nativeSet = storage.setItem;
    storage.getItem = function (key) {
      const raw = nativeGet.call(this,key);
      return this === localStorage && /\.orders$/.test(String(key)) ? migrateOrders(raw) : raw;
    };
    storage.setItem = function (key,value) {
      const next = this === localStorage && /\.orders$/.test(String(key)) ? migrateOrders(String(value)) : value;
      return nativeSet.call(this,key,next);
    };
  }

  function isBlocked(date, kind) {
    const iso = date.toISOString().slice(0,10);
    const hit = events.find(e => iso >= e.start && iso <= e.end);
    if (!hit) return false;
    if (kind === 'hes') return hit.type === 'national' || hit.type === 'semester';
    return ['national','semester','assessment','report'].includes(hit.type) ||
      /pengolahan nilai|HUT PGRI|Tes Kemampuan Akademik/i.test(hit.title);
  }

  function monthStats(year, month) {
    const seenSchool = new Set(), seenLearning = new Set();
    let hes=0,heb=0;
    const days = new Date(Date.UTC(year,month+1,0)).getUTCDate();
    for (let day=1; day<=days; day++) {
      const date = new Date(Date.UTC(year,month,day));
      const dow = date.getUTCDay();
      if (dow===0 || dow===6) continue;
      const week = Math.floor((day + new Date(Date.UTC(year,month,1)).getUTCDay() - 1)/7)+1;
      if (!isBlocked(date,'hes')) { hes++; seenSchool.add(week); }
      if (!isBlocked(date,'heb')) { heb++; seenLearning.add(week); }
    }
    return [seenSchool.size,seenLearning.size,hes,heb];
  }

  function patchVisibleCalendar() {
    if (window.EPCalendarYear?.current()?.calendar?.epCalendarYear) return;
    document.querySelectorAll('.calendar-main tbody tr').forEach(row => {
      const monthCell = row.querySelector('.month-cell');
      const cells = row.querySelectorAll('.cal-stat');
      if (!monthCell || cells.length !== 4) return;
      const match = monthCell.textContent.match(/(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)\s+(20\d{2})/i);
      if (!match) return;
      const names=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
      const stats=monthStats(+match[2],names.indexOf(match[1].toUpperCase()));
      cells.forEach((cell,index)=>{const b=cell.querySelector('b');if(b && b.textContent!==String(stats[index]))b.textContent=String(stats[index]);});
    });
    document.querySelectorAll('.calendar-total').forEach(row => {
      const table=row.closest('table'), rows=[...table.querySelectorAll('tbody tr')].filter(r=>r.querySelector('.month-cell'));
      for(let i=1;i<=4;i++){const cell=row.cells[i];if(cell && !table.dataset.epYear)cell.textContent=String(rows.reduce((sum,r)=>sum+(parseInt(r.querySelectorAll('.cal-stat')[i-1]?.textContent,10)||0),0));}
    });
  }

  function migratePersisted() {
    for (let i=0;i<localStorage.length;i++) {
      const key=localStorage.key(i);
      if (!key || !/\.orders$/.test(key)) continue;
      const raw=Storage.prototype.getItem.call(localStorage,key);
      const next=migrateOrders(raw);
      if (next!==raw) Storage.prototype.setItem.call(localStorage,key,next);
    }
    const prefixMatch=location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);
    if (prefixMatch && !window.EPCalendarYear?.current()?.calendar?.epCalendarYear) {
      const prefix='eperangkat.'+decodeURIComponent(prefixMatch[1]).toLowerCase()+'.fase'+prefixMatch[2].toLowerCase()+'.v1';
      const configKeys=[];
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key && key.startsWith(prefix+'.promes-date.'))configKeys.push(key);
      }
      if(!configKeys.includes(prefix+'.promes-date.shared'))configKeys.push(prefix+'.promes-date.shared');
      for (const key of configKeys) {
        try {
          const value=JSON.parse(localStorage.getItem(key)||'{}');
          if (!value.s2 || value.s2==='2027-01-04') {
            value.s2='2027-01-06';
            localStorage.setItem(key,JSON.stringify(value));
          }
        } catch (_) {}
      }
    }
  }

  migratePersisted();
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(patchVisibleCalendar,80));
  else setTimeout(patchVisibleCalendar,80);
  let timer=0;
  new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(patchVisibleCalendar,80);}).observe(document.documentElement,{childList:true,subtree:true});
})();
