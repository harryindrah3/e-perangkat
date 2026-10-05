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
D.meta.subtitle='Kurikulum Berbasis Cinta (KBC) · Kementerian Agama · Fase D';
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
  ].map(function(x){return Object.assign({},x,{themes:x.themeIds.map(function(id){return N[id];})});}),
  note:'KBC menjadi ruh dan kerangka integrasi nilai pada seluruh perangkat. Kompetensi Bahasa Arab tetap mengacu pada CP; model dan strategi belajar dipilih sesuai tujuan, karakter materi, serta konteks peserta didik.'
};


const OFFICIAL_GRAMMAR='الجملة الاسمية، العدد، التصريف اللغوي، فعل الأمر، الجملة الفعلية، الفعل المضارع، المصدر الصريح، الفعل الماضي، كان واسمها وخبرها، الفعل المزيد، اسم الموصول، اسم التفضيل';
D.cp={
  source:'Panduan Kurikulum Berbasis Cinta, Keputusan Dirjen Pendidikan Islam Nomor 6077 Tahun 2025, Lampiran 1 halaman 58 (PDF halaman 62).',
  rationale:'Pembelajaran Bahasa Arab Fase D/MTs pada perangkat KBC ini mengikuti tiga elemen resmi dalam pemetaan CP: Menyimak–Berbicara, Membaca–Memirsa, serta Menulis–Mempresentasikan. Panca Cinta diintegrasikan ke materi dan pengalaman belajar tanpa mengganti kompetensi Bahasa Arab.',
  goals:[
    'Memahami informasi tersirat dan tersurat serta berinteraksi tentang tema madrasah, rumah, hobi, pekerjaan, kesehatan, hari-hari besar Islam, pariwisata, alam, dan lingkungan.',
    'Memahami informasi tersurat dan tersirat dari berbagai jenis teks visual atau multimodal pada tema-tema Fase D.',
    'Mengomunikasikan ide secara tertulis maupun lisan melalui paragraf sederhana pada berbagai jenis teks yang terstruktur.'
  ],
  elements:[
    {name:'Menyimak–Berbicara',description:'Memahami informasi yang diterima secara tersirat dan tersurat serta berinteraksi tentang tema-tema Fase D dengan susunan gramatikal yang ditetapkan dalam CP. Rujukan gramatikal: '+OFFICIAL_GRAMMAR+'.'},
    {name:'Membaca–Memirsa',description:'Memahami informasi secara tersurat dan tersirat dari berbagai jenis teks visual atau multimodal tentang tema-tema Fase D dengan susunan gramatikal yang ditetapkan dalam CP. Rujukan gramatikal: '+OFFICIAL_GRAMMAR+'.'},
    {name:'Menulis–Mempresentasikan',description:'Mengomunikasikan ide secara tertulis maupun lisan melalui paragraf sederhana pada berbagai jenis teks yang terstruktur tentang tema-tema Fase D dengan susunan gramatikal yang ditetapkan dalam CP. Rujukan gramatikal: '+OFFICIAL_GRAMMAR+'.'}
  ],
  process:[
    'Menyimak model bahasa dan menangkap informasi tersurat maupun tersirat.',
    'Berinteraksi lisan dengan ungkapan, mufradat, pelafalan, dan kesantunan yang sesuai konteks.',
    'Membaca dan memirsa teks visual atau multimodal untuk menemukan informasi, gagasan, dan makna.',
    'Mengidentifikasi serta menggunakan susunan gramatikal dalam konteks komunikasi.',
    'Menulis paragraf sederhana dan produk berbahasa Arab yang terstruktur.',
    'Mempresentasikan gagasan, menerima umpan balik, melakukan revisi, dan merefleksikan Panca Cinta.'
  ]
};

