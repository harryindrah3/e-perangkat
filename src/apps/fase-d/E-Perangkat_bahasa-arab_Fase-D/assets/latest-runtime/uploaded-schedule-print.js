(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const section = params.get('section') || 'all';
  if (!['all', 'core'].includes(section)) return;

  function storeKey() {
    const match = location.pathname.match(/\/fase-([a-f])\/E-Perangkat_([^/]+)_Fase-[A-F]/i);
    return match ? `eperangkat.${match[2].toLowerCase()}.fase${match[1].toLowerCase()}.v1.orders` : '';
  }

  function safeJson(value, fallback) {
    try {
      return JSON.parse(value || '') || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function activeData() {
    const key = storeKey();
    if (!key) return { profile: {}, schedule: {} };
    const store = safeJson(localStorage.getItem(key), { activeId: '', orders: [] });
    const orderId = params.get('order') || '';
    const orders = Array.isArray(store.orders) ? store.orders : [];
    const order = orders.find((item) => orderId && item.id == orderId) ||
      orders.find((item) => item.id === store.activeId) || orders[0] || {};
    const prefix = key.replace(/\.orders$/, '');
    const localProfile = safeJson(localStorage.getItem(`${prefix}.profile`), {});
    const scheduleKey = `${prefix}.uploaded-schedule.${String(order.id || 'profile')}`;
    const schedule = safeJson(localStorage.getItem(scheduleKey), {});
    return {
      order,
      profile: { ...(order.profile || {}), ...localProfile },
      schedule
    };
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g,¶»§q«^