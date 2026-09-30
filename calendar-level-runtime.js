(() => {
  'use strict';
  const STABLE = 'https://e-perangkat-online-a-6xpm8q2nz-harryindrah3-6239s-projects.vercel.app/calendar-level-runtime.js?v=20260914-1';
  const match = location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);
  let year = '';
  if (match) {
    const key = `eperangkat.${decodeURIComponent(match[1] || '').toLowerCase()}.fase${String(match[2] || '').toLowerCase()}.v1.orders`;
    try {
      const store = JSON.parse(localStorage.getItem(key) || '{}');
      const id = new URLSearchParams(location.search).get('order') || store.activeId;
      const order = (store.orders || []).find(item => item?.id === id) || (store.orders || [])[0];
      year = order?.calendar?.epCalendarYear || order?.calendar?.year || order?.profile?.year || '';
    } catch (_) {}
  }
  if (year === '2024/2025') return;
  document.write('<scr' + 'ipt src="' + STABLE + '"></scr' + 'ipt>');
})();
