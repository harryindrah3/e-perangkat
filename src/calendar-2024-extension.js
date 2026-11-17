(() => {
'use strict';
const Y='2024/2025', YEARS=[Y,'2025/2026','2026/2027'];
const m=location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i); if(!m)return;
const subject=decodeURIComponent(m[1]||'').toLowerCase(), phase=String(m[2]||'').toLowerCase();
const KEY=`eperangkat.${subject}.fase${phase}.v1.orders`, base=window.EPCalendarYear; if(!base?.preset)return;
const cp=x=>JSON.parse(JSON.stringify(x)), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COMMON=[
['2024-07-07','2024-07-07','national','Tahun Baru Islam 1446 H'],
['2024-07-08','2024-07-08','unit','Permulaan Tahun Pelajaran 2024/2025'],
['2024-08-17','2024-08-17','national','HUT Kemerdekaan Republik Indonesia ke-79'],
['2024-09-16','2024-09-16','national','Maulid Nabi Muhammad SAW'],
['2024-10-12','2024-10-12','semester','HUT Kabupaten Buol ke-25 (fakultatif)'],
['2024-11-25','2024-11-25','unit','Hari Guru Nasional dan HUT PGRI (fakultatif)'],
['2024-11-27','2024-11-27','national','Pilkada Serentak 2024'],
['2024-12-23','2025-01-04','semester','Libur Semester Ganjil'],
['2024-12-25','2024-12-25','national','Hari Raya Natal'],
['2024-12-26','2024-12-26','national','Cuti Bersama Hari Raya Natal'],
['2025-01-01','2025-01-01','national','Tahun Baru 2025 Masehi'],
['2025-01-06','2025-01-06','unit','Hari pertama masuk Semester Genap'],
['2025-01-27','2025-01-27','national','Isra Mikraj Nabi Muhammad SAW'],
['2025-01-28','2025-01-28','national','Cut¶»§q«^