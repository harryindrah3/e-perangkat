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
    #epCopyOrderDialog::backdro¶»§q«^