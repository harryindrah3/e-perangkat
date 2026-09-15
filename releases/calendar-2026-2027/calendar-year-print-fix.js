(() => {
  'use strict';

  const STABLE = 'https://e-perangkat-online-a-6xpm8q2nz-harryindrah3-6239s-projects.vercel.app/calendar-year.js?v=20260915-printfix-1';
  const YEARS = ['2025/2026', '2026/2027'];

  function context() {
    const match = location.pathname.match(/\/E-Perangkat_(.+?)_Fase-([A-F])/i);
    if (!match) return null;
    const phase = match[2].toLowerCase();
    const key = 'eperangkat.' + decodeURIComponent(match[1]).toLowerCase() + '.fase' + phase + '.v1.orders';
    return { phase, key };
  }

  function overlapsSchoolYear(event, year) {
    if (!event || !event.start || !event.end) return false;
    if (year === '2025/2026') return event.end >= '2025-07-01' && event.start <= '2026-06-30';
    return event.end >= '2026-07-01' && event.start <= '2027-06-30';
  }

  function repair2025Calendar() {
    const ctx = context();
    if (!ctx || !window.EPCalendarYear?.preset) return false;
    let store;
    try { store = JSON.parse(localStorage.getItem(ctx.key) || '{}'); } catch (_) { return false; }
    if (!Array.isArray(store.orders)) return false;

    const orderId = new URLSearchParams(location.search).get('order') || store.activeId;
    let changed = false;

    for (const order of store.orders) {
      if (!order || (orderId && order.id !== orderId)) continue;

      const profileYear = YEARS.includes(order.profile?.year) ? order.profile.year : null;
      const calendarYear = YEARS.includes(order.calendar?.epCalendarYear)
        ? order.calendar.epCalendarYear
        : (YEARS.includes(order.calendar?.year) ? order.calendar.year : null);
      const selectedYear = profileYear || calendarYear;
      if (selectedYear !== '2025/2026') continue;

      const events = Array.isArray(order.calendar?.events) ? order.calendar.events : [];
      const inRange = events.filter(event => overlapsSchoolYear(event, '2025/2026'));
      const calendarLooksWrong = order.calendar?.year !== '2025/2026'
        || order.calendar?.epCalendarYear !== '2025/2026'
        || inRange.length === 0;

      if (calendarLooksWrong) {
        order.calendarYears = order.calendarYears && typeof order.calendarYears === 'object' ? order.calendarYears : {};
        if (order.calendar && order.calendar.year && order.calendar.year !== '2025/2026') {
          order.calendarYears[order.calendar.year] = JSON.parse(JSON.stringify(order.calendar));
        }
        const preset = window.EPCalendarYear.preset('2025/2026', ctx.phase);
        order.calendar = JSON.parse(JSON.stringify(preset));
        order.calendar.year = '2025/2026';
        order.calendar.epCalendarYear = '2025/2026';
        order.profile = { ...(order.profile || {}), year: '2025/2026' };
        order.calendarYears['2025/2026'] = JSON.parse(JSON.stringify(order.calendar));
        changed = true;
      }
    }

    if (changed) localStorage.setItem(ctx.key, JSON.stringify(store));
    return changed;
  }

  function nudgeCalendarRenderer() {
    const marker = document.createElement('span');
    marker.hidden = true;
    marker.dataset.epCalendarRepair = '2025-2026';
    (document.body || document.documentElement).appendChild(marker);
    setTimeout(() => marker.remove(), 0);
  }

  const script = document.createElement('script');
  script.src = STABLE;
  script.async = false;
  script.onload = () => {
    repair2025Calendar();
    nudgeCalendarRenderer();
    setTimeout(() => { repair2025Calendar(); nudgeCalendarRenderer(); }, 120);
    setTimeout(() => { repair2025Calendar(); nudgeCalendarRenderer(); }, 600);
  };
  script.onerror = () => console.error('Gagal memuat runtime Kalender Pendidikan.');
  (document.head || document.documentElement).appendChild(script);
})();
