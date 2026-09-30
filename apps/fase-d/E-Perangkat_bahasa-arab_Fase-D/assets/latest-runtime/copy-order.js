(function () {
  'use strict';

  const catalog = window.EPERANGKAT_CATALOG?.apps || [];
  const sync = window.PortalSync;
  if (!catalog.length || !sync || document.getElementById('epCopyOrderDialog')) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const norm = (value) => String(value || '').trim().toLocaleLowerCase('id-ID').replace(/\s+/g, ' ');
  const now = () => new Date().toISOString();
  const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  let sourceApp = null;
  let sourceOrder = null;

  const style = document.createElement('style');
  style.textContent = `
    .ep-copy-cell{white-space:nowrap;min-width:248px}
    .ep-copy-btn{border:1px solid #9cc5be;background:#eaf7f4;color:#0f5d55;border-radius:9px;padding:9px 11px;margin-right:7px;font-weight:800;cursor:pointer;white-space:nowrap}
    .ep-copy-btn:hover{background:#d8f0eb}.ep-copy-btn:focus-visible{outline:3px solid #5eead4;outline-offset:2px}
    #epCopyOrderDialog{width:min(760px,calc(100vw - 24px));max-height:92vh;border:0;border-radius:20px;padding:0;box-shadow:0 24px 80px #092f2a40;color:#173633}
    #epCopyOrderDialog::backdrop{background:#092f2a99;backdrop-filter:blur(3px)}
    .ep-copy-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:22px 24px;background:linear-gradient(135deg,#123f3a,#0f766e);color:#fff}
    .ep-copy-head small{display:block;color:#b9e9e3;font-weight:800;letter-spacing:.08em}.ep-copy-head h2{margin:5px 0 3px;font-size:25px}.ep-copy-head p{margin:0;color:#d9efec;line-height:1.4}
    .ep-copy-close{border:1px solid #ffffff55;background:#ffffff18;color:#fff;border-radius:10px;width:38px;height:38px;font-size:22px;cursor:pointer}
    .ep-copy-body{padding:20px 24px}.ep-copy-source{background:#eef8f6;border:1px solid #c9e4df;border-radius:12px;padding:13px;margin-bottom:15px;line-height:1.45}.ep-copy-source b{display:block}
    .ep-copy-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ep-copy-field label{display:block;font-size:13px;font-weight:800;margin-bottom:6px}.ep-copy-field select{width:100%;border:1px solid #c8d8d5;border-radius:10px;padding:10px;background:#fff;font:inherit}
    .ep-copy-tools{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:17px 0 9px}.ep-copy-tools h3{margin:0;font-size:17px}.ep-copy-tools div{display:flex;gap:7px}
    .ep-copy-tool{border:1px solid #c8d8d5;background:#fff;border-radius:8px;padding:7px 9px;font-weight:700;cursor:pointer}
    .ep-copy-apps{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:285px;overflow:auto;padding-right:4px}.ep-copy-app{display:flex;gap:10px;align-items:flex-start;border:1px solid #d6e1df;border-radius:11px;padding:10px;background:#fff}.ep-copy-app input{width:18px;height:18px;margin-top:2px}.ep-copy-app b,.ep-copy-app small{display:block}.ep-copy-app small{color:#6b7f7b;margin-top:2px}.ep-copy-app.duplicate{background:#f5f7f6;color:#778784}.ep-copy-app.duplicate small{color:#9a6a19}
    .ep-copy-options{margin-top:15px;border-top:1px solid #dbe5e3;padding-top:14px}.ep-copy-check{display:flex;gap:9px;align-items:flex-start;font-size:14px;line-height:1.4}.ep-copy-check input{width:18px;height:18px;margin-top:1px}.ep-copy-hint{font-size:12px;color:#6b7f7b;margin:5px 0 0 27px}
    .ep-copy-result{display:none;margin-top:13px;padding:11px;border-radius:10px;font-size:13px}.ep-copy-result.ok{display:block;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}.ep-copy-result.error{display:block;background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
    .ep-copy-foot{display:flex;justify-content:flex-end;gap:9px;padding:15px 24px;border-top:1px solid #dbe5e3;background:#f8faf9}.ep-copy-action{border:1px solid #c8d8d5;background:#fff;border-radius:10px;padding:11px 15px;font-weight:800;cursor:pointer}.ep-copy-action.primary{background:#0f766e;border-color:#0f766e;color:#fff}.ep-copy-action:disabled{opacity:.5;cursor:not-allowed}
    @media(max-width:640px){.ep-copy-head,.ep-copy-body,.ep-copy-foot{padding-left:15px;padding-right:15px}.ep-copy-grid,.ep-copy-apps{grid-template-columns:1fr}.ep-copy-apps{max-height:250px}.ep-copy-cell{white-space:normal}}
  `;
  document.head.appendChild(style);

  const dialog = document.createElement('dialog');
  dialog.id = 'epCopyOrderDialog';
  dialog.innerHTML = `
    <div class="ep-copy-head">
      <div><small>SALIN PESANAN</small><h2>Salin ke Mapel Lain</h2><p>Identitas, peserta didik, jadwal, logo, tanda tangan, dan riwayat ikut disalin.</p></div>
      <button class="ep-copy-close" type="button" aria-label="Tutup">×</button>
    </div>
    <div class="ep-copy-body">
      <div class="ep-copy-source" id="epCopySource"></div>
      <div class="ep-copy-grid">
        <div class="ep-copy-field"><label for="epCopyGrade">Kelas tujuan</label><select id="epCopyGrade"></select></div>
        <div class="ep-copy-field"><label for="epCopyPhase">Fase tujuan</label><select id="epCopyPhase" disabled></select></div>
      </div>
      <div class="ep-copy-tools"><h3>Pilih mapel tujuan</h3><div><button class="ep-copy-tool" id="epCopyAll" type="button">Pilih Semua</button><button class="ep-copy-tool" id="epCopyNone" type="button">Kosongkan</button></div></div>
      <div class="ep-copy-apps" id="epCopyApps"></div>
      <div class="ep-copy-options">
        <label class="ep-copy-check"><input id="epCopyPayment" type="checkbox" checked><span>Salin harga dan status pembayaran dari pesanan asal.</span></label>
        <p class="ep-copy-hint">Jika tidak dicentang, harga dibuat Rp0 dan statusnya Belum Lunas agar dapat diatur pada mapel tujuan.</p>
      </div>
      <div class="ep-copy-result" id="epCopyResult"></div>
    </div>
    <div class="ep-copy-foot"><button class="ep-copy-action" id="epCopyCancel" type="button">Batal</button><button class="ep-copy-action primary" id="epCopyCreate" type="button">Buat Pesanan Salinan</button></div>
  `;
  document.body.appendChild(dialog);

  const gradePhase = {};
  for (const app of catalog) for (const grade of (app.classes || [])) gradePhase[grade] = app.phase;
  const grades = romanOrder.filter((grade) => gradePhase[grade]);
  $('#epCopyGrade').innerHTML = grades.map((grade) => `<option value="${grade}">Kelas ${grade}</option>`).join('');
  $('#epCopyPhase').innerHTML = [...new Set(catalog.map((app) => app.phase))].map((phase) => `<option value="${phase}">Fase ${phase}</option>`).join('');

  function findOrder(value) {
    const split = value.indexOf('::');
    if (split < 1) return null;
    const app = catalog.find((item) => item.id === value.slice(0, split));
    if (!app) return null;
    const order = sync.getStore(app).orders?.find((item) => item.id === value.slice(split + 2));
    return order ? { app, order } : null;
  }

  function sameCustomer(a, b) {
    const waA = norm(a.whatsapp), waB = norm(b.whatsapp);
    if (waA && waB && waA === waB) return true;
    const customerA = norm(a.customer || a.profile?.teacher), customerB = norm(b.customer || b.profile?.teacher);
    const schoolA = norm(a.profile?.school || a.school), schoolB = norm(b.profile?.school || b.school);
    return Boolean(customerA && schoolA && customerA === customerB && schoolA === schoolB);
  }

  function duplicateFor(app, grade) {
    return (sync.getStore(app).orders || []).some((order) => String(order.grade || '').toUpperCase() === grade && sameCustomer(order, sourceOrder));
  }

  function renderTargets() {
    const grade = $('#epCopyGrade').value;
    const phase = gradePhase[grade] || '';
    $('#epCopyPhase').value = phase;
    const targets = catalog.filter((app) => app.phase === phase && (app.classes || []).includes(grade));
    $('#epCopyApps').innerHTML = targets.map((app) => {
      const duplicate = duplicateFor(app, grade);
      return `<label class="ep-copy-app ${duplicate ? 'duplicate' : ''}"><input type="checkbox" data-ep-copy-app value="${esc(app.id)}" ${duplicate ? 'disabled' : 'checked'}><span><b>${esc(app.subject)}</b><small>${duplicate ? 'Sudah ada—tidak akan digandakan' : `Fase ${esc(app.phase)} · Kelas ${esc(grade)}`}</small></span></label>`;
    }).join('') || '<p>Tidak ada mapel untuk kelas ini.</p>';
    updateCreateButton();
  }

  function updateCreateButton() {
    $('#epCopyCreate').disabled = !$$('[data-ep-copy-app]:checked').length;
  }

  function openCopy(value) {
    const found = findOrder(value);
    if (!found) return;
    sourceApp = found.app;
    sourceOrder = clone(found.order);
    $('#epCopySource').innerHTML = `<b>${esc(sourceOrder.number || 'Tanpa nomor')} · ${esc(sourceApp.subject)} · Kelas ${esc(sourceOrder.grade || '')}</b><span>${esc(sourceOrder.customer || sourceOrder.profile?.teacher || 'Pemesan')} · ${esc(sourceOrder.profile?.school || sourceOrder.school || 'Sekolah belum diisi')}</span>`;
    $('#epCopyGrade').value = grades.includes(String(sourceOrder.grade || '').toUpperCase()) ? String(sourceOrder.grade).toUpperCase() : grades[0];
    $('#epCopyPayment').checked = true;
    $('#epCopyResult').className = 'ep-copy-result';
    $('#epCopyResult').textContent = '';
    renderTargets();
    dialog.showModal();
  }

  function newId(index) {
    return `order-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function saveTarget(app, order, grade) {
    const store = sync.getStore(app);
    store.orders = Array.isArray(store.orders) ? store.orders : [];
    store.orders.unshift(order);
    store.activeId = order.id;
    sync.setStore(app, store);
    const prefix = app.storageKey.replace(/\.orders$/, '');
    localStorage.setItem(prefix + '.profile', JSON.stringify(order.profile || {}));
    localStorage.setItem(prefix + '.students', JSON.stringify(order.students || []));
    localStorage.setItem(prefix + '.grade', grade);
    localStorage.setItem(prefix + '.view', 'orders');
  }

  function createCopies() {
    const grade = $('#epCopyGrade').value;
    const ids = $$('[data-ep-copy-app]:checked').map((input) => input.value);
    const targets = ids.map((id) => catalog.find((app) => app.id === id)).filter(Boolean);
    const copyPayment = $('#epCopyPayment').checked;
    const result = $('#epCopyResult');
    const button = $('#epCopyCreate');
    if (!sourceOrder || !targets.length) return;
    button.disabled = true;
    const created = [];
    const skipped = [];
    const stamp = now();
    const groupId = sourceOrder.batchGroupId || `COPY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    try {
      targets.forEach((app, index) => {
        if (duplicateFor(app, grade)) {
          skipped.push(app.subject);
          return;
        }
        const order = clone(sourceOrder);
        order.id = newId(index);
        order.grade = grade;
        order.createdAt = stamp;
        order.updatedAt = stamp;
        order.batchGroupId = groupId;
        order.batchGroupLabel = `${order.profile?.school || order.school || order.customer || 'Pesanan'} · Salinan mapel`;
        order.batchSubjectCount = targets.length;
        order.copiedFrom = { appId: sourceApp.id, subject: sourceApp.subject, orderId: sourceOrder.id, orderNumber: sourceOrder.number || '', copiedAt: stamp };
        if (!copyPayment) {
          order.total = 0;
          order.paid = 0;
          order.paymentStatus = 'belum_lunas';
          order.watermark = 'BELUM LUNAS';
        }
        const originalHistory = Array.isArray(order.history) ? order.history : [];
        order.history = [{
          id: `h-${Date.now()}-${index}`,
          time: stamp,
          action: 'Pesanan disalin ke mapel lain',
          detail: `Disalin dari ${sourceApp.subject} (${sourceOrder.number || 'tanpa nomor'}) ke ${app.subject}, kelas ${grade}.`,
          snapshot: null
        }, ...originalHistory].slice(0, 30);
        saveTarget(app, order, grade);
        created.push(app.subject);
      });

      if (created.length) sync.markDirty();
      result.className = 'ep-copy-result ok';
      result.textContent = `${created.length} pesanan berhasil dibuat${skipped.length ? `; ${skipped.length} dilewati karena sudah ada` : ''}. Data akan disinkronkan otomatis.`;
      renderTargets();
      setTimeout(() => {
        if (dialog.open) dialog.close();
        location.hash = 'orders';
      }, 1400);
    } catch (error) {
      result.className = 'ep-copy-result error';
      result.textContent = `Gagal menyelesaikan salinan: ${error.message || error}. Pesanan yang sudah berhasil tetap aman.`;
      button.disabled = false;
    }
  }

  function enhanceRows() {
    $$('[data-open-order]').forEach((openButton) => {
      const cell = openButton.parentElement;
      if (!cell || cell.querySelector('[data-ep-copy-order]')) return;
      cell.classList.add('ep-copy-cell');
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'ep-copy-btn';
      copyButton.dataset.epCopyOrder = openButton.dataset.openOrder;
      copyButton.textContent = 'Salin ke Mapel';
      copyButton.addEventListener('click', () => openCopy(copyButton.dataset.epCopyOrder));
      cell.insertBefore(copyButton, openButton);
    });
  }

  $('#epCopyGrade').addEventListener('change', renderTargets);
  $('#epCopyApps').addEventListener('change', updateCreateButton);
  $('#epCopyAll').addEventListener('click', () => { $$('[data-ep-copy-app]:not(:disabled)').forEach((input) => { input.checked = true; }); updateCreateButton(); });
  $('#epCopyNone').addEventListener('click', () => { $$('[data-ep-copy-app]').forEach((input) => { input.checked = false; }); updateCreateButton(); });
  $('#epCopyCreate').addEventListener('click', createCopies);
  $('#epCopyCancel').addEventListener('click', () => dialog.close());
  $('.ep-copy-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  const orderBody = document.getElementById('orderBody');
  if (orderBody) new MutationObserver(enhanceRows).observe(orderBody, { childList: true, subtree: true });
  enhanceRows();
})();