const M={
  'vii-1-perkenalan':{
    material:'Madrasah (konteks operasional)',themeIds:[2,4],type:'operasional',
    insert:['Adab berkenalan dan menghargai identitas sesama.','Belajar bahasa sebagai wujud cinta ilmu.'],
    stimulus:'dua kartu profil tokoh fiktif dengan nama, asal, kelas, dan peran yang berbeda',
    action:'melakukan perkenalan berpasangan secara santun dan membuat kartu profil teman hanya dari informasi yang disetujui',
    reflection:'menghargai nama, asal, bahasa, dan identitas setiap orang tanpa mengejek atau merendahkan',
    model:'Task-Based Language Teaching dan Cooperative Learning'
  },
  'vii-2-fasilitas-sekolah':{
    material:'Madrasah',themeIds:[2,3,4],type:'resmi',
    insert:['Menjaga fasilitas belajar sebagai amanah bersama.','Menggunakan fasilitas madrasah dengan tertib dan peduli lingkungan.'],
    stimulus:'foto perpustakaan, kelas, laboratorium, kantin, tempat ibadah, dan lapangan di lingkungan sekolah',
    action:'membuat denah berlabel Arab disertai dua aturan sederhana untuk merawat fasilitas yang dipilih',
    reflection:'fasilitas belajar bermanfaat ketika digunakan tertib, dijaga kebersihannya, dan dapat dipakai bersama',
    model:'Project Based Learning ringan dan pembelajaran komunikatif'
  },
  'vii-3-peralatan-sekolah-dan-warna':{
    material:'Madrasah',themeIds:[2,3,4],type:'resmi',
    insert:['Merawat alat belajar dan menggunakan sumber belajar secara bertanggung jawab.','Berbagi perlengkapan dengan adab dan kepedulian.'],
    stimulus:'kotak berisi buku, pena, pensil, tas, penggaris, dan kartu warna dengan kondisi terawat serta tidak terawat',
    action:'menyusun katalog mini perlengkapan sekolah berbahasa Arab dan membuat komitmen merawat atau berbagi alat belajar',
    reflection:'alat belajar adalah sarana mencari ilmu sehingga perlu dirawat, digunakan hemat, dan dibagikan dengan adab',
    model:'Project Based Learning ringan dan Cooperative Learning'
  },
  'vii-4-alamat':{
    material:'Rumah (konteks operasional)',themeIds:[4],type:'operasional',
    insert:['Menjaga privasi dan keselamatan diri saat bertukar informasi alamat.','Menghormati keluarga dan tempat tinggal orang lain.'],
    stimulus:'peta lingkungan fiktif dengan nama jalan, nomor bangunan, arah, dan beberapa alamat contoh',
    action:'melakukan simulasi tanya jawab alamat memakai data fiktif dan mempraktikkan batas informasi pribadi yang aman dibagikan',
    reflection:'kemampuan berkomunikasi harus disertai tanggung jawab menjaga privasi diri dan orang lain',
    model:'Task-Based Language Teaching dan role-play'
  },
  'vii-5-rumah':{
    material:'Rumah',themeIds:[4],type:'resmi',
    insert:['Adab di rumah dan tanggung jawab terhadap anggota keluarga.','Membangun kasih sayang serta kerja sama dalam keluarga.'],
    stimulus:'denah rumah sederhana yang menampilkan ruang keluarga, kamar, dapur, halaman, dan beberapa perabot',
    action:'membuat denah rumah fiktif berlabel Arab serta menuliskan satu tanggung jawab positif pada beberapa ruang',
    reflection:'rumah menjadi ruang tumbuh bersama ketika anggota keluarga saling membantu, menjaga kebersihan, dan menghormati privasi',
    model:'Project Based Learning ringan dan pembelajaran berbasis teks'
  },
  'vii-6-kegiatan-sehari-hari-keluarga':{
    material:'Rumah (konteks operasional)',themeIds:[4],type:'operasional',
    insert:['Membiasakan rutinitas yang mencerminkan tanggung jawab dan kepedulian kepada keluarga.'],
    stimulus:'kartu urutan aktivitas keluarga sejak bangun, beribadah, belajar, bekerja, membantu di rumah, hingga beristirahat',
    action:'menyusun jadwal harian keluarga yang seimbang dan memilih satu kebiasaan membantu keluarga untuk dilakukan secara konsisten',
    reflection:'rutinitas yang baik bukan hanya mengatur waktu diri sendiri tetapi juga memberi ruang untuk membantu keluarga',
    model:'Task-Based Language Teaching dan pembiasaan kontekstual'
  },
  'viii-1-waktu-dan-jam':{
    material:'Konteks waktu dan rutinitas',themeIds:[2,4],type:'operasional',
    insert:['Disiplin waktu sebagai adab belajar dan tanggung jawab kepada diri serta sesama.'],
    stimulus:'enam gambar jam analog/digital yang dikaitkan dengan jadwal masuk, belajar, ibadah, istirahat, dan kegiatan rumah',
    action:'membuat jadwal kegiatan berbahasa Arab dengan waktu realistis serta memilih satu kebiasaan tepat waktu yang akan diperbaiki',
    reflection:'menghargai waktu berarti menghargai kesempatan belajar, kesehatan diri, dan waktu orang lain',
    model:'Task-Based Language Teaching dan Cooperative Learning'
  },
  'viii-2-kegiatan-sehari-hari-kita':{
    material:'Konteks rutinitas',themeIds:[2,4],type:'operasional',
    insert:['Mengatur kegiatan harian secara disiplin, sehat, dan menghargai waktu orang lain.'],
    stimulus:'dua contoh diari satu hari: satu seimbang antara belajar, ibadah, istirahat, dan tanggung jawab; satu lagi tidak seimbang',
    action:'menulis diari satu hari berbahasa Arab dan menetapkan satu perubahan kecil agar rutinitas lebih tertib serta bermanfaat',
    reflection:'kemandirian tumbuh melalui kebiasaan mengelola kegiatan, menepati janji, dan menjaga keseimbangan diri',
    model:'Genre-Based Learning dan refleksi kontekstual'
  },
  'viii-3-hobi':{
    material:'Hobi',themeIds:[2,4],type:'resmi',
    insert:['Mengembangkan minat secara sehat dan bermanfaat.','Menghargai perbedaan hobi dan bakat teman.'],
    stimulus:'kartu gambar membaca, menulis, olahraga, menggambar, memasak, berkebun, dan beberapa hobi lokal',
    action:'melakukan survei hobi kelas berbahasa Arab dan menyusun poster yang menampilkan keberagaman minat tanpa memberi peringkat siapa yang lebih baik',
    reflection:'hobi dapat menjadi jalan belajar dan berkembang ketika dilakukan sehat serta tetap menghargai minat orang lain',
    model:'Project Based Learning ringan dan Cooperative Learning'
  },
  'viii-4-olahraga':{
    material:'Kesehatan (konteks operasional)',themeIds:[4],type:'operasional',
    insert:['Menjaga kesehatan tubuh dan sportivitas sebagai bentuk cinta diri dan sesama.'],
    stimulus:'gambar beberapa jenis olahraga beserta situasi latihan yang aman, tidak aman, sportif, dan tidak sportif',
    action:'membuat kampanye mini olahraga sehat berbahasa Arab yang memuat ajakan bergerak aman dan satu contoh sikap sportif',
    reflection:'merawat tubuh dan berlaku sportif adalah bentuk penghargaan kepada diri sendiri serta orang lain',
    model:'Project Based Learning ringan dan pembelajaran komunikatif'
  },
  'viii-5-profesi':{
    material:'Pekerjaan',themeIds:[4,5],type:'resmi',
    insert:['Menghargai setiap profesi yang bermanfaat bagi sesama.','Menumbuhkan cita-cita untuk berkontribusi bagi bangsa.'],
    stimulus:'kartu profesi guru, dokter, petani, pedagang, polisi, teknisi, perawat, dan pekerjaan yang dekat dengan lingkungan setempat',
    action:'melakukan wawancara cita-cita berpasangan dan membuat kartu profesi yang menjelaskan manfaat pekerjaan bagi masyarakat',
    reflection:'nilai sebuah profesi tampak pada manfaat, tanggung jawab, dan pelayanan yang diberikan kepada sesama serta bangsa',
    model:'Task-Based Language Teaching dan Cooperative Learning'
  },
  'viii-6-kesehatan-dan-menjenguk-orang-sakit':{
    material:'Kesehatan',themeIds:[4],type:'resmi',
    insert:['Menjaga kesehatan diri dan menunjukkan empati saat menjenguk orang sakit.'],
    stimulus:'ilustrasi ruang klinik dan percakapan singkat antara pasien, tenaga kesehatan, serta teman yang menjenguk',
    action:'melakukan role-play klinik atau kunjungan pasien menggunakan ungkapan Arab yang santun dan membuat kartu doa/dukungan',
    reflection:'perhatian kepada orang sakit ditunjukkan melalui empati, ucapan baik, menjaga kenyamanan, dan tidak mengganggu proses pemulihan',
    model:'Role-play, Task-Based Language Teaching, dan Cooperative Learning'
  },
  'ix-1-tahun-baru-hijriah':{
    material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',
    insert:['Mengambil hikmah hijrah sebagai penguatan cinta kepada Allah dan Rasul-Nya.','Menghubungkan nilai hijrah dengan kontribusi positif bagi kehidupan berbangsa.'],
    stimulus:'linimasa ringkas peristiwa hijrah dan pergantian tahun Hijriah yang memuat beberapa penanda waktu',
    action:'menyusun linimasa berbahasa Arab dan menuliskan satu bentuk hijrah kebiasaan pribadi menuju tindakan yang lebih baik bagi lingkungan sosial',
    reflection:'hijrah dipahami sebagai keberanian memperbaiki diri, menjaga persaudaraan, dan memberi manfaat di tempat hidup bersama',
    model:'Project Based Learning ringan dan pembelajaran berbasis teks'
  },
  'ix-2-peringatan-maulid-rasul':{
    material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',
    insert:['Meneladani akhlak Rasulullah dalam kehidupan sehari-hari.','Menguatkan persaudaraan dan kontribusi kebangsaan melalui keteladanan Rasul.'],
    stimulus:'rangkaian gambar kegiatan maulid seperti selawat, ceramah, berbagi makanan, dan kerja bersama menyiapkan acara',
    action:'membuat laporan singkat kegiatan maulid berbahasa Arab dan memilih satu akhlak Rasul yang akan diwujudkan dalam tindakan nyata selama sepekan',
    reflection:'peringatan maulid bernilai ketika mendorong keteladanan akhlak, persaudaraan, dan kepedulian sosial',
    model:'Genre-Based Learning dan Project Based Learning ringan'
  },
  'ix-3-nuzulul-quran-dan-dua-hari-raya':{
    material:'Hari-Hari Besar Islam',themeIds:[1,5],type:'resmi',
    insert:['Menghayati nilai hari besar Islam dan adab perayaan.','Menjaga persatuan dan kepedulian sosial dalam kehidupan berbangsa.'],
    stimulus:'kartu peristiwa Nuzulul Quran, Idulfitri, dan Iduladha yang memuat kegiatan ibadah, silaturahmi, berbagi, serta beberapa contoh adab',
    action:'membuat infografis Arab tentang adab hari besar Islam yang memasukkan pesan berbagi, tidak berlebihan, dan menjaga kerukunan',
    reflection:'hari besar Islam memperkuat hubungan dengan Allah sekaligus mendorong kepedulian kepada sesama dan persatuan',
    model:'Project Based Learning dan pembelajaran berbasis teks'
  },
  'ix-4-keindahan-alam':{
    material:'Alam dan Pariwisata',themeIds:[1,3,4,5],type:'operasional',
    insert:['Mensyukuri keindahan alam sebagai ciptaan Allah.','Berwisata secara bertanggung jawab serta menjaga lingkungan dan budaya lokal.'],
    stimulus:'foto gunung, pantai, hutan, sungai, dan destinasi alam lokal yang menampilkan keindahan sekaligus risiko sampah atau kerusakan',
    action:'membuat panduan wisata alam singkat berbahasa Arab yang memuat ajakan menjaga kebersihan, menghormati budaya lokal, dan tidak merusak',
    reflection:'menikmati alam harus berjalan bersama rasa syukur, keselamatan, kepedulian lingkungan, dan penghormatan pada tanah air',
    model:'Project Based Learning dan pembelajaran komunikatif'
  },
  'ix-5-pencipta-alam':{
    material:'Alam',themeIds:[1,3],type:'resmi',
    insert:['Mensyukuri nikmat Allah melalui perilaku sehari-hari.','Larangan merusak lingkungan sebagaimana pesan Q.S. Ar-Rum ayat 41.'],
    stimulus:'video atau rangkaian gambar langit, bumi, manusia, hewan, tumbuhan, matahari, dan bulan sebagai pemantik tentang Sang Pencipta',
    action:'membuat video tentang langkah konkret menjaga keseimbangan alam sesuai ajaran Islam, menyertakan ayat Al-Qur’an atau hadis yang relevan, dan menggunakan isim mausul secara tepat',
    reflection:'rasa syukur kepada Allah dibuktikan melalui cara manusia memperlakukan dan menjaga ciptaan-Nya',
    model:'Project Based Learning (PjBL), diadaptasi dari contoh implementasi resmi KBC Bahasa Arab Fase D'
  },
  'ix-6-pelestarian-lingkungan':{
    material:'Lingkungan',themeIds:[3,4,5],type:'resmi',
    insert:['Menjaga lingkungan sebagai tanggung jawab bersama.','Menghubungkan aksi pelestarian dengan kepedulian kepada sesama dan tanah air.'],
    stimulus:'dua foto kondisi lingkungan sekolah sebelum dan sesudah dibersihkan atau ditata serta contoh sederhana pemilahan sampah',
    action:'melakukan audit mini kondisi lingkungan lalu membuat kampanye Arab yang menawarkan satu aksi realistis untuk sekolah atau rumah',
    reflection:'lingkungan yang terawat melindungi kesehatan bersama dan merupakan bentuk tanggung jawab terhadap sesama serta tanah air',
    model:'Project Based Learning dan aksi nyata lingkungan'
  }
};

