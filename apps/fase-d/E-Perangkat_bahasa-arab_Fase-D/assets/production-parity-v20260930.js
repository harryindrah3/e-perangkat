(() => {
  'use strict';

  const OLD_RUNTIME = 'https://e-perangkat-online-a-irysp0h7o-harryindrah3-6239s-projects.vercel.app';
  const STABLE_RUNTIME = 'https://e-perangkat-online-a-6xpm8q2nz-harryindrah3-6239s-projects.vercel.app';
  const PRINT_PARITY = 'https://e-perangkat-online-a-afanit1w0-harryindrah3-6239s-projects.vercel.app';

  function addScript(src, id) {
    if (id && document.getElementById(id)) return;
    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src;
    s.async = false;
    document.body.appendChild(s);
  }

  addScript(OLD_RUNTIME + '/logo-fix.js?v=20260909-logo-assets-2', 'ep-logo-fix-loader');
  addScript(OLD_RUNTIME + '/grade-one-cover.js?v=20260909-cute-cover-1', 'ep-grade-one-cover-loader');
  addScript(OLD_RUNTIME + '/promes-print-route-fix.js?v=20260909-calendar-slot-fix-4', 'ep-promes-fix-loader');

  if (!window.__epOrderToolsTimer) {
    let checks = 0;
    window.__epOrderToolsTimer = setInterval(() => {
      const newOrder = document.getElementById('newOrder');
      if (newOrder && !document.getElementById('teacherClassOrder')) {
        const a = document.createElement('a');
        a.id = 'teacherClassOrder';
        a.className = 'button primary';
        a.href = '/pesanan-guru-kelas';
        a.textContent = '+ Guru Kelas';
        a.title = 'Isi identitas sekali untuk banyak mapel';
        newOrder.parentNode?.insertBefore(a, newOrder);
      }
      if (window.EPERANGKAT_CATALOG?.apps?.length && window.PortalSync && document.body && !document.getElementById('epCopyOrderDialog') && !document.getElementById('ep-copy-order-loader')) {
        addScript(OLD_RUNTIME + '/copy-order.js?v=20260908-restore-1', 'ep-copy-order-loader');
      }
      if (document.getElementById('teacherClassOrder') && document.getElementById('epCopyOrderDialog')) {
        clearInterval(window.__epOrderToolsTimer);
        window.__epOrderToolsTimer = null;
      } else if (++checks > 1200) {
        clearInterval(window.__epOrderToolsTimer);
        window.__epOrderToolsTimer = null;
      }
    }, 50);
  }

  if (!window.__epSupervisionTimer) {
    let checks = 0, queued = false;
    window.__epSupervisionTimer = setInterval(() => {
      if (window.EPERANGKAT_DATA && document.body && !queued) {
        queued = true;
        setTimeout(() => {
          addScript(OLD_RUNTIME + '/phase-c-supervision.js?v=20260908-all-af-2', 'ep-supervision-runtime');
          clearInterval(window.__epSupervisionTimer);
          window.__epSupervisionTimer = null;
        }, 150);
      } else if (++checks > 600) {
        clearInterval(window.__epSupervisionTimer);
        window.__epSupervisionTimer = null;
      }
    }, 50);
  }

  if (/\/print\.html$/i.test(location.pathname)) {
    addScript(STABLE_RUNTIME + '/print-filename.js?v=20260911-2', 'ep-print-filename-loader');
    addScript(PRINT_PARITY + '/differentiation-runtime.js?v=20260915-2', 'ep-differentiation-loader');
    addScript(PRINT_PARITY + '/print-safe-pages.js?v=20260915-5', 'ep-print-safe-pages-loader');
  }
})();
