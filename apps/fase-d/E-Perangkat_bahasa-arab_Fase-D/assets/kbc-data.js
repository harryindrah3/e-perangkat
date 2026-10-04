(()=>{'use strict';
const D=window.EPERANGKAT_DATA;
if(!D)return;
const N={1:'Cinta Allah dan Rasul-Nya',2:'Cinta Ilmu',3:'Cinta Lingkungan',4:'Cinta Diri dan Sesama',5:'Cinta Tanah Air'};
D.meta.title='Perangkat Pembelajaran Bahasa Arab Fase D'; D.meta.subtitle='Kurikulum Berbasis Cinta (KBC) · Kementerian Agama · Fase D';
D.meta.version='KBC-2026.10';
D.meta.generated='4 Oktober 2026';
D.meta.basis='SK Dirjen Pendis Nomor 9941 Tahun 2025 tentang CP PAI dan Bahasa Arab pada Madrasah; Keputusan Dirjen Pendidikan Islam Nomor 6077 Tahun 2025 tentang Panduan Kurikulum Berbasis Cinta; KMA Nomor 1503 Tahun 2025 tentang Pedoman Implementasi Kurikulum pada RA, MI, MTs, MA, dan MAK.';
D.kbc={
  name:'Kurikulum Berbasis Cinta',
  short:'KBC',
  pancaCinta:Object.entries(N).map(([id,name])=>({id:Number(id),name})),
  sources:[
    {label:'Panduan Kurikulum Berbasis Cinta',basis:'Keputusan Dirjen Pendidikan Islam Nomor 6077 Tahun 2025',url:'https://cdn.kemenag.go.id/storage/archives/panduan-kurikulum-berbasis-cinta.pdf'},
    {label:'Pedoman Implementasi Kurikulum Madrasah',basis:'KMA Nomor 1503 Tahun 2025',url:'https://jdih.kemenag.go.id/regulation/keputusan-menteri-agama-nomor-1503-tahun-2025-tentang-perubahan-atas-keputusan-menteri-agama-nomor-450-tahun-2024-tentang-pedoman-implementasi-kurikulum-pada-raudhatul-athfal-madrasah-ibtidaiyah-madrasah-tsanawiyah-madrasah-aliyah-dan-madrasah-aliyah-kejuruan'}
  ],
  officialMapping:[
    {material:'Madrasah',themeIds:[2,3,4]},
    {material:'Rumah',themeIds:[4]},
    {material:'Hobi',themeIds:[2,4]},
    {material:'Pekerjaan',themeIds:[4,5]},
    {material:'Kesehatan',themeIds:[4]},
    {material:'Hari-Hari Besar Islam',themeIds:[1,5]},
    {material:'Pariwisata',themeIds:[3,4,5]},
    {material:'Alam',themeIds:[1,3]},
    {material:'Lingkungan',themeIds:[3,4,5]}
  ].map(x=>({...x,themes:x.themeIds.map(id=>N[id])})),
  note:'KBC menjadi ruh dan kerangka integrasi nilai. Model atau strategi pembelajaran dipilih sesuai tujuan dan konteks; pembelajaran mendalam dapat digunakan sebagai strategi pendukung, bukan identitas kurikulum utama.'
};
const M={
'vii-1-perkenalan':{material:'Madrasah (konteks operasional)',themeIds:[2,4],type:'operasional',insert:['Adab berkenalan dan menghargai identitas sesama.','Belajar bahasa sebagai wujud cinta ilmu.']},
'vii-2-fasilitas-sekolah':{material:'Madrasah',themeIds:[2,3,4],type:'resmi',insert:['Menjaga fasilitas belajar sebagai amanah bersama.','Menggunakan fasilitas madrasah dengan tertib dan peduli lingkungan.']},
'vii-3-peralatan-sekolah-dan-warna':{material:'Madrasah',themeIds:[2,3,4],type:'resmi',insert:['Merawat alat belajar dan menggunakan sumber belajar secara bertanggung jawab.','Berbagi perlengkapan dengan adab dan kepedulian.']},
'vii-4-alamat':{material:'Rumah (konteks operasional)',themeIds:[4],type:'operasional',insert:['Menjaga privasi dan keselamatan diri saat bertukar informasi alamat.','Menghormati keluarga dan tempat tinggal orang lain.']},
'vii-5-rumah':{material:'Rumah',themeIds:[4],type:'resmi',insert:['Adab di rumah dan tanggung jawab terhadap anggota keluarga.','Membangun kasih sayang serta kerja sama dalam keluarga.']},
'vii-6-kegiatan-sehari-hari-keluarga':{material:'Rumah (konteks operasional)',themeIds:[4],type:'operasional',insert:['Membiasakan rutinitas yang mencerminkan tanggung jawab dan kepedulian kepada keluarga.']},
'viii-1-waktu-dan-jam':{material:'Konteks waktu/rutinitas',themeIds:[2,4],type:'operasional',insert:['Disiplin waktu sebagai adab belajar dan tanggung jawab kepada diri serta sesama.']},
'viii-2-kegiatan-sehari-hari-kita':{material:'Konteks rutinitas',themeIds:[2,4],type:'operasional',insert:['Mengatur kegiatan harian secara disiplin, sehat, dan menghargai waktu orang lain.']},
'viii-3-hobi':{material:'Hobi',themeIds:[2,4],type:'resmi',insert:['Mengembangkan minat secara sehat dan bermanfaat.','Menghargai perbedaan hobi dan bakat teman.']},
'viii-4-olahraga':{material:'Kesehatan (konteks operasional)',themeIds:[4],type:'operasional',insert:['Menjaga kesehatan tubuh dan sportivitas sebagai bentuk cinta diri dan sesama.']},
'viii-5-profesi':{material:'Pekerjaan',themeIds:[4,5],type:'resmi',insert:['Menghargai setiap profesi yang bermanfaat bagi sesama.','Menumbuhkan cita-cita untuk berkontribusi bagi bangsa.']},
'viii-6-kesehatan-dan-menjenguk-orang-sakit':{material:'Kesehatan',themeIds:[4],type:'resmi',insert:['Menjaga kesehatan diri dan menunjukkan empati saat menjenguk orang sakit.']},
'ix-1-tahun-baru-hijriah':{material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',insert:['Mengambil hikmah hijrah sebagai penguatan cinta kepada Allah dan Rasul-Nya.','Menghubungkan nilai hijrah dengan kontribusi positif bagi kehidupan berbangsa.']},
'ix-2-peringatan-maulid-rasul':{material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',insert:['Meneladani akhlak Rasulullah dalam kehidupan sehari-hari.','Menguatkan persaudaraan dan kontribusi kebangsaan melalui keteladanan Rasul.']},
'ix-3-nuzulul-quran-dan-dua-hari-raya':{material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',insert:['Menghayati nilai hari besar Islam dan adab perayaan.','Menjaga persatuan dan kepedulian sosial dalam kehidupan berbangsa.']},
'ix-4-keindahan-alam':{material:'Alam / Pariwisata',themeIds:[1,3,4,5],type:'operasional',insert:['Mensyukuri keindahan alam sebagai ciptaan Allah.','Berwisata secara bertanggung jawab serta menjaga lingkungan dan budaya lokal.']},
'ix-5-pencipta-alam':{material:'Alam',themeIds:[1,3],type:'resmi',insert:['Mensyukuri nikmat Allah melalui perilaku sehari-hari.','Larangan merusak lingkungan (Q.S. Ar-Rum: 41).']},
'ix-6-pelestarian-lingkungan':{material:'Lingkungan',themeIds:[3,4,5],type:'resmi',insert:['Menjaga lingkungan sebagai tanggung jawab bersama.','Menghubungkan aksi pelestarian dengan kepedulian kepada sesama dan tanah air.']}
};
for(const m of D.modules||[]){
  const x=M[m.id]||{material:'Konteks materi bab',themeIds:[2,4],type:'operasional',insert:['Nilai KBC dipilih berdasarkan konteks tujuan pembelajaran.']};
  m.kbcMapping={...x,themes:x.themeIds.map(id=>N[id]),basis:x.type==='resmi'?'Pemetaan CP dan Tema KBC Bahasa Arab Fase D/MTs dalam Panduan KBC 6077/2025':'Pemetaan kontekstual berdasarkan materi pembelajaran dan nilai Panca Cinta'};
}
const p=(D.modules||[]).find(m=>m.id==='ix-5-pencipta-alam');
if(p){
  p.kbcPrototype={
    officialExample:true,
    label:'CONTOH IMPLEMENTASI KBC · BAHASA ARAB FASE D',
    source:'Panduan KBC, contoh RPP Bahasa Arab Fase D, halaman 82–86',
    material:'خَالِقُ الْعَالَم — Pencipta Alam',
    themes:[N[1],N[3]],
    inserts:['Mensyukuri nikmat Allah melalui perilaku sehari-hari.','Larangan merusak lingkungan (Q.S. Ar-Rum: 41).'],
    allocation:'9 × 40 menit · 3 pertemuan',
    model:'Project Based Learning (PjBL)',
    objective:'Peserta didik mengomunikasikan ide tertulis dan lisan melalui paragraf sederhana bertema alam dengan penggunaan isim mausul, sekaligus menumbuhkan rasa cinta kepada Allah dan kepedulian terhadap lingkungan.',
    iktp:[
      'Menjelaskan pengertian dan jenis isim mausul.',
      'Mengidentifikasi isim mausul dalam kalimat.',
      'Menggunakan isim mausul dalam kalimat sederhana.',
      'Menjelaskan fungsi isim mausul dalam konteks teks bertema alam.',
      'Menghubungkan penciptaan alam dengan kebesaran Allah melalui ayat atau hadis yang relevan.',
      'Menuliskan tindakan nyata sebagai wujud syukur atas ciptaan Allah.',
      'Menjelaskan dampak perilaku manusia yang merusak keseimbangan alam.',
      'Merancang langkah konkret untuk menjaga lingkungan.',
      'Membuat dan mempresentasikan video aksi menjaga alam dengan memasukkan penggunaan isim mausul.'
    ],
    meetings:[
      {number:1,duration:'3 × 40 menit',title:'Orientasi dan Perancangan Projek',opening:['Salam, doa, apersepsi tentang ciptaan Allah yang dikagumi peserta didik.','Guru menjelaskan tujuan pembelajaran, tema KBC, materi insersi, dan produk projek.'],core:['Mengamati gambar/video keindahan alam dan menanggapi pertanyaan pemantik tentang Sang Pencipta.','Menyimak serta membaca teks خَالِقُ الْعَالَم dengan bimbingan guru.','Mengidentifikasi isim mausul pada teks dan menghubungkan isi teks dengan tanggung jawab manusia terhadap alam.','Membentuk kelompok dan merancang video berbahasa Arab tentang langkah menjaga keseimbangan alam dengan dukungan ayat/hadis yang relevan.'],closing:['Menyimpulkan pembelajaran dan menentukan pembagian tugas projek.','Doa syukur atas ilmu yang diperoleh.']},
      {number:2,duration:'3 × 40 menit',title:'Pelaksanaan dan Monitoring Projek',opening:['Salam, doa, dan penguatan kembali hubungan syukur kepada Allah dengan tanggung jawab menjaga alam.','Meninjau kriteria projek dan IKTP.'],core:['Kelompok mengembangkan video aksi menjaga alam menggunakan ungkapan Arab dan isim mausul.','Guru memonitor partisipasi, ketepatan bahasa, isi pesan KBC, dan kemajuan produk.','Kelompok menerima umpan balik dan memperbaiki naskah/produk sebelum presentasi.'],closing:['Kelompok melaporkan progres dan rencana penyelesaian.','Guru memberi penguatan serta doa penutup.']},
      {number:3,duration:'3 × 40 menit',title:'Presentasi, Evaluasi, dan Refleksi',opening:['Salam, doa, dan refleksi singkat atas pengalaman projek.','Guru menegaskan kepedulian lingkungan sebagai wujud cinta kepada Allah.'],core:['Setiap kelompok mempresentasikan video projek.','Kelompok lain memberikan umpan balik dengan adab yang baik.','Guru dan peserta didik mengevaluasi ketepatan bahasa, kualitas pesan, serta kelayakan aksi lingkungan.','Peserta didik merumuskan langkah nyata yang dapat dilakukan di rumah atau madrasah.'],closing:['Menyimpulkan pembelajaran.','Menulis jurnal refleksi tentang ciptaan Allah dan satu aksi menjaga lingkungan yang akan dilakukan.','Doa syukur dan salam.']}
    ],
    assessment:{
      formative:['Kuis singkat tentang isim mausul dan isi teks bertema alam.','Observasi partisipasi, penggunaan bahasa, dan kontribusi pada diskusi/projek.'],
      summative:['Video/projek berbahasa Arab tentang langkah menjaga alam.','Paragraf atau infografik yang menggunakan isim mausul dengan tepat dan memuat pesan kepedulian lingkungan.'],
      attitude:['Observasi kepedulian terhadap ciptaan Allah dan lingkungan.','Komitmen terhadap aksi nyata menjaga lingkungan serta kerja sama kelompok.']
    }
  };
}

 // Normalisasi keluaran yang dibaca pengguna/cetakan: dokumen final, tanpa catatan proses pengembangan.
 (D.modules||[]).forEach(m=>{
   if(typeof m.allocationDetail==='string')m.allocationDetail=m.allocationDetail.replace(/\s*\(alokasi rancangan preview; validasi final sebelum Production\)/gi,'');
 });
 (D.coreDocuments||[]).forEach(doc=>{
   if(typeof doc.filename==='string')doc.filename=doc.filename.replace(/\s*\(Deep Learning\)/gi,'');
   if(Array.isArray(doc.paragraphs))doc.paragraphs=doc.paragraphs.map(p=>String(p)
     .replace(/KURIKULUM MERDEKA\s*·\s*PEMBELAJARAN MENDALAM/gi,'KURIKULUM BERBASIS CINTA · KEMENTERIAN AGAMA')
     .replace(/Alokasi preview/gi,'Alokasi pembelajaran')
     .replace(/sebelum Production/gi,'sesuai ketentuan satuan pendidikan'));
 });
 if(D.specialSchedule){
   if(typeof D.specialSchedule.status==='string')D.specialSchedule.status=D.specialSchedule.status.replace(/Rancangan preview/gi,'Rancangan pembelajaran');
   if(typeof D.specialSchedule.basis==='string')D.specialSchedule.basis=D.specialSchedule.basis
     .replace(/pada kerangka E-Perangkat/gi,'sebagai dasar penyusunan program pembelajaran')
     .replace(/pada preview/gi,'pada perangkat ini')
     .replace(/untuk pengujian fitur dan wajib divalidasi sebelum Production/gi,'dan disesuaikan dengan struktur kurikulum serta kalender satuan pendidikan');
 }
})();