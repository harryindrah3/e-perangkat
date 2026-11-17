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
      #ep-delete-order-dialog{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:14px;background:#092f2a99;backdrop¶»§q«^