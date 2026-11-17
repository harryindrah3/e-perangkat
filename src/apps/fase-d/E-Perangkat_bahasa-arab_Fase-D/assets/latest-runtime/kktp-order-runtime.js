(() => {
  'use strict';

  const match = location.pathname.match(/\/apps\/fase-([a-f])\/E-Perangkat_(.+?)_Fase-([A-F])/i);
  if (!match) return;

  const phase = String(match[3] || match[1] || '').toLowerCase();
  const subject = decodeURIComponent(match[2] || '').toLowerCase();
  const KEY = `eperangkat.${subject}.fase${phase}.v1.orders`;

  const clamp = value => {
    if (value === '' || value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null;
  };

  function readStore() {
    try {
      const store = JSON.parse(localStorage.getItem(KEY) || '{"activeId":"","orders":[]}');
      store.orders = Array.isArray(store.orders) ? store.orders : [];
      return store;
    } catch (_) {
      return { activeId: '', orders: [] };
    }
  }

  function activeOrder(store = readStore()) {
    const selectedId = document.querySelector('[data-select-order].active')?.dataset.selectOrder;
    const number = document.getElementById('ordNumber')?.value?.trim();
    return store.orders.find(order => selectedId && order.id === selectedId)
      || (number && store.orders.find(order => String(order.number || '').trim() === number))
      || store.orders.find(order => order.id === store.activeId)
      || store.orders[0]
      || null;
  }

  function resolveKktp(order) {
    const direct = clamp(order?.kktp);
    if (direct !== null) return direct;
    const settings = order?.analysis?.settings || {};
    const¶»§q«^