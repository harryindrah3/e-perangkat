(() => {
  'use strict';

  const IS_PRINT = /\/apps\/.+\/print\.html$/i.test(location.pathname);

  if (!IS_PRINT) {
    const script = document.createElement('script');
    script.src = '/calendar-year-print-fix.js?v=20260915-printfix-1';
    script.async = false;
    (document.head || document.documentElement).appendChild(script);
    return;
  }

  const TARGET_YEAR = '2025/2026';
  const match = location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);
  if (!match) return;

  const subject = decodeURIComponent(match[1] || '').toLowerCase();
  const phase = String(match[2] || '').toLowerCase();
  const key = `eperangkat.${subject}.fase${phase}.v1.orders`;

  const rows2025 = [
    ['2025-07-01','2025-07-12','semester','Libur sebelum tahun pelajaran baru'],
    ['2025-07-14','2025-07-14','unit','Awal tahun pelajaran 2025/2026'],
    ['2025-07-15',/[abc]/.test(phase)?'2025-07-26':'2025-07-19','unit','MPLS'],
    ['2025-08-17','2025-08-17','national','Kemerdekaan RI'],
    ['2025-08-18','2025-08-18','national','Cuti bersama Kemerdekaan RI'],
    ['2025-09-05','2025-09-05','national','Maulid Nabi Muhammad SAW'],
    ['2025-10-12','2025-10-12','unit','HUT Kabupaten Buol (fakultatif)'],
    ['2025-11-25','2025-11-25','unit','Hari Guru dan HUT PGRI (fakultatif)'],
    ['2025-12-08','2025-12-13','assessment','Asesmen akhir semester ganjil'],
    ['2025-12-15','2025-12-19','unit','Pengolahan nilai rapor'],
    ['2025-12-20','2025-12-20','report','Pembagian rapor ganjil'],
    ['2025-12-22','2026-01-03','semester','Libur semester ganjil'],
    ['2025-12-25','2025-12-25','national','Natal'],
    ['2025-12-26','2025-12-26','national','Cuti bersama Natal'],
    ['2026-01-01','2026-01-01','national','Tahun Baru Masehi'],
    ['2026-01-05','2026-01-05','unit','Awal semester genap'],
    ['2026-01-16','2026-01-16','national','Isra Mikraj'],
    ['2026-02-16','2026-02-21','unit','Belajar mandiri di rumah pada awal Ramadan'],
    ['2026-02-16','2026-02-16','national','Cuti bersama Imlek'],
    ['2026-02-17','2026-02-17','national','Tahun Baru Imlek'],
    ['2026-03-16','2026-03-25','semester','Libur sekitar Idulfitri'],
    ['2026-03-18','2026-03-18','national','Cuti bersama Nyepi'],
    ['2026-03-19','2026-03-19','national','Nyepi'],
    ['2026-03-20','2026-03-20','national','Cuti bersama Idulfitri'],
    ['2026-03-21','2026-03-22','national','Idulfitri 1447 H'],
    ['2026-03-23','2026-03-24','national','Cuti bersama Idulfitri'],
    ['2026-03-26','2026-03-26','unit','Masuk setelah libur Idulfitri'],
    ['2026-04-03','2026-04-03','national','Wafat Yesus Kristus'],
    ['2026-04-05','2026-04-05','national','Paskah'],
    ['2026-05-01','2026-05-01','national','Hari Buruh'],
    ['2026-05-02','2026-05-02','unit','Hari Pendidikan Nasional'],
    ['2026-05-14','2026-05-14','national','Kenaikan Yesus Kristus'],
    ['2026-05-15','2026-05-15','national','Cuti bersama Kenaikan Yesus Kristus'],
    ['2026-05-27','2026-05-27','national','Iduladha'],
    ['2026-05-28','2026-05-28','national','Cuti bersama Iduladha'],
    ['2026-05-31','2026-05-31','national','Waisak'],
    ['2026-06-01','2026-06-01','national','Hari Lahir Pancasila'],
    ['2026-06-08','2026-06-13','assessment','Asesmen akhir semester genap'],
    ['2026-06-15','2026-06-19','unit','Pengolahan nilai rapor'],
    ['2026-06-16','2026-06-16','national','Tahun Baru Islam'],
    ['2026-06-20','2026-06-20','report','Pembagian rapor genap'],
    ['2026-06-22','2026-06-30','semester','Libur akhir tahun pelajaran']
  ];

  function preset2025() {
    return {
      year: TARGET_YEAR,
      epCalendarYear: TARGET_YEAR,
      schoolDays: 6,
      reference: 'buol-2025-2026',
      events: rows2025.map((row, index) => ({
        id: 'y25-' + index,
        start: row[0],
        end: row[1],
        type: row[2],
        title: row[3]
      }))
    };
  }

  function readStore() {
    try {
      const store = JSON.parse(localStorage.getItem(key) || '{}');
      store.orders = Array.isArray(store.orders) ? store.orders : [];
      return store;
    } catch (_) {
      return { activeId: '', orders: [] };
    }
  }

  function activeOrder(store = readStore()) {
    const orderId = new URLSearchParams(location.search).get('order') || store.activeId;
    return store.orders.find(order => order?.id === orderId) || store.orders[0] || null;
  }

  function inTargetRange(event) {
    return Boolean(event?.start && event?.end && event.end >= '2025-07-01' && event.start <= '2026-06-30');
  }

  function repairDataOnly() {
    const store = readStore();
    if (!store.orders.length) return store;
    const requestedId = new URLSearchParams(location.search).get('order') || store.activeId;
    let changed = false;

    for (const order of store.orders) {
      if (!order || (requestedId && order.id !== requestedId)) continue;
      const selectedYear = order.calendar?.epCalendarYear || order.calendar?.year || order.profile?.year;
      if (selectedYear !== TARGET_YEAR && order.profile?.year !== TARGET_YEAR) continue;

      const events = Array.isArray(order.calendar?.events) ? order.calendar.events : [];
      const looksWrong = order.calendar?.year !== TARGET_YEAR
        || order.calendar?.epCalendarYear !== TARGET_YEAR
        || events.filter(inTargetRange).length === 0;

      if (!looksWrong) continue;

      order.calendarYears = order.calendarYears && typeof order.calendarYears === 'object' ? order.calendarYears : {};
      if (order.calendar?.year && order.calendar.year !== TARGET_YEAR) {
        order.calendarYears[order.calendar.year] = JSON.parse(JSON.stringify(order.calendar));
      }
      order.calendar = preset2025();
      order.calendarYears[TARGET_YEAR] = JSON.parse(JSON.stringify(order.calendar));
      order.profile = { ...(order.profile || {}), year: TARGET_YEAR };
      changed = true;
    }

    if (changed) localStorage.setItem(key, JSON.stringify(store));
    return store;
  }

  const store = repairDataOnly();

  window.EPCalendarYear = {
    preset(year) {
      if (year === TARGET_YEAR) return preset2025();
      const current = activeOrder(readStore())?.calendar;
      return current && current.year === year ? JSON.parse(JSON.stringify(current)) : { year, epCalendarYear: year, events: [] };
    },
    current() {
      return activeOrder(readStore());
    },
    dispose() {}
  };

  document.documentElement.dataset.epPrintCalendarMode = 'data-only';
})();
