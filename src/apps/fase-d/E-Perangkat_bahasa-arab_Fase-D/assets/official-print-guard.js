(()=>{'use strict';
const root=document.getElementById('printRoot');
if(!root)return;

const replacements=[
  [/KURIKULUM MERDEKA\s*Â·\s*PEMBELAJARAN MENDALAM/gi,'KURIKULUM BERBASIS CINTA Â· KEMENTERIAN AGAMA'],
  [/E-?PERANGKAT PEMBELAJARAN/gi,'PERANGKAT PEMBELAJARAN'],
  [/Modul Ajar Deep Learning/gi,'Modul Ajar Kurikulum Berbasis Cinta'],
  [/MODUL AJAR DEEP LEARNING/g,'MODUL AJAR KURIKULUM BERBASIS CINTA'],
  [/BAHAN AJAR BAHASA INGGRIS/gi,'BAHAN AJAR BAHASA ARAB'],
  [/kalender pemesan/gi,'kalender pendidikan satuan pendidikan'],
  [/berdasarkan\s+(?:permintaan\s+)?(?:customer|pemesan)/gi,'berdasarkan data satuan pendidikan'],
  [/sesuai\s+permintaan\s+(?:customer|pemesan)/gi,'sesuai data satuan pendidikan'],
  [/berdasarkan\s+pesanan/gi,'berdasarkan data satuan pendidikan'],
  [/\balokasi rancangan preview\s*;?\s*validasi final sebelum production\b/gi,'alokasi pembelajaran'],
  [/\brancangan preview\b/gi,'rancangan pembelajaran'],
  [/\balokasi preview\b/gi,'alokasi pembelajaran'],
  [/\buntuk pengujian fitur dan wajib divalidasi sebelum production\b/gi,'sesuai ketentuan satuan pendidikan'],
  [/\bvalidasi final sebelum production\b/gi,''],
  [/\bsebelum production\b/gi,'sesuai ketentuan satuan pendidikan'],
  [/\bpada preview\b/gi,'pada perangkat ini'],
  [/\bdokumen pratinjau\b/gi,'dokumen'],
  [/\bcustomer\b/gi,'satuan pendidikan'],
  [/\bpemesan\b/gi,'satuan pendidikan'],
  [/\bpesanan\b/gi,'data perangkat'],
  [/\bproduction\b/gi,''],
  [/\bpreview\b/gi,'']
];

con¶»§q«^