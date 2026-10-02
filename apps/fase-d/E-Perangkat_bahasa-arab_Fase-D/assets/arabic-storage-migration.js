(() => {
  'use strict';

  const OLD = 'eperangkat.bahasa-inggris.fased.v1';
  const CURRENT = 'eperangkat.bahasa-arab.fased.v1';
  const MARKER = CURRENT + '.migration-from-bahasa-inggris-v1';

  if (localStorage.getItem(MARKER) === 'done') return;

  try {
    const copies = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      if (!key.startsWith(OLD + '.')) continue;
      const suffix = key.slice(OLD.length);
      const target = CURRENT + suffix;
      if (localStorage.getItem(target) == null) {
        copies.push([target, localStorage.getItem(key)]);
      }
    }
    for (const [target, value] of copies) {
      if (value != null) localStorage.setItem(target, value);
    }
    localStorage.setItem(MARKER, 'done');
    window.EPERANGKAT_ARABIC_STORAGE = {
      prefix: CURRENT,
      migrated: copies.length,
      legacyPrefix: OLD
    };
  } catch (error) {
    console.warn('[Bahasa Arab] Migrasi namespace penyimpanan dilewati:', error);
  }
})();
