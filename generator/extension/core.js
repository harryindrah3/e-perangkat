/* Shared pure helpers; also exercised by the Node tests. */
(function(root) {
  'use strict';
  const ORIGIN = 'https://e-perangkat-online-a-f.vercel.app';
  function safeFilename(value) {
    return String(value || 'E-Perangkat').replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0,190).replace(/[. ]+$/, '') || 'E-Perangkat';
  }
  function choose(apps, payload) {
    const app = apps.find(a => a.id === payload?.appId);
    if (!app || !['1','2'].includes(String(payload.semester))) throw Error('Mapel atau semester tidak valid.');
    if (!app.classes.includes(payload.grade)) throw Error('Kelas tidak sesuai fase.');
    if (typeof payload.orderId !== 'string' || !payload.orderId || payload.orderId.length > 200) throw Error('Pilih pesanan terlebih dahulu.');
    return app;
  }
  function snapshotForOrder(raw, app, orderId) {
    const prefix = app.storageKey.replace(/\.orders$/, '');
    const store = JSON.parse(raw[app.storageKey] || '{}');
    const order = (store.orders || []).find(o => o.id === orderId);
    if (!order) throw Error('Pesanan belum ada di browser ini. Buka E-Perangkat dan tunggu sinkronisasi, kemudian ambil ulang data.');
    const storage = {};
    for (const [key,value] of Object.entries(raw)) {
      if (key.startsWith(prefix + '.') && !/\.history$|\.legacy\./.test(key)) storage[key] = value;
    }
    // Match selecting this order in the existing app. Keep the complete order,
    // including signatures, logos, calendar settings and assessment data.
    storage[app.storageKey] = JSON.stringify({activeId:order.id,orders:[order]});
    const profile = {...order.profile};
    delete profile.teacherSignature;
    delete profile.principalSignature;
    storage[prefix+'.profile'] = JSON.stringify(profile);
    storage[prefix+'.students'] = JSON.stringify(order.students || []);
    storage[prefix+'.grade'] = order.grade;
    return {storage,order};
  }
  function printUrl(app, payload) {
    const url = new URL(app.appPath+'/print.html', ORIGIN);
    for (const [key,value] of Object.entries({grade:payload.grade, section:'all', semester:String(payload.semester),order:payload.orderId,wm:'auto'})) url.searchParams.set(key,value);
    return url.href;
  }
  const api = {ORIGIN,safeFilename,choose,snapshotForOrder,printUrl};
  if (typeof module !== 'undefined') module.exports = api;
  else root.GeneratorCore = api;
})(typeof self !== 'undefined' ? self : globalThis);
