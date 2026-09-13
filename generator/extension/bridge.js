(() => {
  'use strict';
  const channel = 'genarator-e-perangkat-v1';
  const allowed = new Set(['hello', 'orders', 'generate', 'cancel']);
  window.addEventListener('message', async event => {
    if (event.source !== window || event.origin !== location.origin) return;
    const m = event.data;
    if (m?.channel !== channel || m.direction !== 'request' || !allowed.has(m.action)) return;
    try {
      const result = await chrome.runtime.sendMessage({channel, id: m.id, action: m.action, payload: m.payload});
      window.postMessage({channel, direction: 'response', id: m.id, ...result}, location.origin);
    } catch (error) {
      window.postMessage({channel, direction: 'response', id: m.id, error: 'Koneksi ekstensi terputus: '+(error?.message||String(error))+'. Muat ulang ekstensi melalui chrome://extensions, lalu muat ulang generator.'}, location.origin);
    }
  });
  chrome.runtime.onMessage.addListener(message => {
    if (message?.channel === channel && message.direction === 'progress') {
      window.postMessage(message, location.origin);
    }
  });
})();
