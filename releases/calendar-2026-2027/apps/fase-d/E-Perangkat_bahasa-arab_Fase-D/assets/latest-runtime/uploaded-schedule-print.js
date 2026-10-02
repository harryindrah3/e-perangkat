(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const section = params.get('section') || 'all';
  if (!['all', 'core'].includes(section)) return;

  function storeKey() {
    const match = location.pathname.match(/\/fase-([a-f])\/E-Perangkat_([^/]+)_Fase-[A-F]/i);
    return match ? `eperangkat.${match[2].toLowerCase()}.fase${match[1].toLowerCase()}.v1.orders` : '';
  }

  function safeJson(value, fallback) {
    try {
      return JSON.parse(value || '') || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function activeData() {
    const key = storeKey();
    if (!key) return { profile: {}, schedule: {} };
    const store = safeJson(localStorage.getItem(key), { activeId: '', orders: [] });
    const orderId = params.get('order') || '';
    const orders = Array.isArray(store.orders) ? store.orders : [];
    const order = orders.find((item) => orderId && item.id == orderId) ||
      orders.find((item) => item.id === store.activeId) || orders[0] || {};
    const prefix = key.replace(/\.orders$/, '');
    const localProfile = safeJson(localStorage.getItem(`${prefix}.profile`), {});
    const scheduleKey = `${prefix}.uploaded-schedule.${String(order.id || 'profile')}`;
    const schedule = safeJson(localStorage.getItem(scheduleKey), {});
    return {
      order,
      profile: { ...(order.profile || {}), ...localProfile },
      schedule
    };
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function scheduleSets(schedule) {
    if (schedule.include === false) return [];
    const semester = params.get('semester') || 'both';
    const sets = [];
    if (semester === '1' || semester === 'both') {
      const pages = Array.isArray(schedule.semester1?.pages) ? schedule.semester1.pages : [];
      if (pages.length) sets.push({ semester: 'I', pages });
    }
    if (semester === '2' || semester === 'both') {
      const pages = Array.isArray(schedule.semester2?.pages) ? schedule.semester2.pages : [];
      if (pages.length) sets.push({ semester: 'II', pages });
    }
    return sets;
  }

  function installStyle() {
    if (document.getElementById('epUploadedSchedulePrintStyle')) return;
    const style = document.createElement('style');
    style.id = 'epUploadedSchedulePrintStyle';
    style.textContent = `
      .ep-uploaded-schedule-page .page-inner{height:100%;display:flex;flex-direction:column;padding:13mm 14mm 11mm!important}
      .ep-uploaded-schedule-heading{text-align:center;margin:0 0 2.5mm;font-size:18pt;line-height:1.15;letter-spacing:.02em}
      .ep-uploaded-schedule-subtitle{text-align:center;margin:0 0 4mm;color:#475569;font-size:9.5pt}
      .ep-uploaded-schedule-frame{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:3mm;border:1px solid #cbd5e1;border-radius:2.5mm;background:#fff;overflow:hidden}
      .ep-uploaded-schedule-frame img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
      .ep-uploaded-schedule-page .page-foot{margin-top:3mm}
    `;
    document.head.appendChild(style);
  }

  function componentEndAnchor(root, label) {
    const pages = [...root.querySelectorAll('.page')];
    const coverIndex = pages.findIndex((page) => page.classList.contains('cover') && normalize(page.querySelector('.cover-center h1')?.textContent || page.querySelector('h1')?.textContent || '').includes(label));
    if (coverIndex < 0) return null;
    let nextCover = pages.length;
    for (let index = coverIndex + 1; index < pages.length; index += 1) {
      if (pages[index].classList.contains('cover')) {
        nextCover = index;
        break;
      }
    }
    return pages[Math.max(coverIndex, nextCover - 1)] || pages[coverIndex];
  }

  function addWatermark(page) {
    const source = document.querySelector('.page .payment-watermark');
    if (source && !page.querySelector('.payment-watermark')) page.appendChild(source.cloneNode(true));
  }

  function insertPages(root, profile, sets) {
    if (root.querySelector('.ep-uploaded-schedule-page')) return;
    installStyle();
    const grade = params.get('grade') || '';
    const school = profile.school || '';
    const year = profile.year || '';
    let anchor = componentEndAnchor(root, 'JADWAL MENGAJAR') || componentEndAnchor(root, 'KALENDER PENDIDIKAN') || root.querySelector('.toc-page') || root.querySelector('.page');
    if (!anchor) return;

    const nodes = [];
    for (const set of sets) {
      set.pages.forEach((item, index) => {
        if (!item?.dataUrl) return;
        const page = document.createElement('section');
        page.className = `page ${Number(item.width) > Number(item.height) ? 'landscape' : 'portrait'} ep-uploaded-schedule-page`;
        page.dataset.semester = set.semester;
        page.innerHTML = `<div class="page-inner">
          <h1 class="ep-uploaded-schedule-heading">JADWAL PELAJARAN</h1>
          <p class="ep-uploaded-schedule-subtitle">Semester ${esc(set.semester)}${grade ? ` · Kelas ${esc(grade)}` : ''}${school ? ` · ${esc(school)}` : ''}</p>
          <div class="ep-uploaded-schedule-frame"><img src="${item.dataUrl}" alt="Jadwal Pelajaran Semester ${esc(set.semester)} halaman ${index + 1}"></div>
          <div class="page-foot"><span>Jadwal Pelajaran · Semester ${esc(set.semester)}</span><span>${esc(year)}</span></div>
        </div>`;
        addWatermark(page);
        nodes.push(page);
      });
    }
    for (const node of nodes) {
      anchor.after(node);
      anchor = node;
    }
  }

  const definitions = [
    ['calendar', 'Kalender Pendidikan', ['KALENDER PENDIDIKAN']],
    ['schedule', 'Jadwal Mengajar', ['JADWAL MENGAJAR']],
    ['uploaded', 'Jadwal Pelajaran', []],
    ['cp', 'Capaian Pembelajaran', ['CAPAIAN PEMBELAJARAN']],
    ['atp', 'Alur Tujuan Pembelajaran', ['ALUR TUJUAN PEMBELAJARAN', 'ATP I · PEMAHAMAN KONSEP']],
    ['prota', 'Program Tahunan', ['PROGRAM TAHUNAN']],
    ['promes', 'Program Semester', ['PROGRAM SEMESTER']],
    ['journal', 'Jurnal Mengajar', ['JURNAL MENGAJAR']],
    ['attendance', 'Daftar Hadir', ['DAFTAR HADIR']],
    ['kktp', 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', ['KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN', 'KKTP']],
    ['modules', 'Modul Ajar Deep Learning', ['MODUL AJAR DEEP LEARNING']],
    ['materials', 'Bahan Ajar', ['BAHAN AJAR']],
    ['lkpd', 'Lembar Kerja Peserta Didik (LKPD)', ['LEMBAR KERJA PESERTA DIDIK', 'LKPD']],
    ['assessment', 'Asesmen Pembelajaran', ['ASESMEN PEMBELAJARAN']],
    ['analysis', 'Analisis Nilai', ['ANALISIS NILAI FORMATIF DAN SUMATIF', 'DAFTAR ANALISIS NILAI FORMATIF']]
  ];

  function rebuildToc(root) {
    const toc = root.querySelector('.toc-page');
    const list = toc?.querySelector('.toc-list');
    if (!toc || !list) return;
    const pages = [...root.querySelectorAll('.page')];
    const entries = [];

    for (const [key, label, patterns] of definitions) {
      let index = -1;
      if (key === 'uploaded') {
        index = pages.findIndex((page) => page.classList.contains('ep-uploaded-schedule-page'));
      } else {
        index = pages.findIndex((page, pageIndex) => {
          if (pageIndex < 2 || !page.classList.contains('cover')) return false;
          const title = normalize(page.querySelector('.cover-center h1')?.textContent || page.querySelector('h1')?.textContent || '');
          return patterns.some((pattern) => title.includes(pattern));
        });
      }
      if (index >= 0) entries.push({ key, label, index });
    }

    entries.sort((a, b) => a.index - b.index);
    entries.forEach((entry, idx) => {
      entry.start = entry.index + 1;
      const next = entries[idx + 1];
      entry.end = next ? next.index : pages.length;
    });

    const rows = [
      { label: 'Sampul Perangkat', number: '1' },
      { label: 'Daftar Isi', number: String(pages.indexOf(toc) + 1 || 2) },
      ...entries.map((entry) => ({
        label: entry.label,
        number: entry.start === entry.end ? String(entry.start) : `${entry.start}–${entry.end}`
      }))
    ];

    list.innerHTML = rows.map((item, index) => `<li><span class="toc-no">${String(index + 1).padStart(2, '0')}</span><span class="toc-label">${esc(item.label)}</span><span class="toc-dots"></span><span class="toc-page-number">${esc(item.number)}</span></li>`).join('');
  }

  function updateStatus(root) {
    const status = document.getElementById('pageStatus');
    if (!status) return;
    const total = root.querySelectorAll('.page').length;
    const old = status.textContent || '';
    status.textContent = /^\d+ halaman/i.test(old) ? old.replace(/^\d+ halaman/i, `${total} halaman`) : `${total} halaman${old ? ` · ${old}` : ''}`;
  }

  function apply() {
    const root = document.getElementById('printRoot');
    if (!root || !root.querySelector('.page')) return;
    const data = activeData();
    const sets = scheduleSets(data.schedule);
    if (!sets.length) return;
    insertPages(root, data.profile, sets);
    rebuildToc(root);
    updateStatus(root);
  }

  let timer = 0;
  function queue() {
    clearTimeout(timer);
    timer = setTimeout(apply, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queue, { once: true });
  else queue();
  [350, 900, 1800, 3200].forEach((delay) => setTimeout(apply, delay));
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
})();
