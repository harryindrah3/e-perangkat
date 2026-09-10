(function () {
  'use strict';

  const byId = (id) => document.getElementById(id);

  function storeKey() {
    const match = location.pathname.match(
      /\/fase-([a-f])\/E-Perangkat_([^/]+)_Fase-[A-F]/i
    );
    return match
      ? `eperangkat.${match[2].toLowerCase()}.fase${match[1].toLowerCase()}.v1.orders`
      : '';
  }

  function currentOrder() {
    const key = storeKey();
    const number = String(byId('ordNumber')?.value || '').trim();
    if (!key) return null;

    try {
      const store = JSON.parse(localStorage.getItem(key) || '{}');
      const order =
        (store.orders || []).find(
          (item) => number && String(item.number || '').trim() === number
        ) ||
        (store.orders || []).find((item) => item.id === store.activeId) ||
        (store.orders || [])[0];
      return order ? { key, store, order } : null;
    } catch (_) {
      return null;
    }
  }

  function synchronizeVisibleFields(context) {
    if (!context) return null;

    const { key, store, order } = context;
    order.profile = order.profile || {};

    const fields = {
      profileGovernment: 'government',
      profileDepartment: 'department',
      profileSchool: 'school',
      profileProgram: 'program',
      profileRombel: 'rombel',
      profileAddress: 'address',
      profileTeacherRole: 'teacherRole',
      profileTeacher: 'teacher',
      profileTeacherIdType: 'teacherIdType',
      profileTeacherId: 'teacherId',
      profilePrincipal: 'principal',
      profilePrincipalIdType: 'principalIdType',
      profilePrincipalId: 'principalId',
      profileYear: 'year',
      profilePlace: 'place',
      profileDate: 'date',
      profileDateSemester2: 'dateSemester2',
      profileRegion: 'region',
      profileLogoMode: 'logoMode',
      profileCustomLogoLeft: 'customLogoLeft',
      profileCustomLogoRight: 'customLogoRight',
      profileCustomLogoRightEnabled: 'customLogoRightEnabled'
    };

    for (const [elementId, profileKey] of Object.entries(fields)) {
      const element = byId(elementId);
      if (element) order.profile[profileKey] = element.value;
    }

    const grade = byId('ordGrade');
    if (grade) order.grade = grade.value;

    const status = byId('ordStatus');
    if (status) order.paymentStatus = status.value;

    order.school = order.profile.school || order.school || '';
    store.activeId = order.id;
    localStorage.setItem(key, JSON.stringify(store));

    const prefix = key.replace(/\.orders$/, '');
    localStorage.setItem(`${prefix}.profile`, JSON.stringify(order.profile));
    localStorage.setItem(`${prefix}.students`, JSON.stringify(order.students || []));
    localStorage.setItem(`${prefix}.grade`, String(order.grade || ''));

    return order;
  }

  document.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest?.(
        '#batchClassPdfBtnReliable,#subject16PdfBtnReliable,#autoPdfBothBtn'
      );
      if (button) {
        synchronizeVisibleFields(currentOrder());
        if (button.id !== 'autoPdfBothBtn') {
          byId('batchClassReliableProgress')?.remove();
          byId('subjectReliableProgress')?.remove();
        } else {
          beginProgress(button);
        }
      }
    },
    true
  );

  const reliableProgressIds = [
    'batchClassReliableProgress',
    'subjectReliableProgress'
  ];
  let activeProgress = null;
  let progressTimer = 0;
  let finishTimer = 0;

  function addProgressStyles() {
    if (byId('epBatchProgressStyles')) return;
    const style = document.createElement('style');
    style.id = 'epBatchProgressStyles';
    style.textContent = `
      #epBatchProgressOverlay[hidden]{display:none!important}
      #epBatchProgressOverlay{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483000;width:min(570px,calc(100vw - 24px));padding:16px 18px;border:1px solid #b9d8d2;border-radius:16px;background:rgba(255,255,255,.98);box-shadow:0 18px 50px rgba(15,23,42,.25);color:#0f172a;font-family:inherit;box-sizing:border-box;backdrop-filter:blur(10px)}
      #epBatchProgressOverlay *{box-sizing:border-box}
      .ep-batch-progress-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:12px}
      .ep-batch-progress-head small{display:block;margin-bottom:3px;color:#0f766e;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      .ep-batch-progress-head b{display:block;font-size:16px;line-height:1.25}
      .ep-batch-progress-percent{min-width:74px;color:#0f766e;font-size:29px;font-weight:900;line-height:1;text-align:right}
      .ep-batch-progress-track{position:relative;height:18px;overflow:hidden;border-radius:999px;background:#dce8e6;box-shadow:inset 0 1px 2px rgba(15,23,42,.12)}
      .ep-batch-progress-fill{height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#0f766e,#14b8a6);transition:width .3s ease}
      .ep-batch-progress-track span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:900;text-shadow:0 1px 2px rgba(0,0,0,.3)}
      .ep-batch-progress-meta{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:#475569;font-size:12px;font-weight:700}
      .ep-batch-progress-current{margin:8px 0 0;color:#334155;font-size:12px;line-height:1.4}
      #epBatchProgressOverlay.ep-progress-finished{border-color:#86c8aa;background:rgba(242,253,248,.98)}
      #epBatchProgressOverlay.ep-progress-finished .ep-batch-progress-fill{background:linear-gradient(90deg,#15803d,#22c55e)}
      #epBatchProgressClose{position:absolute;right:8px;top:7px;border:0;background:transparent;color:#64748b;font-size:20px;line-height:1;cursor:pointer}
      @media(max-width:600px){#epBatchProgressOverlay{bottom:10px;padding:14px}.ep-batch-progress-percent{font-size:25px}.ep-batch-progress-meta{flex-direction:column;gap:3px}}
    `;
    document.head.appendChild(style);
  }

  function progressOverlay() {
    let overlay = byId('epBatchProgressOverlay');
    if (overlay) return overlay;

    addProgressStyles();
    overlay = document.createElement('section');
    overlay.id = 'epBatchProgressOverlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
      <button id="epBatchProgressClose" type="button" aria-label="Tutup progres">×</button>
      <div class="ep-batch-progress-head">
        <div><small>PROGRES PEMBUATAN PDF</small><b data-ep-progress-title>Batch PDF sedang diproses</b></div>
        <div class="ep-batch-progress-percent" data-ep-progress-percent>0%</div>
      </div>
      <div class="ep-batch-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="ep-batch-progress-fill" data-ep-progress-fill></div><span data-ep-progress-bar-label>0%</span>
      </div>
      <div class="ep-batch-progress-meta"><span data-ep-progress-count>0/0 PDF selesai</span><span data-ep-progress-result>Berhasil 0 · Gagal 0</span></div>
      <p class="ep-batch-progress-current" data-ep-progress-current>Menyiapkan data batch…</p>
    `;
    document.body.appendChild(overlay);
    byId('epBatchProgressClose')?.addEventListener('click', () => {
      overlay.hidden = true;
    });
    return overlay;
  }

  function renderProgress(update = {}) {
    const overlay = progressOverlay();
    if (overlay.hidden) overlay.hidden = false;

    const percent = Math.max(0, Math.min(100, Number(update.percent) || 0));
    const processed = Math.max(0, Number(update.processed) || 0);
    const total = Math.max(0, Number(update.total) || 0);
    const ok = Math.max(0, Number(update.ok) || 0);
    const fail = Math.max(0, Number(update.fail) || 0);

    overlay.querySelector('[data-ep-progress-title]').textContent =
      update.title || 'Batch PDF sedang diproses';
    overlay.querySelector('[data-ep-progress-percent]').textContent = `${percent}%`;
    overlay.querySelector('[data-ep-progress-fill]').style.width = `${percent}%`;
    overlay.querySelector('[data-ep-progress-bar-label]').textContent = `${percent}%`;
    overlay.querySelector('[data-ep-progress-count]').textContent = total
      ? `${processed}/${total} PDF selesai`
      : `${processed} PDF selesai`;
    overlay.querySelector('[data-ep-progress-result]').textContent =
      `Berhasil ${ok} · Gagal ${fail}`;
    overlay.querySelector('[data-ep-progress-current]').textContent =
      update.current || 'Masih memproses batch PDF…';

    const track = overlay.querySelector('[role="progressbar"]');
    track.setAttribute('aria-valuenow', String(percent));
    overlay.classList.toggle('ep-progress-finished', Boolean(update.finished));

    if (update.finished) {
      clearTimeout(finishTimer);
      finishTimer = setTimeout(() => {
        if (!activeProgress) overlay.hidden = true;
      }, 7000);
    }
  }

  function reliablePanel() {
    for (const id of reliableProgressIds) {
      const panel = byId(id);
      if (panel) return panel;
    }
    return null;
  }

  function parseReliableProgress(panel) {
    const headline = panel.querySelector('[data-r-title]')?.textContent || '';
    const result = panel.querySelector('[data-r-counts]')?.textContent || '';
    const current = panel.querySelector('[data-r-current]')?.textContent || '';
    const elapsed = panel.querySelector('[data-r-elapsed]')?.textContent || '';
    const numbers = headline.match(/(\d+)%\s*·\s*(\d+)\s*\/\s*(\d+)/i);
    const counts = result.match(/Berhasil\s+(\d+)\s*·\s*Gagal\s+(\d+)/i);
    const percent = Number(numbers?.[1] || 0);
    const processed = Number(numbers?.[2] || 0);
    const total = Number(numbers?.[3] || activeProgress?.total || 0);
    const ok = Number(counts?.[1] || 0);
    const fail = Number(counts?.[2] || 0);
    const finished = /Proses selesai/i.test(elapsed) || (total > 0 && processed >= total);
    return { percent, processed, total, ok, fail, current, finished };
  }

  function stopProgressPolling() {
    clearInterval(progressTimer);
    progressTimer = 0;
  }

  function pollReliableProgress() {
    stopProgressPolling();
    let emptyChecks = 0;
    progressTimer = setInterval(() => {
      if (!activeProgress || activeProgress.mode !== 'reliable') {
        stopProgressPolling();
        return;
      }

      const panel = reliablePanel();
      if (!panel) {
        emptyChecks += 1;
        const button = byId(activeProgress.buttonId);
        if (emptyChecks > 20 && !button?.disabled) {
          activeProgress = null;
          stopProgressPolling();
          progressOverlay().hidden = true;
        }
        return;
      }

      emptyChecks = 0;
      const value = parseReliableProgress(panel);
      activeProgress.total = value.total;
      renderProgress({
        ...value,
        title: activeProgress.title,
        current: value.finished
          ? `Selesai · ${value.ok} PDF berhasil${value.fail ? ` · ${value.fail} gagal` : ''}`
          : value.current || 'Masih membuat PDF…'
      });

      if (value.finished) {
        activeProgress = null;
        stopProgressPolling();
      }
    }, 250);
  }

  function beginProgress(button) {
    clearTimeout(finishTimer);
    const reliable = button.id !== 'autoPdfBothBtn';
    activeProgress = {
      mode: reliable ? 'reliable' : 'auto',
      buttonId: button.id,
      title:
        button.id === 'batchClassPdfBtnReliable'
          ? 'Batch semua mapel Guru Kelas'
          : button.id === 'subject16PdfBtnReliable'
            ? 'Batch PDF Kelas 1–6'
            : 'PDF Semester 1 dan 2',
      total: button.id === 'subject16PdfBtnReliable' ? 12 : button.id === 'autoPdfBothBtn' ? 2 : 0,
      processed: 0,
      ok: 0,
      fail: 0
    };
    renderProgress({
      percent: 0,
      processed: 0,
      total: activeProgress.total,
      ok: 0,
      fail: 0,
      title: activeProgress.title,
      current: 'Menyiapkan data batch…'
    });
    if (reliable) pollReliableProgress();
  }

  function appStoreKey(appPath) {
    const match = String(appPath || '').match(
      /\/apps\/fase-([a-f])\/E-Perangkat_([^/]+)_Fase-[A-F]/i
    );
    return match
      ? `eperangkat.${match[2].toLowerCase()}.fase${match[1].toLowerCase()}.v1.orders`
      : '';
  }

  function scopedStorage(key) {
    const snapshot = {};
    const prefix = String(key || '').replace(/\.orders$/, '');
    if (!key || !prefix) return snapshot;

    for (let index = 0; index < localStorage.length; index += 1) {
      const itemKey = localStorage.key(index) || '';
      if (itemKey === key || itemKey.startsWith(`${prefix}.`)) {
        snapshot[itemKey] = localStorage.getItem(itemKey) || '';
      }
    }
    return snapshot;
  }

  function remapStorage(snapshot, sourceKey, targetKey) {
    if (!sourceKey || !targetKey || sourceKey === targetKey) return { ...snapshot };
    const sourcePrefix = sourceKey.replace(/\.orders$/, '');
    const targetPrefix = targetKey.replace(/\.orders$/, '');
    const remapped = {};

    for (const [key, value] of Object.entries(snapshot || {})) {
      if (key === sourceKey) remapped[targetKey] = value;
      else if (key.startsWith(`${sourcePrefix}.`)) {
        remapped[`${targetPrefix}${key.slice(sourcePrefix.length)}`] = value;
      }
    }
    return remapped;
  }

  function applyManualPrintParity(input, init) {
    try {
      const raw =
        typeof input === 'string' || input instanceof URL ? String(input) : input.url;
      const url = new URL(raw, location.href);
      const isPdfPost =
        url.pathname === '/api/pdf' &&
        String(init?.method || 'GET').toUpperCase() === 'POST' &&
        typeof init?.body === 'string';
      if (!isPdfPost) return init;

      const payload = JSON.parse(init.body);
      const sourceKey = storeKey();
      const targetKey = appStoreKey(payload.appPath);
      if (!sourceKey || !targetKey) return init;

      // Cetak manual membaca seluruh state berawalan prefix aplikasi. Batch lama
      // hanya mengirim orders/profile/students/grade sehingga state lainnya dapat
      // kembali ke default. Salin state dengan urutan prioritas yang sama:
      // sumber yang dipetakan -> state aplikasi target -> payload pesanan aktif.
      const sourceSnapshot = remapStorage(
        scopedStorage(sourceKey),
        sourceKey,
        targetKey
      );
      const targetSnapshot = scopedStorage(targetKey);
      payload.storage = {
        ...sourceSnapshot,
        ...targetSnapshot,
        ...(payload.storage || {})
      };

      let body = JSON.stringify(payload);
      if (body.length > 3_800_000) {
        for (const key of Object.keys(payload.storage)) {
          if (/\.legacy\.|\.view$|\.cache\./i.test(key)) delete payload.storage[key];
        }
        body = JSON.stringify(payload);
      }

      return { ...init, body };
    } catch (_) {
      return init;
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.(
      '#batchClassPdfBtnReliable,#subject16PdfBtnReliable'
    );
    if (button) setTimeout(() => beginProgress(button), 0);
  });

  const fetchBeforeProgress = window.fetch.bind(window);
  window.fetch = function (input, init) {
    let isPdfPost = false;
    try {
      const raw = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
      const url = new URL(raw, location.href);
      isPdfPost =
        url.pathname === '/api/pdf' &&
        String(init?.method || 'GET').toUpperCase() === 'POST' &&
        activeProgress?.mode === 'auto';
    } catch (_) {}

    if (isPdfPost) {
      renderProgress({
        ...activeProgress,
        percent: Math.round((activeProgress.processed / activeProgress.total) * 100),
        current: `Sedang membuat PDF ${activeProgress.processed + 1}/${activeProgress.total}…`
      });
    }

    const requestInit = applyManualPrintParity(input, init);
    const request = fetchBeforeProgress(input, requestInit);
    if (!isPdfPost) return request;

    return request.then(
      (response) => {
        if (!activeProgress || activeProgress.mode !== 'auto') return response;
        activeProgress.processed += 1;
        if (response.ok) activeProgress.ok += 1;
        else activeProgress.fail += 1;
        const finished = activeProgress.processed >= activeProgress.total;
        renderProgress({
          ...activeProgress,
          percent: Math.round((activeProgress.processed / activeProgress.total) * 100),
          finished,
          current: finished
            ? `Selesai · ${activeProgress.ok} PDF berhasil${activeProgress.fail ? ` · ${activeProgress.fail} gagal` : ''}`
            : `PDF ${activeProgress.processed}/${activeProgress.total} selesai`
        });
        if (finished) activeProgress = null;
        return response;
      },
      (error) => {
        if (activeProgress?.mode === 'auto') {
          activeProgress.processed += 1;
          activeProgress.fail += 1;
          const finished = activeProgress.processed >= activeProgress.total;
          renderProgress({
            ...activeProgress,
            percent: Math.round((activeProgress.processed / activeProgress.total) * 100),
            finished,
            current: finished
              ? `Selesai · ${activeProgress.ok} PDF berhasil · ${activeProgress.fail} gagal`
              : 'PDF gagal · melanjutkan file berikutnya'
          });
          if (finished) activeProgress = null;
        }
        throw error;
      }
    );
  };

  // Generator batch menerima snapshot localStorage ber-prefix aplikasi yang sama
  // lengkapnya dengan state yang dibaca halaman cetak manual.
})();
