(function () {
  'use strict';


  const RUNTIME_VERSION = '20260910-5';
  if (document.documentElement?.dataset.epDeleteOrderRuntime === RUNTIME_VERSION) return;
  document.documentElement.dataset.epDeleteOrderRuntime = RUNTIME_VERSION;
  window.__epDeleteOrderInstalled = true;
  window.__epDeleteOrderVersion = RUNTIME_VERSION;


  const DELETE_STYLE_ID = 'ep-delete-order-style';
  const DELETE_DIALOG_ID = 'ep-delete-order-dialog';
  let pendingDelete = null;


  function installStyle() {
    let style = document.getElementById(DELETE_STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = DELETE_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      .ep-order-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      .ep-order-actions .ep-copy-btn{margin-right:0}
      .ep-delete-order{appearance:none;border:1px solid #fecaca;background:#fff;color:#b91c1c;border-radius:12px;padding:11px 14px;font:700 13px/1 inherit;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,transform .15s}
      .ep-delete-order:hover{background:#fef2f2;border-color:#fca5a5}
      .ep-delete-order:active{transform:translateY(1px)}
      .ep-delete-order:focus-visible{outline:3px solid rgba(220,38,38,.22);outline-offset:2px}
      #ep-delete-order-dialog{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:14px;background:#092f2a99;backdrop-filter:blur(3px)}
      #ep-delete-order-dialog[hidden]{display:none!important}
      .ep-delete-dialog-panel{width:min(470px,calc(100vw - 28px));border-radius:20px;color:#173633;background:#fff;box-shadow:0 24px 80px #092f2a55;overflow:hidden}
      .ep-delete-dialog-head{display:flex;gap:14px;align-items:flex-start;padding:22px 24px 15px}
      .ep-delete-dialog-icon{display:grid;place-items:center;flex:0 0 44px;height:44px;border-radius:14px;background:#fef2f2;color:#b91c1c;font-size:23px;font-weight:900}
      .ep-delete-dialog-head h2{margin:0 0 5px;font-size:22px;color:#7f1d1d}.ep-delete-dialog-head p{margin:0;color:#64748b;line-height:1.45}
      .ep-delete-dialog-order{margin:0 24px 20px;padding:14px 15px;border:1px solid #fecaca;border-radius:13px;background:#fff7f7;line-height:1.45}
      .ep-delete-dialog-order b,.ep-delete-dialog-order span{display:block}.ep-delete-dialog-order span{margin-top:3px;color:#64748b;font-size:13px}
      .ep-delete-dialog-actions{display:flex;justify-content:flex-end;gap:10px;padding:15px 24px;border-top:1px solid #e5e7eb;background:#f8fafc}
      .ep-delete-dialog-actions button{border-radius:11px;padding:11px 15px;font:800 14px/1 inherit;cursor:pointer}
      .ep-delete-cancel{border:1px solid #cbd5e1;background:#fff;color:#334155}.ep-delete-confirm{border:1px solid #b91c1c;background:#b91c1c;color:#fff}
      .ep-delete-confirm:hover{background:#991b1b}.ep-delete-confirm:focus-visible,.ep-delete-cancel:focus-visible{outline:3px solid rgba(220,38,38,.22);outline-offset:2px}
      @media (max-width:760px){.ep-order-actions{justify-content:flex-start}.ep-delete-order{min-height:42px}}
    `;
  }


  function installDialog() {
    const current = document.getElementById(DELETE_DIALOG_ID);
    if (current && current.querySelector('.ep-delete-dialog-panel')) return;
    if (current) current.remove();
    const dialog = document.createElement('div');
    dialog.id = DELETE_DIALOG_ID;
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'ep-delete-order-title');
    dialog.innerHTML = `
      <div class="ep-delete-dialog-panel">
        <div class="ep-delete-dialog-head">
          <div class="ep-delete-dialog-icon" aria-hidden="true">!</div>
          <div><h2 id="ep-delete-order-title">Hapus pesanan?</h2><p>Pastikan pesanan yang dipilih sudah benar.</p></div>
        </div>
        <div class="ep-delete-dialog-order"><b id="ep-delete-order-name"></b><span id="ep-delete-order-subject"></span></div>
        <div class="ep-delete-dialog-actions">
          <button class="ep-delete-cancel" type="button">Batal</button>
          <button class="ep-delete-confirm" type="button">Ya, Hapus Pesanan</button>
        </div>
      </div>
    `;
    dialog.querySelector('.ep-delete-cancel').addEventListener('click', () => {
      pendingDelete = null;
      dialog.hidden = true;
    });
    dialog.querySelector('.ep-delete-confirm').addEventListener('click', commitDelete);
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        pendingDelete = null;
        dialog.hidden = true;
      }
    });
    document.body.appendChild(dialog);
  }


  function splitKey(value) {
    const separator = String(value || '').indexOf('::');
    if (separator < 1) return null;
    return {
      appId: value.slice(0, separator),
      orderId: value.slice(separator + 2)
    };
  }


  function findOrder(key) {
    const catalog = window.EPERANGKAT_CATALOG && window.EPERANGKAT_CATALOG.apps;
    const sync = window.PortalSync;
    if (!Array.isArray(catalog) || !sync) return null;
    const app = catalog.find(item => item.id === key.appId);
    if (!app) return null;
    const store = sync.getStore(app);
    const order = (store.orders || []).find(item => item.id === key.orderId);
    return order ? { app, store, order, sync } : null;
  }


  function orderName(entry) {
    const number = entry.order.number || 'Tanpa nomor';
    const customer = entry.order.customer || entry.order.profile?.school || entry.app.subject;
    return number + ' — ' + customer;
  }


  function openDeleteDialog(value) {
    const key = splitKey(value);
    const entry = key && findOrder(key);
    if (!entry) {
      alert('Pesanan tidak ditemukan. Silakan tekan Perbarui Data lalu coba lagi.');
      return;
    }


    installDialog();
    pendingDelete = key;
    document.getElementById('ep-delete-order-name').textContent = orderName(entry);
    document.getElementById('ep-delete-order-subject').textContent =
      entry.app.subject + ' · Fase ' + entry.app.phase +
      ' · akan dihapus dari mapel asal dan database.';
    const dialog = document.getElementById(DELETE_DIALOG_ID);
    dialog.hidden = false;
    dialog.querySelector('.ep-delete-cancel').focus();
  }


  function commitDelete() {
    const key = pendingDelete;
    const entry = key && findOrder(key);
    const dialog = document.getElementById(DELETE_DIALOG_ID);
    pendingDelete = null;
    if (!entry) {
      if (dialog) dialog.hidden = true;
      alert('Pesanan sudah tidak ditemukan. Silakan tekan Perbarui Data.');
      return;
    }


    const confirmButton = dialog.querySelector('.ep-delete-confirm');
    confirmButton.disabled = true;
    confirmButton.textContent = 'Menghapus…';
    const orders = (entry.store.orders || []).filter(item => item.id !== key.orderId);
    const activeId = entry.store.activeId === key.orderId
      ? (orders[0] && orders[0].id) || ''
      : entry.store.activeId;
    entry.sync.setStore(entry.app, { activeId, orders });


    // collect() membandingkan daftar sebelumnya dan membuat tombstone penghapusan.
    entry.sync.collect();
    entry.sync.markDirty();
    dialog.hidden = true;
    confirmButton.disabled = false;
    confirmButton.textContent = 'Ya, Hapus Pesanan';
  }


  // Handler global + atribut onclick tetap terbawa jika portal merender ulang
  // baris dengan innerHTML, berbeda dengan listener/properti DOM biasa.
  window.EPDeleteOrderOpen = openDeleteDialog;


  function bindDeleteButton(button) {
    button.dataset.epDeleteVersion = RUNTIME_VERSION;
    button.setAttribute(
      'onclick',
      'window.EPDeleteOrderOpen(this.dataset.deleteOrder); return false;'
    );
    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      openDeleteDialog(button.dataset.deleteOrder || '');
    };
  }


  function enhanceRows() {
    installStyle();
    installDialog();
    document.querySelectorAll('[data-open-order]').forEach(openButton => {
      const cell = openButton.closest('td');
      if (!cell) return;


      let actions = cell.querySelector('.ep-order-actions');
      const copyButton = cell.querySelector('[data-ep-copy-order]');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'ep-order-actions';
        cell.insertBefore(actions, copyButton || openButton);
      }


      if (copyButton && copyButton.parentElement !== actions) actions.appendChild(copyButton);
      if (openButton.parentElement !== actions) actions.appendChild(openButton);


      let removeButton = actions.querySelector('.ep-delete-order');
      if (removeButton) {
        if (removeButton.dataset.epDeleteVersion !== RUNTIME_VERSION) {
          const freshButton = removeButton.cloneNode(true);
          removeButton.replaceWith(freshButton);
          removeButton = freshButton;
        }
        bindDeleteButton(removeButton);
        actions.insertBefore(removeButton, openButton);
        return;
      }


      removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'ep-delete-order';
      removeButton.textContent = 'Hapus';
      removeButton.setAttribute('aria-label', 'Hapus pesanan');
      removeButton.dataset.deleteOrder = openButton.dataset.openOrder || '';
      bindDeleteButton(removeButton);
      actions.insertBefore(removeButton, openButton);
    });
  }


  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      enhanceRows();
    }, 30);
  };


  enhanceRows();
  document.addEventListener('click', event => {
    const removeButton = event.target.closest && event.target.closest('.ep-delete-order');
    if (!removeButton) return;
    event.preventDefault();
    event.stopPropagation();
    openDeleteDialog(removeButton.dataset.deleteOrder || '');
  }, true);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();