function contextValue(m,prefix){
  const row=(m.contexts||[]).find(function(x){return String(x).toLowerCase().startsWith(prefix.toLowerCase());});
  return row?String(row).slice(String(row).indexOf(':')+1).trim().replace(/\.$/,''):'';
}
function cleanAllocation(value){
  return String(value||'').replace(/\s*\(alokasi rancangan preview;?\s*validasi final sebelum Production\)/gi,'').replace(/\s{2,}/g,' ').trim();
}
function cleanLegacy(value){
  return String(value==null?'':value)
    .replace(/KURIKULUM MERDEKA\s*[·-]\s*PEMBELAJARAN MENDALAM/gi,'KURIKULUM BERBASIS CINTA · KEMENTERIAN AGAMA')
    .replace(/Modul Ajar Deep Learning/gi,'Modul Ajar Kurikulum Berbasis Cinta')
    .replace(/\bDeep Learning\b/gi,'Kurikulum Berbasis Cinta')
    .replace(/Pembelajaran Mendalam\s*\(Mindful,\s*Meaningful,\s*Joyful\)/gi,'Pembelajaran kontekstual berbasis nilai KBC')
    .replace(/\bPembelajaran Mendalam\b/gi,'pembelajaran kontekstual berbasis nilai KBC')
    .replace(/\bMindful Learning\b/gi,'Kesadaran Nilai')
    .replace(/\bMeaningful Learning\b/gi,'Pemaknaan Kontekstual')
    .replace(/\bJoyful Learning\b/gi,'Pengalaman Belajar Menggembirakan')
    .replace(/\bE-Perangkat\b/gi,'Perangkat Pembelajaran')
    .replace(/\brancangan preview\b/gi,'rancangan pembelajaran')
    .replace(/\balokasi preview\b/gi,'alokasi pembelajaran')
    .replace(/\bvalidasi final sebelum Production\b/gi,'validasi satuan pendidikan')
    .replace(/\bsebelum Production\b/gi,'sesuai ketentuan satuan pendidikan')
    .replace(/\bpada preview\b/gi,'pada perangkat ini')
    .replace(/\bdokumen pratinjau\b/gi,'dokumen');
}
function themeText(ids){return ids.map(function(id){return N[id];}).join(' · ');}
function chapterName(m){return String(m.title||'').split('—').slice(-1)[0].trim()||m.title;}
function sentence(text){text=String(text||'').trim();return text?text.replace(/[.;:]?$/,''):'';}

