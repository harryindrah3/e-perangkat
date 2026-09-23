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
    const perGrade = clamp(settings.thresholds?.[order?.grade]);
    if (perGrade !== null) return perGrade;
    return clamp(settings.threshold) ?? 75;
  }

  function syncKktp(order, value) {
    if (!order || typeof order !== 'object') return;
    const kktp = clamp(value) ?? resolveKktp(order);
    order.kktp = kktp;
    order.analysis = order.analysis && typeof order.analysis === 'object' ? order.analysis : {};
    order.analysis.settings = order.analysis.settings && typeof order.analysis.settings === 'object'
      ? order.analysis.settings
      : {};
    order.analysis.settings.threshold = kktp;
    order.analysis.settings.thresholds = order.analysis.settings.thresholds && typeof order.analysis.settings.thresholds === 'object'
      ? order.analysis.settings.thresholds
      : {};
    if (order.grade) order.analysis.settings.thresholds[order.grade] = kktp;
  }

  function saveFromOrderForm(value) {
    const store = readStore();
    const order = activeOrder(store);
    const next = clamp(value);
    if (!order || next === null) return;

    const before = resolveKktp(order);
    syncKktp(order, next);
    if (before !== next) {
      order.history = Array.isArray(order.history) ? order.history : [];
      order.history.unshift({
        id: 'h-kktp-' + Date.now(),
        time: new Date().toISOString(),
        action: 'KKTP pesanan diperbarui',
        detail: `KKTP: “${before}” → “${next}”. Nilai ini digunakan otomatis pada menu Analisis Nilai.`,
        snapshot: null
      });
      order.history = order.history.slice(0, 30);
      order.updatedAt = new Date().toISOString();
    }
    localStorage.setItem(KEY, JSON.stringify(store));
  }

  function ensureOrderField() {
    const grade = document.getElementById('ordGrade');
    if (!grade) return;
    const order = activeOrder();
    if (!order) return;

    let input = document.getElementById('ordKktp');
    if (!input) {
      const label = document.createElement('label');
      label.id = 'epOrderKktpLabel';
      label.innerHTML = 'KKTP<input id="ordKktp" type="number" min="0" max="100" step="1"><small style="display:block;margin-top:4px;color:#64748b;line-height:1.3">Dipakai otomatis pada Analisis Nilai.</small>';
      const calendarLabel = document.getElementById('epCalendarYear')?.closest('label');
      (calendarLabel || grade.closest('label'))?.insertAdjacentElement('afterend', label);
      input = label.querySelector('input');
    }
    const expected = String(resolveKktp(order));
    if (document.activeElement !== input && input.value !== expected) input.value = expected;
  }

  function ensureAnalysisField() {
    const threshold = document.getElementById('analysisThreshold');
    if (!threshold) return;
    const order = activeOrder();
    if (!order) return;

    const value = resolveKktp(order);
    threshold.value = String(value);
    threshold.readOnly = true;
    threshold.setAttribute('aria-readonly', 'true');
    threshold.title = 'KKTP mengikuti Pesanan & Riwayat';

    const label = threshold.closest('label');
    if (label && !label.querySelector('.ep-kktp-analysis-note')) {
      const note = document.createElement('small');
      note.className = 'ep-kktp-analysis-note';
      note.textContent = 'Otomatis dari Pesanan & Riwayat.';
      note.style.cssText = 'display:block;margin-top:4px;color:#64748b;line-height:1.3';
      label.appendChild(note);
    }

    const badge = document.querySelector('.analysis-kktp-badge b');
    if (badge) badge.textContent = String(value);
  }

  function apply() {
    ensureOrderField();
    ensureAnalysisField();
  }

  document.addEventListener('click', event => {
    const save = event.target.closest?.('#saveOrderBtn');
    if (!save) return;
    const input = document.getElementById('ordKktp');
    if (!input) return;
    const value = input.value;
    setTimeout(() => {
      saveFromOrderForm(value);
      apply();
    }, 80);
  }, true);

  let timer = 0;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();

  let count = 0;
  const pulse = setInterval(() => {
    apply();
    if (++count >= 60) clearInterval(pulse);
  }, 400);

  window.addEventListener('storage', event => {
    if (event.key === KEY) setTimeout(apply, 0);
  });
})();
