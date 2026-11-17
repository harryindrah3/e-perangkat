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
        ? order.calendar.ep¶»§q«^