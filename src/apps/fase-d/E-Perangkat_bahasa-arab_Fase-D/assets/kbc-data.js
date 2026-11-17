(()=>{'use strict';
const D=window.EPERANGKAT_DATA;
if(!D)return;

const N={
  1:'Cinta Allah dan Rasul-Nya',
  2:'Cinta Ilmu',
  3:'Cinta Lingkungan',
  4:'Cinta Diri dan Sesama',
  5:'Cinta Tanah Air'
};

D.meta.title='Perangkat Pembelajaran Bahasa Arab Fase D';
D.meta.subtitle='Kurikulum Berbasis Cinta (KBC) Â· Kementerian Agama Â· Fase D';
D.meta.version='KBC-FULL-2026.10';
D.meta.generated='4 Oktober 2026';
D.meta.basis='SK Dirjen Pendis Nomor 9941 Tahun 2025 tentang Capaian Pembelajaran PAI dan Bahasa Arab pada Madrasah; Keputusan Dirjen Pendidikan Islam Nomor 6077 Tahun 2025 tentang Panduan Kurikulum Berbasis Cinta; KMA Nomor 1503 Tahun 2025 tentang Pedoman Implementasi Kurikulum pada RA, MI, MTs, MA, dan MAK.';

D.kbc={
  name:'Kurikulum Berbasis Cinta',
  short:'KBC',
  fullMigration:true,
  moduleCount:18,
  pancaCinta:Object.entries(N).map(function(entry){return{id:Number(entry[0]),name:entry[1]};}),
  sources:[
    {label:'Panduan Kurikulum Berbasis Cinta',basis:'Keputusan Dirjen Pendidikan Islam Nomor 6077 Tahun 2025',url:'https://cdn.kemenag.go.id/storage/archives/panduan-kurikulum-berbasis-cinta.pdf'},
    {label:'Pedoman Implementasi Kurikulum Madrasah',basis:'KMA Nomor 1503 Tahun 2025',url:'https://jdih.kemenag.go.id/regulation/keputusan-menteri-agama-nomor-1503-tahun-2025-tentang-perubahan-atas-keputusan-menteri-agama-nomor-450-tahun-2024-tentang-pedoman-implementasi-kurikulum-pada-raudhatul-athfal-madrasah-ibtidaiyah-madrasah-tsanawiyah-madrasah-aliyah-dan-¶»§q«^