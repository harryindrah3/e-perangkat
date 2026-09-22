(function(){"use strict";const c=window.EPERANGKAT_CATALOG;if(!c||!Array.isArray(c.apps))return;const add=[
  {
    "id": "fase-a-pai-bp-erlangga",
    "phase": "A",
    "phaseLabel": "Fase A",
    "phaseDescription": "Kelas I–II",
    "classes": [
      "I",
      "II"
    ],
    "subject": "PAI BP Versi Erlangga",
    "slug": "pendidikan-agama-islam-erlangga",
    "name": "E-Perangkat PAI BP Versi Erlangga",
    "description": "PAI dan Budi Pekerti Versi Erlangga Fase A · Kelas I–II · CP 2026.",
    "themeColor": "#7C4A2D",
    "backgroundColor": "#FFF9F2",
    "href": "apps/fase-a/E-Perangkat_pendidikan-agama-islam-erlangga_Fase-A/index.html",
    "storageKey": "eperangkat.pendidikan-agama-islam-erlangga.fasea.v1.orders",
    "fileCount": 3
  },
  {
    "id": "fase-b-pai-bp-erlangga",
    "phase": "B",
    "phaseLabel": "Fase B",
    "phaseDescription": "Kelas III–IV",
    "classes": [
      "III",
      "IV"
    ],
    "subject": "PAI BP Versi Erlangga",
    "slug": "pendidikan-agama-islam-erlangga",
    "name": "E-Perangkat PAI BP Versi Erlangga",
    "description": "PAI dan Budi Pekerti Versi Erlangga Fase B · Kelas III–IV · CP 2026.",
    "themeColor": "#7C4A2D",
    "backgroundColor": "#FFF9F2",
    "href": "apps/fase-b/E-Perangkat_pendidikan-agama-islam-erlangga_Fase-B/index.html",
    "storageKey": "eperangkat.pendidikan-agama-islam-erlangga.faseb.v1.orders",
    "fileCount": 3
  },
  {
    "id": "fase-c-pai-bp-erlangga",
    "phase": "C",
    "phaseLabel": "Fase C",
    "phaseDescription": "Kelas V–VI",
    "classes": [
      "V",
      "VI"
    ],
    "subject": "PAI BP Versi Erlangga",
    "slug": "pendidikan-agama-islam-erlangga",
    "name": "E-Perangkat PAI BP Versi Erlangga",
    "description": "PAI dan Budi Pekerti Versi Erlangga Fase C · Kelas V–VI · CP 2026.",
    "themeColor": "#7C4A2D",
    "backgroundColor": "#FFF9F2",
    "href": "apps/fase-c/E-Perangkat_pendidikan-agama-islam-erlangga_Fase-C/index.html",
    "storageKey": "eperangkat.pendidikan-agama-islam-erlangga.fasec.v1.orders",
    "fileCount": 3
  }
];for(const e of add){if(!c.apps.some(x=>x.id===e.id))c.apps.push(e)}c.total=c.apps.length;c.summary={};for(const e of c.apps)c.summary[e.phase]=(c.summary[e.phase]||0)+1;window.EPERANGKAT_CATALOG=c;})();