for(const m of (D.modules||[])){
  const x=M[m.id]||{
    material:'Konteks materi bab',themeIds:[2,4],type:'operasional',
    insert:['Mengembangkan kecakapan Bahasa Arab dengan nilai cinta yang relevan.'],
    stimulus:'teks, gambar, atau situasi autentik yang dekat dengan kehidupan peserta didik',
    action:'menghasilkan produk komunikasi berbahasa Arab yang bermanfaat bagi diri dan sesama',
    reflection:'ilmu bahasa digunakan secara santun, bertanggung jawab, dan bermanfaat',
    model:'Task-Based Language Teaching dan Cooperative Learning'
  };
  const themes=x.themeIds.map(function(id){return N[id];});
  const product=contextValue(m,'Produk akhir');
  const func=contextValue(m,'Fungsi komunikasi');
  const structure=contextValue(m,'Struktur/pola');
  const vocab=contextValue(m,'Lingkup mufradat');
  const titleId=chapterName(m);
  const source=x.type==='resmi'
    ?'Pemetaan Tema KBC Bahasa Arab Fase D/MTs dalam Panduan KBC 6077/2025'
    :'Pemetaan operasional dari konteks bab berdasarkan Panca Cinta dan CP Bahasa Arab Fase D';
  const official=m.id==='ix-5-pencipta-alam';

  m.allocationDetail=cleanAllocation(m.allocationDetail);
  m.kbcMapping={
    material:x.material,
    themeIds:x.themeIds.slice(),
    type:x.type,
    insert:x.insert.slice(),
    themes:themes,
    basis:source
  };

  const iktp=[
    'Mengidentifikasi mufradat utama dan informasi penting pada teks lisan, visual, atau multimodal bertema '+titleId+'.',
    'Menggunakan ungkapan Bahasa Arab untuk '+sentence(func).toLowerCase()+' dengan pelafalan dan kesantunan yang sesuai konteks.',
    'Menemukan informasi tersurat serta makna kontekstual dari teks baca atau media bertema '+titleId+'.',
    'Menggunakan '+sentence(structure)+' secara tepat dalam kalimat atau percakapan sederhana.',
    'Menghasilkan '+sentence(product).toLowerCase()+' dengan isi dan struktur bahasa yang dapat dipahami.',
    'Menjelaskan hubungan materi '+titleId+' dengan '+themeText(x.themeIds)+'.',
    'Menunjukkan tindakan nyata: '+sentence(x.action)+'.',
    'Menulis atau menyampaikan refleksi tentang '+sentence(x.reflection)+'.'
  ];

  const meetings=[
    {
      number:1,duration:'3 JP · 120 menit',title:'Orientasi KBC, konteks '+titleId+', dan mufradat inti',
      opening:[
        'Guru memberi salam, mengajak berdoa, memeriksa kesiapan belajar, dan menyiapkan lingkungan yang mendukung penggunaan tulisan Arab.',
        'Apersepsi spesifik: guru menampilkan '+x.stimulus+'.',
        'Guru menyampaikan tujuan pertemuan serta Tema Panca Cinta yang akan dihidupkan: '+themeText(x.themeIds)+'.'
      ],
      core:[
        'Peserta didik mengamati stimulus lalu menyebutkan pengetahuan atau pengalaman awal yang berhubungan dengan '+titleId+'.',
        'Guru memodelkan pelafalan dan makna mufradat inti: '+vocab+'. Peserta didik mengelompokkan kata menurut fungsi atau konteksnya.',
        'Peserta didik mencocokkan gambar, kata, dan ungkapan, kemudian menggunakan beberapa mufradat dalam kalimat sederhana.',
        'Guru mengaitkan materi bahasa dengan Materi Insersi: '+x.insert.join(' '),
        'Kelompok menjawab pertanyaan nilai: bagaimana '+titleId+' dapat membantu mewujudkan '+themeText(x.themeIds)+' dalam kehidupan nyata?'
      ],
      closing:[
        'Peserta didik menuliskan tiga mufradat yang sudah dikuasai dan satu bagian yang masih memerlukan bantuan.',
        'Kelas menyimpulkan hubungan antara kecakapan Bahasa Arab, materi bab, dan nilai KBC.',
        'Guru memberi tindak lanjut singkat untuk menyiapkan kegiatan menyimak dan berbicara pada pertemuan berikutnya.'
      ]
    },
    {
      number:2,duration:'3 JP · 120 menit',title:'Istimā’–Kalām: '+func,
      opening:[
        'Guru membuka pembelajaran dengan salam dan doa lalu meninjau mufradat melalui kartu atau kuis lisan singkat.',
        'Apersepsi menggunakan satu situasi nyata dari '+titleId+' dan meminta peserta didik memprediksi ungkapan Arab yang diperlukan.',
        'Guru mengingatkan adab komunikasi yang sesuai dengan '+themeText(x.themeIds)+'.'
      ],
      core:[
        'Peserta didik menyimak dialog atau paparan singkat tentang '+titleId+' dua kali: pertama untuk gagasan umum, kedua untuk informasi rinci.',
        'Peserta didik menandai ungkapan yang digunakan untuk '+sentence(func).toLowerCase()+'.',
        'Guru memodelkan pelafalan, intonasi, dan respons yang santun; peserta didik berlatih terbimbing secara berpasangan.',
        'Peserta didik melakukan role-play atau simulasi komunikasi yang menuntut penerapan nilai: '+sentence(x.action)+'.',
        'Teman sebaya memberikan umpan balik pada ketepatan bahasa, kejelasan pesan, dan kesantunan, lalu peserta didik memperbaiki responsnya.'
      ],
      closing:[
        'Peserta didik menyebut satu ungkapan yang paling berguna dan satu sikap KBC yang berhasil dipraktikkan.',
        'Guru menegaskan bahwa kemampuan berbicara perlu berjalan bersama adab dan tanggung jawab.',
        'Peserta didik menyimpan satu contoh kalimat untuk digunakan pada kegiatan membaca atau menulis.'
      ]
    },
    {
      number:3,duration:'3 JP · 120 menit',title:'Qirā’ah–Mu’āyanah: memahami teks '+titleId,
      opening:[
        'Guru memberi salam, doa, dan menampilkan judul serta visual teks tanpa membuka seluruh isinya.',
        'Peserta didik memprediksi isi teks menggunakan mufradat yang sudah dipelajari.',
        'Guru menyampaikan fokus membaca: informasi utama, bukti teks, dan pesan nilai KBC.'
      ],
      core:[
        'Peserta didik membaca teks atau infografis bertema '+titleId+' secara bertahap dengan dukungan harakat atau glosarium sesuai kebutuhan.',
        'Peserta didik menemukan informasi tersurat, kata kunci, dan hubungan antarbagian teks.',
        'Kelompok menandai kalimat yang paling berkaitan dengan Materi Insersi: '+x.insert.join(' '),
        'Peserta didik menjelaskan dengan bahasa sederhana bagaimana isi teks mendukung '+themeText(x.themeIds)+'.',
        'Peserta didik membuat ringkasan visual atau tabel informasi lalu membandingkan hasilnya dengan kelompok lain.'
      ],
      closing:[
        'Kelas menyusun simpulan isi teks berdasarkan bukti yang ditemukan.',
        'Peserta didik menulis satu kalimat refleksi: '+x.reflection+'.',
        'Guru memberi penguatan kosakata dan menyiapkan contoh untuk fokus struktur pada pertemuan berikutnya.'
      ]
    },
    {
      number:4,duration:'3 JP · 120 menit',title:'Tarākib/Qawā’id: '+structure,
      opening:[
        'Guru membuka dengan salam dan doa lalu menampilkan dua atau tiga kalimat dari teks '+titleId+' yang memuat pola sasaran.',
        'Peserta didik membandingkan contoh dan mengemukakan dugaan aturan atau pola.',
        'Guru menghubungkan ketelitian berbahasa dengan Cinta Ilmu dan tanggung jawab menyampaikan pesan secara benar.'
      ],
      core:[
        'Guru menuntun peserta didik menemukan bentuk, fungsi, dan penggunaan '+structure+' dari contoh kontekstual.',
        'Peserta didik mengelompokkan contoh benar dan contoh yang perlu diperbaiki serta menjelaskan alasannya.',
        'Latihan bertahap dilakukan dari melengkapi kalimat, menyusun ulang, hingga membuat kalimat sendiri bertema '+titleId+'.',
        'Peserta didik membuat tiga sampai lima kalimat yang mengandung pola sasaran dan salah satu pesan: '+x.insert[0],
        'Pasangan bertukar hasil, memeriksa ketepatan struktur dan makna, lalu melakukan revisi.'
      ],
      closing:[
        'Peserta didik menyebutkan satu aturan struktur dengan contoh buatan sendiri.',
        'Guru memberi umpan balik pada kesalahan yang paling sering muncul tanpa mempermalukan peserta didik.',
        'Peserta didik menyiapkan pola dan kosakata yang akan dipakai untuk produk pada pertemuan kelima.'
      ]
    },
    {
      number:5,duration:'3 JP · 120 menit',title:'Kitābah dan Projek KBC: '+product,
      opening:[
        'Guru memberi salam, doa, dan menunjukkan contoh produk sederhana yang memenuhi kriteria bahasa serta pesan KBC.',
        'Peserta didik membaca rubrik produk: ketepatan Bahasa Arab, kejelasan informasi, integrasi nilai, dan kualitas komunikasi.',
        'Kelompok atau individu menentukan isi produk dengan tetap mengacu pada tujuan pembelajaran.'
      ],
      core:[
        'Peserta didik merancang '+sentence(product).toLowerCase()+' dengan memasukkan mufradat dan '+structure+'.',
        'Produk wajib memuat pesan atau tindakan KBC yang konkret: '+sentence(x.action)+'.',
        'Guru melakukan konferensi singkat untuk memeriksa ketepatan bahasa, kelayakan isi, dan keamanan atau etika produk.',
        'Peserta didik merevisi draf berdasarkan umpan balik guru dan teman sebaya.',
        'Peserta didik menyiapkan cara mempresentasikan produk serta satu penjelasan tentang hubungan produk dengan '+themeText(x.themeIds)+'.'
      ],
      closing:[
        'Peserta didik mengecek kelengkapan produk menggunakan rubrik.',
        'Setiap kelompok menetapkan tugas akhir sebelum presentasi.',
        'Guru mengingatkan bahwa kualitas produk dinilai bersama proses, kerja sama, dan integrasi nilai.'
      ]
    },
    {
      number:6,duration:'3 JP · 120 menit',title:'Presentasi, refleksi Panca Cinta, dan aksi nyata '+titleId,
      opening:[
        'Guru membuka dengan salam dan doa serta menegaskan aturan umpan balik yang santun.',
        'Peserta didik menyiapkan produk akhir dan bukti proses belajarnya.',
        'Kelas mengingat kembali Tema Panca Cinta dan Materi Insersi yang menjadi fokus bab.'
      ],
      core:[
        'Peserta didik mempresentasikan '+sentence(product).toLowerCase()+' menggunakan Bahasa Arab sesuai tingkat kemampuannya.',
        'Teman memberikan satu apresiasi dan satu saran berdasarkan rubrik bahasa, isi, serta nilai KBC.',
        'Peserta didik memperbaiki bagian produk atau penggunaan bahasa yang belum tepat.',
        'Peserta didik melaksanakan atau merencanakan aksi nyata: '+sentence(x.action)+'.',
        'Peserta didik melakukan penilaian diri tentang kemajuan kecakapan bahasa dan konsistensi menerapkan '+themeText(x.themeIds)+'.'
      ],
      closing:[
        'Refleksi akhir: '+x.reflection+'.',
        'Guru menghubungkan hasil refleksi dengan tindak lanjut remedial atau pengayaan.',
        'Kelas menutup dengan doa syukur atas ilmu dan komitmen membawa nilai yang dipelajari ke kehidupan sehari-hari.'
      ]
    }
  ];

  const assessment={
    diagnostic:[
      'Pemetaan awal mufradat dan pengalaman peserta didik melalui '+x.stimulus+'.',
      'Pertanyaan lisan singkat untuk mengetahui kesiapan menggunakan fungsi komunikasi: '+func+'.'
    ],
    formative:[
      'Observasi istimā’–kalām: ketepatan respons, pelafalan, kosakata, kesantunan, dan partisipasi.',
      'LKPD qirā’ah–mu’āyanah dan latihan '+structure+' dengan umpan balik langsung.',
      'Cek proses produk dan bukti integrasi Materi Insersi: '+x.insert.join(' ')
    ],
    summative:[
      'Kinerja/produk akhir: '+product+'.',
      'Tes atau tugas terstruktur untuk mengukur pemahaman teks dan penggunaan '+structure+'.'
    ],
    attitude:[
      'Observasi internalisasi '+themeText(x.themeIds)+' melalui pilihan kata, kerja sama, tanggung jawab, dan tindakan nyata.',
      'Bukti aksi KBC: '+x.action+'.'
    ],
    reflection:[
      'Refleksi pribadi: '+x.reflection+'.'
    ]
  };


  if(official){
    m.allocation='9 × 40 menit';
    m.allocationDetail='9 × 40 menit · 3 pertemuan';
    m.objectives=[{
      text:'Mengomunikasikan ide secara tertulis maupun lisan melalui paragraf sederhana dan teks terstruktur tentang alam dengan susunan gramatikal isim mausul sebagai wujud cinta kepada Allah Swt. dan lingkungan.',
      jp:9
    }];

    iktp.splice(0,iktp.length,
      'Menjelaskan pengertian isim mausul.',
      'Mengenali jenis-jenis isim mausul.',
      'Mengidentifikasi isim mausul di dalam kalimat.',
      'Menggunakan isim mausul dalam kalimat.',
      'Menjelaskan fungsi isim mausul dalam kalimat.',
      'Menyebutkan ayat Al-Qur’an atau hadis yang berkaitan dengan penciptaan bumi dan langit sebagai tanda kebesaran Allah Swt.',
      'Menuliskan tindakan nyata yang mencerminkan rasa syukur kepada Allah Swt. atas alam semesta.',
      'Menjelaskan dampak negatif tindakan manusia yang merusak keseimbangan alam.',
      'Membuat video langkah konkret menjaga keseimbangan alam sesuai ajaran Islam dengan memasukkan kaidah isim mausul.'
    );

    meetings.splice(0,meetings.length,
      {
        number:1,duration:'3 × 40 menit',title:'Orientasi dan perancangan projek خَالِقُ الْعَالَم',
        phaseLabels:['Orientasi terhadap Projek','Orientasi terhadap Projek','Orientasi terhadap Projek','Orientasi terhadap Projek','Perancangan Projek','Perancangan Projek'],
        opening:[
          'Guru membuka pembelajaran dengan salam dan doa.',
          'Apersepsi: peserta didik menyebutkan satu ciptaan Allah Swt. yang paling mereka kagumi.',
          'Guru menyampaikan tujuan pembelajaran, projek, serta kaitannya dengan kebesaran Allah Swt. sebagai Pencipta alam semesta.'
        ],
        core:[
          'Peserta didik mengamati gambar atau video tentang keindahan alam semesta dan menanggapi pertanyaan pemantik tentang Sang Pencipta.',
          'Peserta didik menyimak ayat Al-Qur’an yang relevan, lalu mendiskusikan hubungan خَالِق, مَخْلُوق, dan خَالِقُ الْعَالَم serta tanggung jawab manusia terhadap ciptaan.',
          'Guru memperdengarkan teks خَالِقُ الْعَالَم; peserta didik menyimak, membaca dengan bimbingan, dan mendalami gagasan teks.',
          'Peserta didik menyampaikan pendapat secara lisan tentang cinta kepada Allah Swt., rasa syukur, dan kepedulian terhadap alam.',
          'Peserta didik bekerja dalam kelompok untuk merancang projek video langkah menjaga keseimbangan alam.',
          'Rancangan video wajib menyertakan ayat Al-Qur’an atau hadis yang relevan serta penggunaan isim mausul.'
        ],
        closing:[
          'Peserta didik menyimpulkan pembelajaran dan rancangan projek.',
          'Guru mengajak peserta didik membaca doa syukur atas ilmu yang diperoleh.',
          'Guru menyampaikan salam penutup.'
        ]
      },
      {
        number:2,duration:'3 × 40 menit',title:'Pelaksanaan dan monitoring projek KBC',
        phaseLabels:['Pelaksanaan Projek','Monitoring','Monitoring','Monitoring','Monitoring'],
        opening:[
          'Guru membuka pembelajaran dengan salam dan doa.',
          'Guru menanyakan kembali bagaimana manusia menjaga ciptaan Allah Swt. sebagai wujud cinta kepada-Nya.',
          'Guru menegaskan konsep خَالِق dan مَخْلُوق, tanggung jawab manusia terhadap alam, serta nilai keimanan dan ketakwaan dalam projek.'
        ],
        core:[
          'Setiap kelompok melaksanakan pembuatan video tentang langkah menjaga keseimbangan alam dengan menyertakan ayat Al-Qur’an atau hadis yang relevan.',
          'Guru memantau partisipasi setiap anggota kelompok dan perkembangan projek.',
          'Guru memberikan umpan balik atau alternatif solusi ketika kelompok mengalami kesulitan.',
          'Guru mencocokkan isi projek dengan IKTP, termasuk penggunaan isim mausul dan integrasi Cinta Allah serta Cinta Lingkungan.',
          'Kelompok merevisi projek berdasarkan umpan balik dan mendokumentasikan perkembangan projek.'
        ],
        closing:[
          'Setiap kelompok melaporkan progres projek.',
          'Guru memberi umpan balik dan arahan untuk penyelesaian projek.',
          'Kelas menutup dengan doa syukur dan salam.'
        ]
      },
      {
        number:3,duration:'3 × 40 menit',title:'Presentasi, evaluasi, dan refleksi projek',
        phaseLabels:['Penyajian Hasil/Presentasi Projek','Penyajian Hasil/Presentasi Projek','Evaluasi dan Refleksi','Evaluasi dan Refleksi','Evaluasi dan Refleksi'],
        opening:[
          'Guru membuka pembelajaran dengan salam dan doa.',
          'Peserta didik merefleksikan proses projek yang telah dilakukan.',
          'Guru menegaskan bahwa menjaga alam merupakan wujud cinta kepada Allah Swt.'
        ],
        core:[
          'Setiap kelompok mempresentasikan hasil video projek di depan kelas.',
          'Guru dan kelompok lain memberikan apresiasi serta umpan balik terhadap isi, Bahasa Arab, penggunaan isim mausul, dan pesan KBC.',
          'Guru bersama peserta didik mengevaluasi projek dan merefleksikan wujud cinta kepada Allah Swt. melalui kepedulian lingkungan.',
          'Kelas mendiskusikan dampak tindakan manusia yang merusak keseimbangan alam.',
          'Peserta didik menyusun langkah konkret menjaga alam sebagai wujud syukur kepada Allah Swt.'
        ],
        closing:[
          'Peserta didik menyimpulkan hasil pembelajaran.',
          'Peserta didik membuat jurnal refleksi tentang خَالِقُ الْعَالَم dan tindakan kecil menjaga ciptaan Allah Swt.',
          'Guru mengajak membaca doa syukur dan menyampaikan salam penutup.'
        ]
      }
    );

    assessment.diagnostic.splice(0,assessment.diagnostic.length,
      'Pertanyaan pemantik tentang ciptaan Allah Swt., pengetahuan awal tentang isim mausul, dan pengalaman menjaga lingkungan.'
    );
    assessment.formative.splice(0,assessment.formative.length,
      'Kuis singkat tentang ciptaan Allah Swt. dan peran makhluk hidup dalam menjaga keseimbangan.',
      'Observasi partisipasi peserta didik dalam diskusi serta proses pengerjaan projek.',
      'Monitoring penggunaan isim mausul dan keterpaduan ayat Al-Qur’an atau hadis dalam projek.'
    );
    assessment.summative.splice(0,assessment.summative.length,
      'Poster atau infografik tentang cara menjaga keseimbangan alam sebagai bentuk cinta kepada Allah Swt.',
      'Jurnal refleksi tentang rasa syukur terhadap ciptaan Allah Swt.',
      'Video projek digunakan sebagai bukti kinerja proses dan komunikasi Bahasa Arab.'
    );
    assessment.attitude.splice(0,assessment.attitude.length,
      'Observasi kepedulian peserta didik terhadap ciptaan Allah Swt.',
      'Penilaian komitmen peserta didik dalam menjaga keseimbangan alam.'
    );
    assessment.reflection.splice(0,assessment.reflection.length,
      'Refleksi hubungan cinta kepada Allah Swt., rasa syukur, dan tindakan menjaga lingkungan.'
    );
  }

  const plan={
    officialExample:official,
    label:official?'CONTOH RESMI KBC · BAHASA ARAB FASE D':'IMPLEMENTASI KBC · BAHASA ARAB FASE D',
    source:official?'Panduan KBC 6077/2025, Lampiran 2 contoh RPP Bahasa Arab Fase D halaman 78–82 (PDF halaman 82–86); struktur pokok dipertahankan dan redaksi aktivitas disesuaikan untuk perangkat cetak.':source,
    material:m.title,
    themes:themes,
    inserts:x.insert.slice(),
    allocation:m.allocationDetail||m.allocation,
    model:x.model,
    objective:'Peserta didik mengembangkan kecakapan Bahasa Arab pada tema '+titleId+' melalui '+sentence(func).toLowerCase()+', menghasilkan '+sentence(product).toLowerCase()+', serta menghayati '+themeText(x.themeIds)+' melalui refleksi dan tindakan nyata.',
    iktp:iktp,
    meetings:meetings,
    assessment:assessment,
    action:x.action,
    reflection:x.reflection
  };

  m.kbcPlan=plan;
  m.kbcPrototype=plan;
  m.framework=[
    {label:'Orientasi Kurikulum',text:'Kurikulum Berbasis Cinta menjadi kerangka integrasi nilai pada kompetensi Bahasa Arab.'},
    {label:'Model Pembelajaran',text:x.model+'. Model dipilih karena selaras dengan tujuan komunikasi dan produk pada bab ini.'},
    {label:'Tema Panca Cinta',text:themeText(x.themeIds)+'.'},
    {label:'Materi Insersi',text:x.insert.join(' ')},
    {label:'Strategi Bahasa Arab',text:'Pemodelan bunyi dan ungkapan, latihan istimā’–kalām, qirā’ah–mu’āyanah, penguatan tarākib/qawā’id, kitābah, serta presentasi kontekstual.'},
    {label:'Diferensiasi Konten',text:'Teks berharakat atau standar, audio, gambar, kartu mufradat, contoh kalimat, dan bahan pengayaan bertema '+titleId+' diberikan sesuai kesiapan.'},
    {label:'Diferensiasi Proses',text:'Latihan individu, pasangan, kelompok fleksibel, pemodelan guru, tutor sebaya, dan scaffolding digunakan sesuai kebutuhan peserta didik pada '+titleId+'.'},
    {label:'Diferensiasi Produk',text:'Peserta didik dapat menyesuaikan format '+sentence(product).toLowerCase()+' tanpa mengurangi tuntutan kecakapan bahasa dan pesan KBC.'},
    {label:'Media/Platform',text:'Teks Arab, audio guru atau sumber legal, kartu kosakata, gambar atau video kontekstual, papan tulis, kamus, dan alat presentasi bila tersedia.'}
  ];
  m.meetings=meetings.map(function(mt){
    return{
      number:mt.number,
      duration:mt.duration,
      topic:mt.title,
      pendahuluan:mt.opening.slice(),
      inti:mt.core.slice(),
      penutup:mt.closing.slice(),
      phaseLabels:Array.isArray(mt.phaseLabels)?mt.phaseLabels.slice():[]
    };
  });
  m.assessment=[
    'ASESMEN DIAGNOSTIK',
    assessment.diagnostic.join(' '),
    'ASESMEN FORMATIF',
    assessment.formative.join(' '),
    'ASESMEN SUMATIF',
    assessment.summative.join(' '),
    'INTERNALISASI NILAI KBC',
    assessment.attitude.join(' '),
    'REFLEKSI DAN AKSI NYATA',
    assessment.reflection.join(' ')
  ];
  if(typeof m.filename==='string')m.filename=cleanLegacy(m.filename).replace(/\s*\(Kurikulum Berbasis Cinta\)/gi,'');
}

for(const doc of (D.coreDocuments||[])){
  if(typeof doc.filename==='string')doc.filename=cleanLegacy(doc.filename);
  if(Array.isArray(doc.paragraphs))doc.paragraphs=doc.paragraphs.map(cleanLegacy);
  if(typeof doc.title==='string')doc.title=cleanLegacy(doc.title);
  if(typeof doc.description==='string')doc.description=cleanLegacy(doc.description);
}
for(const item of (D.corrections||[])){
  if(typeof item==='string')continue;
  for(const key of Object.keys(item||{}))if(typeof item[key]==='string')item[key]=cleanLegacy(item[key]);
}
if(D.specialSchedule){
  for(const key of ['status','basis','note','description']){
    if(typeof D.specialSchedule[key]==='string')D.specialSchedule[key]=cleanLegacy(D.specialSchedule[key]);
  }
}
})();