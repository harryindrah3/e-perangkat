(() => {
  'use strict';

  const phaseMatch = location.pathname.match(/\/apps\/fase-([a-f])\/E-Perangkat_(.+?)_Fase-([A-F])/i);
  if (!phaseMatch) return;

  const subjectSlug = decodeURIComponent(phaseMatch[2] || '').toLowerCase();
  const phase = String(phaseMatch[3] || phaseMatch[1] || '').toLowerCase();
  const EXPECTED_KEY = `eperangkat.${subjectSlug}.fase${phase}.v1.orders`;
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  let busy = false;

  const clampKktp = value => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  function resolveKktp(order) {
    const direct = clampKktp(order && order.kktp);
    if (direct !== null) return direct;
    const settings = order?.analysis?.settings || {};
    const byGrade = clampKktp(settings.thresholds && settings.thresholds[order?.grade]);
    if (byGrade !== null) return byGrade;
    const common = clampKktp(settings.threshold);
    return common !== null ? common : 75;
  }

  function syncOrderKktp(order) {
    if (!order || typeof order !== 'object') return order;
    const value = resolveKktp(order);
    order.kktp = value;
    order.analysis = order.analysis && typeof order.analysis === 'object' ? order.analysis : {};
    order.analysis.settings = order.analysis.settings && typeof order.analysis.settings === 'object' ? order.analysis.settings : {};
    order.analysis.settings.threshold = value;
    order.analysis.settings.thresholds = order.analysis.settings.thresholds && typeof order.analysis.settings.thresholds === 'object' ? order.analysis.settings.thresholds : {};
    if (order.grade) order.analysis.settings.thresholds[order.grade] = value;
    return order;
  }

  function normalizeStoreRaw(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    try {
      const store = JSON.parse(raw);
      if (!store || !Array.isArray(store.orders)) return raw;
      store.orders.forEach(syncOrderKktp);
      return JSON.stringify(store);
    } catch (_) {
      return raw;
    }
  }

  function isCurrentOrderKey(key) {
    return String(key || '') === EXPECTED_KEY;
  }

  if (!Storage.prototype.__epKktpOrderRuntime) {
    Storage.prototype.__epKktpOrderRuntime = true;
    Storage.prototype.getItem = function (key) {
      const raw = nativeGet.call(this, key);
      if (this === localStorage && isCurrentOrderKey(key)) return normalizeStoreRaw(raw);
      return raw;
    };
    Storage.prototype.setItem = function (key, value) {
      const next = this === localStorage && isCurrentOrderKey(key) ? normalizeStoreRaw(String(value)) : value;
      return nativeSet.call(this, key, next);
    };
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(EXPECTED_KEY) || '{"activeId":"","orders":[]}';
      const store = JSON.parse(raw);
      if (!Array.isArray(store.orders)) store.orders = [];
      store.orders.forEach(syncOrderKktp);
      return store;
    } catch (_) {
      return { activeId: '', orders: [] };
    }
  }

  function writeStore(store) {
    if (busy) return;
    busy = true;
    try {
      store.orders?.forEach(syncOrderKktp);
      localStorage.setItem(EXPECTED_KEY, JSON.stringify(store));
    } finally {
      busy = false;
    }
  }

  function currentOrder(store = readStore()) {
    const number = document.getElementById('ordNumber')?.value?.trim();
    if (number) {
      const byNumber = store.orders.find(order => String(order.number || '').trim() === number);
      if (byNumber) return byNumber;
    }
    return store.orders.find(order => order.id === store.activeId) || store.orders[0] || null;
  }

  function addHistory(order, beforeValue, afterValue) {
    order.history = Array.isArray(order.history) ? order.history : [];
    order.history.unshift({
      id: `h-kktp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: new Date().toISOString(),
      action: 'KKTP pesanan diperbarui',
      detail: `KKTP: “${beforeValue}” → “${afterValue}”. Nilai ini digunakan otomatis pada menu Analisis Nilai.`,
      snapshot: null
    });
    order.history = order.history.slice(0, 30);
    order.updatedAt = new Date().toISOString();
  }

  function saveKktpFromOrderForm() {
    const input = document.getElementById('ordKktp');
    if (!input) return false;
    const next = clampKktp(input.value);
    if (next === null) {
      input.value = String(resolveKktp(currentOrder() || {}));
      return false;
    }
    const store = readStore();
    const order = currentOrder(store);
    if (!order) return false;
    const previous = resolveKktp(order);
    if (previous === next && clampKktp(order.kktp) === next) return false;
    order.kktp = next;
    syncOrderKktp(order);
    addHistory(order, previous, next);
    writeStore(store);
    return true;
  }

  function refreshSelectedOrder() {
    const active = document.querySelector('.order-list-item.active[data-select-order]');
    if (active && typeof active.click === 'function') active.click();
  }

  function ensureOrderUi() {
    const grade = document.getElementById('ordGrade');
    if (!grade) return;
    const store = readStore();
    const order = currentOrder(store);
    if (!order) return;
    syncOrderKktp(order);

    let input = document.getElementById('ordKktp');
    if (!input) {
      const label = document.createElement('label');
      label.id = 'epOrderKktpLabel';
      label.innerHTML = 'KKTP<input id="ordKktp" type="number" min="0" max="100" step="1"><small style="display:block;margin-top:4px;color:#64748b;line-height:1.3">Dipakai otomatis pada Analisis Nilai.</small>';
      const gradeLabel = grade.closest('label');
      gradeLabel?.insertAdjacentElement('afterend', label);
      input = label.querySelector('#ordKktp');
    }
    input.value = String(resolveKktp(order));

    const head = document.querySelector('.order-detail-head');
    if (head && !head.querySelector('.ep-kktp-order-chip')) {
      const chip = document.createElement('span');
      chip.className = 'ep-kktp-order-chip';
      chip.style.cssText = 'display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#ecfdf5;color:#166534;font-size:12px;font-weight:700;margin-left:8px';
      chip.textContent = `KKTP ${resolveKktp(order)}`;
      const badge = head.querySelector('.payment-badge');
      (badge?.parentElement || head).appendChild(chip);
    }

    const save = document.getElementById('saveOrderBtn');
    if (save && save.dataset.epKktpWrapped !== '1') {
      save.dataset.epKktpWrapped = '1';
      const original = save.onclick;
      save.onclick = function (event) {
        const kktpChanged = saveKktpFromOrderForm();
        if (!kktpChanged) return typeof original === 'function' ? original.call(this, event) : undefined;
        const nativeAlert = window.alert;
        window.alert = function (message) {
          if (/Tidak ada perubahan untuk disimpan/i.test(String(message || ''))) return;
          return nativeAlert.apply(this, arguments);
        };
        try {
          return typeof original === 'function' ? original.call(this, event) : undefined;
        } finally {
          window.alert = nativeAlert;
          setTimeout(refreshSelectedOrder, 0);
        }
      };
    }
  }

  function ensureAnalysisUi() {
    const input = document.getElementById('analysisThreshold');
    if (!input) return;
    const order = currentOrder(readStore());
    if (!order) return;
    const value = resolveKktp(order);
    input.value = String(value);
    input.readOnly = true;
    input.setAttribute('aria-readonly', 'true');
    input.title = 'KKTP mengikuti nilai pada Pesanan & Riwayat';
    const label = input.closest('label');
    if (label && !label.querySelector('.ep-kktp-analysis-note')) {
      const note = document.createElement('small');
      note.className = 'ep-kktp-analysis-note';
      note.style.cssText = 'display:block;margin-top:4px;color:#64748b;line-height:1.3';
      note.textContent = 'Otomatis dari Pesanan & Riwayat.';
      label.appendChild(note);
    }
    const badge = document.querySelector('.analysis-kktp-badge b');
    if (badge) badge.textContent = String(value);
  }

  function keepActiveOrderSynced() {
    const store = readStore();
    const order = currentOrder(store);
    if (!order) return;
    const before = JSON.stringify(order.analysis?.settings || {});
    syncOrderKktp(order);
    const after = JSON.stringify(order.analysis?.settings || {});
    if (before !== after || clampKktp(order.kktp) === null) writeStore(store);
  }

  function apply() {
    keepActiveOrderSynced();
    ensureOrderUi();
    ensureAnalysisUi();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();

  let timer = 0;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply, 35);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('storage', event => {
    if (event.key === EXPECTED_KEY) setTimeout(apply, 0);
  });
})();
