(() => {
  'use strict';

  const VERSION = '20260912-3';
  const DONE = 'epDifferentiationVersion';

  const SUBJECTS = {
    'bahasa-indonesia': { label: 'Bahasa Indonesia', family: 'language' },
    'bahasa-inggris': { label: 'Bahasa Inggris', family: 'language' },
    'bahasa-inggris-tingkat-lanjut': { label: 'Bahasa Inggris Tingkat Lanjut', family: 'language' },
    matematika: { label: 'Matematika', family: 'math' },
    'matematika-tingkat-lanjut': { label: 'Matematika Tingkat Lanjut', family: 'math' },
    ipas: { label: 'IPAS', family: 'science' },
    ipa: { label: 'IPA', family: 'science' },
    biologi: { label: 'Biologi', family: 'science' },
    fisika: { label: 'Fisika', family: 'science' },
    kimia: { label: 'Kimia', family: 'science' },
    ips: { label: 'IPS', family: 'social' },
    ekonomi: { label: 'Ekonomi', family: 'social' },
    geografi: { label: 'Geografi', family: 'social' },
    sejarah: { label: 'Sejarah', family: 'social' },
    sosiologi: { label: 'Sosiologi', family: 'social' },
    'pendidikan-pancasila': { label: 'Pendidikan Pancasila', family: 'values' },
    'pendidikan-agama-islam': { label: 'Pendidikan Agama Islam', family: 'religion' },
    pjok: { label: 'PJOK', family: 'pe' },
    'seni-rupa': { label: 'Seni Rupa', family: 'arts' },
    'seni-musik': { label: 'Seni Musik', family: 'arts' },
    'seni-budaya': { label: 'Seni Budaya', family: 'arts' },
    prakarya: { label: 'Prakarya', family: 'craft' },
    informatika: { label: 'Informatika', family: 'technology' }
  };

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function routeContext() {
    const match = location.pathname.match(/E-Perangkat_([^/]+)_Fase-([A-F])/i);
    const slug = match ? match[1].toLowerCase() : '';
    const phase = match ? match[2].toUpperCase() : '';
    const subject = SUBJECTS[slug] || {
      label: slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Mata Pelajaran',
      family: 'general'
    };
    return { ...subject, slug, phase };
  }

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function choose(items, seed, shift = 0) {
    return items[(seed + shift) % items.length];
  }

  function shortFocus(topic, chapter) {
    let value = normalize(topic)
      .replace(/^(peserta didik|murid)\s+(mampu|dapat|mengembangkan kemampuan untuk|memiliki kemampuan untuk)\s+/i, '')
      .replace(/^kemampuan (peserta didik|murid) (untuk|dalam)\s+/i, '')
      .replace(/^(melalui kegiatan ini[,]?\s*)/i, '')
      .replace(/[.;:,]+$/, '');
    const chapterValue = normalize(chapter).replace(/^Bab\s*\d+\s*[·:-]?\s*/i, '');
    if (/uji kompetensi|tindak lanjut|refleksi/i.test(value) && chapterValue) {
      value += ` pada ${chapterValue}`;
    }
    if (!value || value.length < 12) value = chapterValue;
    const words = value.split(' ');
    if (words.length > 17) value = words.slice(0, 17).join(' ') + '…';
    return value || 'tujuan pembelajaran pada pertemuan ini';
  }

  function demandOf(text) {
    const value = text.toLowerCase();
    if (/merefleks|menilai|mengevaluasi|mengkritik|memvalidasi|memeriksa/.test(value)) return 'evaluate';
    if (/mencipta|membuat|menulis|menyusun|merancang|mengembangkan|menghasilkan|memproduksi|menampilkan|mempraktikkan|mendemonstrasikan|memodifikasi|melakukan/.test(value)) return 'create';
    if (/menganalisis|membanding|menghubungkan|menelaah|menginterpretasi|menafsirkan|menalar|menguraikan/.test(value)) return 'analyze';
    if (/menerapkan|menggunakan|menghitung|menentukan|menyelesaikan|mengolah|menyesuaikan/.test(value)) return 'apply';
    if (/mengamati|menyelidiki|mengeksplorasi|mengumpulkan|mengukur|percobaan|eksperimen/.test(value)) return 'investigate';
    if (/mengomunikasikan|mempresentasikan|menyampaikan|berbicara|menyimak|membaca|memirsa/.test(value)) return 'communicate';
    return 'understand';
  }

  function phaseProfile(phase) {
    if (phase === 'A') return {
      access: 'benda nyata, gambar tunggal, kalimat sangat pendek, dan contoh dari lingkungan terdekat',
      support: 'pemodelan langsung, instruksi satu langkah, pasangan pendamping, serta jeda respons',
      evidence: 'jawaban lisan, menunjuk/mengelompokkan, gambar berlabel, atau unjuk kerja singkat'
    };
    if (phase === 'B') return {
      access: 'benda/gambar, teks pendek, kartu urutan, dan contoh kontekstual yang dikenal murid',
      support: 'contoh dikerjakan, pertanyaan bertahap, pasangan atau kelompok kecil sementara',
      evidence: 'penjelasan lisan/tulisan pendek, diagram sederhana, model, atau demonstrasi'
    };
    if (phase === 'C') return {
      access: 'contoh konkret dan abstrak, teks/data ringkas, diagram, serta kasus keseharian',
      support: 'pengatur grafis, petunjuk bertahap, konferensi singkat, dan kelompok fleksibel',
      evidence: 'laporan ringkas, presentasi, diagram/model, demonstrasi, atau produk terapan'
    };
    if (phase === 'D') return {
      access: 'sumber autentik terpilih, representasi visual-simbolik, data, dan kasus dengan kerumitan bertahap',
      support: 'kelompok fleksibel berbasis cek awal, pertanyaan penuntun, telaah sejawat, dan tantangan terbuka',
      evidence: 'analisis tertulis/lisan, model, presentasi berbukti, demonstrasi, atau produk digital'
    };
    return {
      access: 'sumber autentik multiperspektif, data kompleks, model konseptual, dan bacaan pengayaan',
      support: 'jalur kerja mandiri/kolaboratif, konferensi guru, umpan balik sejawat, dan tantangan transfer',
      evidence: 'argumen berbukti, laporan analitis, kinerja, prototipe, presentasi, atau produk multimodal'
    };
  }

  function readinessLabel(phase) {
    return ['A', 'B'].includes(phase)
      ? 'hasil cek singkat melalui gambar, benda, pertanyaan lisan, atau contoh kerja'
      : 'hasil asesmen awal singkat, analisis respons, dan bukti kerja pertemuan sebelumnya';
  }

  const familyPlans = {
    language: {
      content: {
        understand: ['contoh teks/audio pendek beranotasi, kartu kosakata kunci, dan contoh-tandingan', 'potongan teks autentik dengan penanda struktur, glosarium, dan versi tanpa anotasi'],
        communicate: ['model tuturan/teks sesuai konteks, bank ungkapan, serta contoh respons dengan tingkat dukungan berbeda', 'rekaman atau teks model, transkrip bertanda, dan daftar ungkapan yang relevan'],
        analyze: ['dua teks/rekaman bertema serupa tetapi berbeda tujuan atau sudut pandang, lengkap dengan bukti yang dapat ditandai', 'teks pembanding, pertanyaan analitis bertingkat, dan sumber autentik untuk perluasan'],
        create: ['teks model yang menonjolkan struktur dan pilihan bahasa, kerangka perencanaan, serta contoh karya utuh', 'mentor text, daftar periksa unsur, bank kosakata, dan sumber inspirasi yang terkait topik'],
        evaluate: ['dua karya dengan kekuatan berbeda, rubrik ringkas, dan cuplikan bukti untuk ditimbang'],
        apply: ['contoh bahasa dalam beberapa konteks nyata, penyangga kalimat, dan tugas transfer tanpa penyangga'],
        investigate: ['rekaman/teks autentik, lembar pencatatan ciri, serta sumber pembanding yang dapat diverifikasi']
      },
      process: {
        understand: ['murid menandai bagian penting pada contoh bersama, lalu memilih latihan cocokkan, urutkan, atau jelaskan sesuai hasil cek awal', 'guru memodelkan satu contoh; kelompok sementara membaca/menyimak dengan penyangga berbeda lalu membandingkan temuan'],
        communicate: ['latihan berjenjang dari meniru model, berlatih dengan kartu bantu, hingga improvisasi; pasangan dirotasi setelah umpan balik', 'murid merekam latihan awal, memilih fokus perbaikan, lalu berlatih melalui konferensi singkat atau pasangan sejawat'],
        analyze: ['kelompok sementara memakai kode warna untuk bukti, membandingkan tafsir, lalu kelompok siap lanjut menguji sudut pandang alternatif'],
        create: ['murid memilih konteks/minat, menyusun draf dengan tingkat kerangka berbeda, menerima konferensi atau telaah sejawat, lalu merevisi'],
        evaluate: ['murid mengalibrasi rubrik pada contoh, menilai karya anonim dengan bukti, lalu memperbaiki keputusan setelah diskusi'],
        apply: ['murid berlatih pada konteks pilihan dengan penyangga kalimat berbeda, kemudian semua mencoba satu tugas transfer mandiri'],
        investigate: ['kelompok mengumpulkan ciri dari sumber berbeda, memeriksa konsistensi temuan, lalu merumuskan simpulan bersama']
      },
      product: ['teks beranotasi, penjelasan audio, dialog/peragaan, atau paragraf terstruktur', 'ringkasan visual, rekaman tanggapan, teks tertulis, atau presentasi singkat', 'karya teks/tuturan, portofolio revisi, atau ulasan berbukti']
    },
    math: {
      content: {
        understand: ['representasi konkret–gambar–simbol tentang konsep, contoh dikerjakan, dan contoh-tandingan', 'model visual, tabel/pola, notasi formal, serta soal noncontoh untuk menguji batas konsep'],
        communicate: ['beberapa strategi penyelesaian yang setara, diagram, dan contoh penjelasan matematis yang lengkap'],
        analyze: ['dua strategi atau model dengan asumsi berbeda, data/diagram pembanding, dan masalah terbuka'],
        create: ['contoh model matematika, batasan rancangan, himpunan data, dan tantangan optimasi'],
        evaluate: ['solusi benar dan solusi bermiskonsepsi, rubrik alasan matematis, serta data untuk verifikasi'],
        apply: ['soal kontekstual bertingkat, contoh setengah jadi, representasi visual, dan tantangan transfer tanpa petunjuk'],
        investigate: ['pola/data yang dapat dimanipulasi, tabel pengamatan, alat ukur atau aplikasi, serta kasus perluasan']
      },
      process: {
        understand: ['murid berpindah dari manipulatif/model visual ke simbol; dukungan dikurangi setelah setiap bukti pemahaman', 'guru mengelompokkan sementara berdasarkan miskonsepsi, lalu murid menyortir contoh/noncontoh dan menjelaskan kriterianya'],
        communicate: ['murid memilih satu strategi, membuat representasi, lalu bertukar penjelasan dengan pasangan yang memakai strategi lain'],
        analyze: ['kelompok membedah strategi berbeda, menandai asumsi dan efisiensi, lalu mempertahankan pilihan dengan bukti'],
        create: ['murid memilih konteks data, membuat model, menguji batasan, lalu memperbaiki model melalui konferensi singkat'],
        evaluate: ['murid mendiagnosis solusi bermiskonsepsi, memeriksa dengan strategi kedua, kemudian menulis perbaikannya'],
        apply: ['jalur latihan ditentukan dari cek awal: contoh terpandu, latihan parsial, atau tantangan terbuka; semua berakhir pada soal transfer yang sama'],
        investigate: ['murid memanipulasi pola/data, membuat dugaan, menguji beberapa kasus, lalu membandingkan generalisasi']
      },
      product: ['model konkret/diagram beserta penjelasan, solusi tertulis, atau rekaman penalaran', 'tabel/grafik, strategi penyelesaian beranotasi, atau presentasi pembuktian', 'model matematika, rekomendasi berbasis perhitungan, atau soal ciptaan beserta solusi']
    },
    science: {
      content: {
        understand: ['fenomena pemantik, diagram/model berlabel, kosakata konsep, dan contoh-tandingan', 'model makro–submikro/sistem, bacaan ringkas, serta data sederhana yang menghubungkan konsep dengan fenomena'],
        communicate: ['data atau hasil pengamatan, model penjelasan ilmiah, dan contoh klaim–bukti–penalaran'],
        analyze: ['dua set data/model dengan pola berbeda, sumber ilmiah ringkas, serta bukti yang mengandung anomali'],
        create: ['kriteria rancangan/penyelidikan, contoh prosedur aman, data acuan, dan sumber pengayaan'],
        evaluate: ['klaim ilmiah alternatif, data pendukung/penyangkal, kriteria kualitas bukti, dan sumber yang dapat diverifikasi'],
        apply: ['kasus fenomena nyata bertingkat, diagram atau persamaan pendukung, dan kasus transfer baru'],
        investigate: ['objek/fenomena, prosedur keselamatan, alat atau simulasi, tabel pencatatan, dan data pembanding']
      },
      process: {
        understand: ['murid menghubungkan observasi dengan model melalui kartu sebab–akibat; guru memberi model berlabel hanya kepada kelompok yang memerlukan'],
        communicate: ['murid menyusun klaim–bukti–penalaran dari data yang sama, dengan kerangka kalimat yang dapat dilepas saat siap'],
        analyze: ['kelompok menganalisis set data berbeda lalu melakukan jigsaw untuk menguji apakah simpulan tetap berlaku'],
        create: ['kelompok memilih variabel/konteks, merancang prosedur aman, menerima konferensi persetujuan, lalu menguji dan merevisi'],
        evaluate: ['murid memberi bobot pada mutu sumber dan kecukupan bukti, berdebat terstruktur, lalu merevisi klaim'],
        apply: ['jalur belajar berupa demonstrasi terpandu, simulasi, atau kasus mandiri dipilih dari cek konsep; semua menyelesaikan kasus transfer yang sama'],
        investigate: ['peran kelompok dibagi pada pengukuran, pencatatan, keselamatan, dan pemeriksaan data; dukungan alat/prosedur disesuaikan dengan kesiapan']
      },
      product: ['diagram/model beranotasi dan penjelasan, laporan pengamatan, atau rekaman demonstrasi', 'tabel/grafik beserta klaim–bukti–penalaran, poster ilmiah, atau presentasi', 'laporan penyelidikan, model sistem, atau rekomendasi solusi berbasis data']
    },
    social: {
      content: {
        understand: ['peta/timeline, data ringkas, istilah kunci, dan narasi kontekstual', 'sumber primer/sekunder singkat, peta atau infografik, serta contoh dari konteks lokal'],
        communicate: ['data sosial, kutipan sumber, peta/diagram, dan contoh argumen berbukti'],
        analyze: ['paket sumber multiperspektif, data/timeline pembanding, dan pertanyaan tentang sebab–akibat'],
        create: ['data autentik, kebutuhan pemangku kepentingan, contoh rancangan, dan kriteria kelayakan'],
        evaluate: ['dua interpretasi/kebijakan, sumber dengan kredibilitas berbeda, dan kriteria penilaian dampak'],
        apply: ['kasus lokal dan nasional bertingkat, peta/data pendukung, serta skenario transfer'],
        investigate: ['peta, statistik, wawancara/dokumen, lembar pemeriksaan sumber, dan kasus pembanding']
      },
      process: {
        understand: ['murid mengurutkan peristiwa/konsep dan menghubungkannya dengan peta atau data; penyangga istilah diberikan sesuai cek awal'],
        communicate: ['kelompok memilih bukti paling relevan, menyusun argumen dengan kerangka yang berbeda, lalu melakukan tanya jawab silang'],
        analyze: ['kelompok ahli membaca sumber berbeda, menilai konteks dan bias, lalu menyintesis sebab, dampak, dan perspektif'],
        create: ['murid memilih masalah/pemangku kepentingan, merancang solusi, menguji kelayakan terhadap data, lalu merevisi'],
        evaluate: ['murid memakai matriks kriteria untuk menimbang kebijakan/interpretasi, kemudian mempertahankan rekomendasi dengan bukti'],
        apply: ['kelompok bekerja pada kasus dengan kerumitan bertahap, memakai peta/data bila perlu, lalu semua menghadapi skenario transfer'],
        investigate: ['murid merumuskan pertanyaan, memeriksa sumber, mengode data, lalu membandingkan temuan antarkelompok']
      },
      product: ['timeline/peta beranotasi, penjelasan lisan, atau ringkasan sebab–akibat', 'infografik data, esai/rekaman argumen, atau presentasi multiperspektif', 'policy brief, laporan kajian, peta tematik, atau rekomendasi berbukti']
    },
    values: {
      content: {
        understand: ['cerita/kasus konkret, gambar aturan atau simbol, istilah nilai, dan contoh–noncontoh perilaku', 'kutipan norma/konstitusi yang relevan, kasus keseharian, dan infografik hak–kewajiban'],
        communicate: ['skenario dialog, sumber norma, dan contoh alasan yang santun serta berbukti'],
        analyze: ['kasus dilema dari beberapa perspektif, dasar norma, dan data dampak keputusan'],
        create: ['contoh kesepakatan/aksi warga, kebutuhan lingkungan, dan kriteria adil serta dapat dilaksanakan'],
        evaluate: ['alternatif keputusan, dasar nilai/norma, perspektif pihak terdampak, dan kriteria keadilan'],
        apply: ['kasus rumah/sekolah/masyarakat bertingkat dan kartu pertimbangan hak, kewajiban, serta dampak'],
        investigate: ['kasus lokal, wawancara/data sederhana, sumber norma, dan lembar pemeriksaan fakta']
      },
      process: {
        understand: ['murid menyortir contoh–noncontoh, bermain peran singkat, lalu menjelaskan nilai yang tampak dengan dukungan kalimat sesuai kebutuhan'],
        communicate: ['murid berlatih menyampaikan pendapat melalui think–pair–share, memakai kartu alasan bila perlu, lalu menanggapi dengan santun'],
        analyze: ['kelompok mengambil perspektif pihak berbeda, menautkan keputusan pada norma, lalu mencari titik temu'],
        create: ['murid memilih masalah kelas/sekolah, menyusun aksi atau kesepakatan, menerima umpan balik pihak terdampak, lalu merevisi'],
        evaluate: ['murid memakai matriks nilai–aturan–dampak untuk menilai pilihan, kemudian menulis keputusan dan pertanggungjawabannya'],
        apply: ['kelompok menyelesaikan skenario bertingkat dengan pertanyaan penuntun berbeda, lalu semua merefleksikan dampak pilihannya'],
        investigate: ['murid mengumpulkan fakta dan perspektif, memisahkan fakta dari opini, lalu menyusun simpulan berbasis norma']
      },
      product: ['peta konsep nilai, dialog/peragaan, jurnal refleksi, atau poster contoh tindakan', 'argumen lisan/tulisan, infografik hak–kewajiban, atau analisis kasus', 'rencana aksi, kesepakatan kelas, kampanye publik, atau rekomendasi berbasis norma']
    },
    religion: {
      content: {
        understand: ['ayat/hadis atau kisah yang relevan beserta arti, kosakata kunci, gambar urutan, dan contoh penerapan', 'sumber ajaran terpilih, penjelasan konteks, contoh–noncontoh, dan kasus kehidupan'],
        communicate: ['sumber ajaran, model bacaan/tuturan, kosakata, dan contoh penjelasan yang beradab'],
        analyze: ['dalil/sumber terpilih, konteks kasus, ragam sudut pandang yang dapat dipertanggungjawabkan, dan bukti dampak'],
        create: ['teladan karya/aksi, sumber ajaran, kebutuhan sasaran, dan kriteria manfaat serta adab'],
        evaluate: ['kasus pilihan moral, sumber ajaran, dampak bagi pihak terkait, dan kriteria kemaslahatan'],
        apply: ['skenario ibadah/akhlak/muamalah bertingkat, panduan langkah, dan kasus transfer'],
        investigate: ['sumber ajaran, kisah/kasus, panduan pemeriksaan sumber, serta data atau observasi sederhana']
      },
      process: {
        understand: ['guru memodelkan makna/praktik; murid mengurutkan, mencocokkan, atau menjelaskan sesuai kesiapan lalu mengaitkan dengan kehidupan'],
        communicate: ['murid berlatih membaca/menjelaskan dengan contoh, umpan balik individual atau teman sebaya, lalu memperbaiki ketepatan dan adab'],
        analyze: ['kelompok menautkan bukti dari sumber ajaran dengan konteks kasus, menimbang dampak, lalu menyampaikan simpulan secara santun'],
        create: ['murid memilih konteks pengabdian/karya, merancang produk yang selaras dengan ajaran, lalu merevisi setelah telaah manfaat dan adab'],
        evaluate: ['murid memakai kriteria dalil–niat–cara–dampak untuk menilai kasus, kemudian menjelaskan keputusan dan perbaikannya'],
        apply: ['jalur praktik berupa contoh langsung, kartu urutan, atau kasus mandiri disesuaikan hasil cek awal; kriteria ketepatan tetap sama'],
        investigate: ['murid memeriksa sumber, mencatat fakta dan nilai, berdiskusi dengan peran berbeda, lalu menyusun simpulan']
      },
      product: ['urutan bergambar, demonstrasi/praktik, penjelasan lisan, atau jurnal penerapan', 'peta dalil–makna–contoh, analisis kasus, poster edukasi, atau rekaman penjelasan', 'rencana aksi, kajian ringkas berbukti, demonstrasi terukur, atau media dakwah edukatif']
    },
    pe: {
      content: {
        understand: ['urutan gerak bergambar/video lambat, isyarat keselamatan, dan contoh posisi benar–perlu diperbaiki'],
        communicate: ['contoh performa, kosakata/isyarat gerak, kartu observasi, dan data respons tubuh'],
        analyze: ['rekaman gerak dari sudut berbeda, data hasil/denyut atau waktu, dan kriteria efisiensi serta keselamatan'],
        create: ['contoh rangkaian/permainan, batas keselamatan, pilihan alat, dan target kebugaran individual'],
        evaluate: ['rekaman performa, data kebugaran, daftar periksa teknik, dan indikator keselamatan'],
        apply: ['demonstrasi gerak, kartu tahapan, modifikasi alat/jarak/tempo, dan tantangan permainan'],
        investigate: ['contoh aktivitas, alat ukur sederhana, tabel respons tubuh, dan panduan keselamatan']
      },
      process: {
        understand: ['guru memodelkan gerak per bagian; murid berlatih di stasiun dengan isyarat visual/verbal dan tempo sesuai kesiapan'],
        communicate: ['pasangan mengamati satu indikator teknik, memberi umpan balik singkat, lalu bertukar peran dan mencoba kembali'],
        analyze: ['murid merekam/mengamati performa, membandingkan dengan kriteria, lalu memilih satu perbaikan prioritas'],
        create: ['kelompok memilih alat/ruang, merancang rangkaian aman sesuai target, menguji, lalu menyesuaikan intensitas'],
        evaluate: ['murid memakai data performa dan daftar periksa keselamatan untuk menilai diri, menetapkan target, lalu menguji ulang'],
        apply: ['stasiun latihan memodifikasi jarak, alat, aturan, atau tempo; murid berpindah tingkat setelah menunjukkan indikator teknik aman'],
        investigate: ['murid mencoba intensitas/teknik berbeda, mengukur respons tubuh atau hasil, lalu membandingkan data secara aman']
      },
      product: ['unjuk gerak langsung atau video, urutan gerak beranotasi, atau penjelasan isyarat keselamatan', 'catatan performa dan target perbaikan, demonstrasi, atau analisis video singkat', 'rangkaian latihan/permainan termodifikasi, laporan data kebugaran, atau panduan teknik aman']
    },
    arts: {
      content: {
        understand: ['karya contoh kontras, unsur/prinsip yang diberi penanda, pilihan alat/bahan, dan kosakata apresiasi'],
        communicate: ['karya/pertunjukan contoh, bank istilah, sketsa/notasi, dan model tanggapan apresiatif'],
        analyze: ['karya dari konteks/gaya berbeda, detail unsur yang dapat dibandingkan, dan sumber latar penciptaan'],
        create: ['referensi karya beragam, demonstrasi teknik, pilihan media, batas rancangan, dan sumber inspirasi lokal'],
        evaluate: ['karya proses dan karya jadi, rubrik artistik, catatan intensi pencipta, dan contoh umpan balik'],
        apply: ['demonstrasi teknik bertahap, contoh penerapan pada beberapa media, dan tantangan eksplorasi'],
        investigate: ['koleksi karya/suara/gerak, alat eksplorasi, lembar pengamatan unsur, dan referensi pembanding']
      },
      process: {
        understand: ['murid mengamati karya melalui detail pilihan, meniru satu unsur secara terbimbing, lalu menjelaskan pengaruhnya'],
        communicate: ['murid memilih karya yang bermakna, memakai bank istilah atau kerangka kritik sesuai kebutuhan, lalu berdialog apresiatif'],
        analyze: ['kelompok membandingkan unsur, teknik, konteks, dan makna pada karya berbeda lalu menyintesis temuan'],
        create: ['murid memilih tema/media, menggunakan demonstrasi atau kartu teknik sesuai kebutuhan, membuat purwarupa, menerima kritik, lalu merevisi'],
        evaluate: ['murid mengalibrasi rubrik dengan contoh, melakukan kritik studio, lalu memperbaiki karya dan pernyataan artistik'],
        apply: ['stasiun teknik menyediakan tingkat dukungan berbeda; murid memilih jalur, berlatih, lalu menerapkan teknik pada karya pribadi'],
        investigate: ['murid mengeksplorasi bahan/suara/gerak, mencatat efek pilihan, bertukar temuan, lalu menetapkan arah karya']
      },
      product: ['sketsa/notasi/peta unsur, demonstrasi, atau tanggapan apresiatif', 'karya visual/musik/pertunjukan beserta catatan proses, rekaman, atau presentasi kuratorial', 'portofolio proses–revisi, karya akhir, atau pernyataan artistik berbukti']
    },
    technology: {
      content: {
        understand: ['diagram alur, contoh antarmuka/kode beranotasi, kartu istilah, dan contoh kesalahan umum'],
        communicate: ['contoh solusi digital, dokumentasi ringkas, diagram, dan model penjelasan teknis'],
        analyze: ['dua solusi/algoritma atau set data, jejak eksekusi, dan kriteria efisiensi, keamanan, serta akurasi'],
        create: ['spesifikasi kebutuhan, contoh prototipe/kode, aset awal, dokumentasi API/perangkat, dan tantangan pengembangan'],
        evaluate: ['solusi dengan bug/risiko berbeda, kasus uji, kriteria kegunaan, privasi, keamanan, dan efisiensi'],
        apply: ['contoh dikerjakan, potongan kode/diagram sebagian, sandbox latihan, dan kasus transfer'],
        investigate: ['dataset/perangkat/simulasi, panduan eksplorasi, log atau kasus uji, dan sumber dokumentasi']
      },
      process: {
        understand: ['murid menelusuri contoh langkah demi langkah, memprediksi hasil, lalu memperbaiki satu kesalahan dengan petunjuk yang dapat dikurangi'],
        communicate: ['murid membuat diagram/dokumentasi, melakukan demo berpasangan, lalu memperbaiki kejelasan berdasarkan pertanyaan pengguna'],
        analyze: ['kelompok menjalankan kasus uji yang berbeda, membandingkan log/hasil, lalu menjelaskan trade-off solusi'],
        create: ['murid memilih konteks proyek, memulai dari starter berbeda sesuai kesiapan, membangun iteratif, menguji, lalu merevisi'],
        evaluate: ['murid melakukan code/design review dengan daftar periksa, memprioritaskan bug/risiko, lalu memverifikasi perbaikan'],
        apply: ['jalur latihan berupa blok/diagram, kode parsial, atau tantangan mandiri; semua harus lulus kasus uji inti yang sama'],
        investigate: ['murid mengubah satu variabel, mencatat log/hasil, membandingkan pola, lalu menyusun aturan atau rekomendasi']
      },
      product: ['diagram alur beranotasi, demo langkah, atau penjelasan digital', 'program/prototipe, dashboard/visualisasi, dokumentasi, atau video demo', 'solusi digital teruji, laporan kasus uji, atau rekomendasi keamanan dan perbaikan']
    },
    craft: {
      content: {
        understand: ['contoh produk, kartu sifat bahan/alat, urutan proses, dan contoh aman–tidak aman'],
        communicate: ['contoh produk/proposal, gambar kerja, daftar bahan/biaya, dan model presentasi'],
        analyze: ['produk pembanding, data sifat bahan/biaya, kebutuhan pengguna, dan kriteria mutu'],
        create: ['kebutuhan pengguna, contoh desain, pilihan bahan/alat, batas biaya/waktu, dan prosedur keselamatan'],
        evaluate: ['prototipe dengan mutu berbeda, umpan balik pengguna, daftar periksa fungsi, estetika, biaya, dan keselamatan'],
        apply: ['demonstrasi teknik, kartu urutan, jig/template opsional, dan tantangan modifikasi'],
        investigate: ['sampel bahan/produk, alat uji sederhana, tabel sifat/biaya, dan panduan keselamatan']
      },
      process: {
        understand: ['murid memeriksa contoh, mengurutkan proses, lalu mencoba teknik dasar dengan alat bantu sesuai kesiapan'],
        communicate: ['murid menyusun gambar kerja/proposal dengan template berbeda, melakukan pitch singkat, lalu memperjelas berdasarkan pertanyaan'],
        analyze: ['kelompok menguji bahan/produk pada kriteria berbeda, menggabungkan data, lalu memilih dengan alasan'],
        create: ['murid memilih pengguna/konteks, membuat sketsa, memakai demonstrasi atau template sesuai kebutuhan, membuat prototipe, lalu menguji'],
        evaluate: ['murid menguji fungsi dan keamanan, meminta umpan balik pengguna, memprioritaskan revisi, lalu menguji ulang'],
        apply: ['stasiun praktik menyediakan demonstrasi ulang, kartu langkah, atau tantangan bebas; kemajuan ditentukan bukti teknik aman'],
        investigate: ['kelompok menguji sifat bahan/biaya/ketahanan, mencatat hasil, lalu menyepakati bahan berdasarkan kriteria']
      },
      product: ['gambar kerja atau urutan proses, demonstrasi teknik, atau catatan pemilihan bahan', 'prototipe/produk, proposal biaya, video proses, atau presentasi produk', 'produk teruji, portofolio desain–revisi, atau rekomendasi produksi berkelanjutan']
    },
    general: {
      content: {
        understand: ['contoh inti, visual/diagram, istilah kunci, dan contoh-tandingan'],
        communicate: ['contoh penjelasan, bukti pendukung, dan kerangka komunikasi'],
        analyze: ['kasus atau sumber pembanding, data, dan pertanyaan analitis bertingkat'],
        create: ['contoh produk, kriteria keberhasilan, bahan awal, dan sumber pengayaan'],
        evaluate: ['alternatif solusi, bukti, rubrik, dan kasus dengan kualitas berbeda'],
        apply: ['contoh terpandu, tugas kontekstual bertingkat, dan kasus transfer'],
        investigate: ['fenomena/sumber, alat pencatatan, data pembanding, dan panduan pemeriksaan bukti']
      },
      process: {
        understand: ['murid mengelompokkan contoh, membangun konsep dengan penyangga berbeda, lalu menjelaskan kembali'],
        communicate: ['murid menyiapkan penjelasan melalui kerangka yang dapat dipilih, berlatih berpasangan, lalu merevisi'],
        analyze: ['kelompok mengolah sumber berbeda, membandingkan bukti, lalu menyintesis temuan'],
        create: ['murid memilih konteks, membuat rancangan, menerima konferensi singkat, lalu menguji dan merevisi'],
        evaluate: ['murid memakai rubrik untuk menilai alternatif, mengutip bukti, lalu memperbaiki keputusan'],
        apply: ['jalur latihan disesuaikan hasil cek awal dan berakhir pada tugas transfer dengan kriteria sama'],
        investigate: ['murid mengumpulkan dan memeriksa bukti melalui peran kelompok, lalu menyusun simpulan']
      },
      product: ['penjelasan lisan/tulisan, diagram/model, atau demonstrasi', 'laporan, presentasi berbukti, produk, atau rekaman penjelasan', 'proyek/portofolio, rekomendasi, atau produk teruji']
    }
  };

  function makePlan(context) {
    const plan = familyPlans[context.family] || familyPlans.general;
    const phase = phaseProfile(context.phase);
    const seed = hash([context.slug, context.phase, context.meeting, context.topic, context.chapter].join('|'));
    const contentOptions = plan.content[context.demand] || plan.content.understand;
    const processOptions = plan.process[context.demand] || plan.process.understand;
    const productIndex = context.demand === 'understand' ? 0
      : ['create', 'evaluate'].includes(context.demand) ? 2 : 1;
    const content = choose(contentOptions, seed);
    const process = choose(processOptions, seed, 3);
    const product = plan.product[(productIndex + seed) % plan.product.length];
    const readiness = readinessLabel(context.phase);
    const focus = escapeHtml(context.focus);

    const interestChoices = [
      `contoh atau konteks dipilih dari pengalaman, lingkungan, atau minat murid tanpa mengubah target ${context.label}`,
      `murid dapat memilih konteks yang dekat dengan kehidupannya, sedangkan konsep dan kriteria keberhasilan tetap sama`,
      `sumber inti tetap wajib, kemudian konteks pilihan dipakai untuk meningkatkan relevansi dan keterlibatan`
    ];

    return {
      content: `<strong>Strategi Pertemuan ${context.meeting}:</strong> Sediakan ${content} khusus untuk fokus “${focus}”. Gunakan ${phase.access}; ${choose(interestChoices, seed, 5)}.<br><strong>Alasan:</strong> Tujuan pertemuan menuntut kemampuan <em>${context.demandLabel}</em>. Variasi representasi dan tingkat penyangga memberi akses sesuai kesiapan, tetapi konsep esensial dan target belajarnya tetap sama.`,
      process: `<strong>Strategi Pertemuan ${context.meeting}:</strong> Berdasarkan ${readiness}, ${process}. Sediakan ${phase.support}; kelompok bersifat sementara dan berubah mengikuti bukti belajar.<br><strong>Alasan:</strong> Proses ini dipilih karena murid perlu memproses “${focus}” melalui ${context.processReason}, bukan sekadar menerima informasi. Dukungan dapat dikurangi ketika murid sudah mandiri, sedangkan murid siap lanjut memperoleh tantangan transfer.`,
      product: `<strong>Strategi Pertemuan ${context.meeting}:</strong> Bukti belajar dapat berupa ${product}; untuk Fase ${context.phase}, bentuk yang sesuai antara lain ${phase.evidence}. Semua pilihan dinilai dengan kriteria bersama: ketepatan ${context.criterion}, relevansi bukti/contoh, kejelasan alasan, dan kemampuan memperbaiki hasil dari umpan balik.<br><strong>Alasan:</strong> Pilihan bentuk produk mengurangi hambatan penyajian dan memberi ruang minat murid, sementara kriteria bersama memastikan produk benar-benar membuktikan tujuan “${focus}”, bukan hanya menarik secara visual.`
    };
  }

  function demandLanguage(demand) {
    return {
      understand: ['memahami/mengidentifikasi', 'menghubungkan contoh, noncontoh, dan konsep', 'konsep'],
      communicate: ['menyimak, membaca, atau mengomunikasikan', 'latihan, umpan balik, dan penggunaan bukti', 'isi dan komunikasi'],
      analyze: ['menganalisis/membandingkan', 'pemeriksaan pola, hubungan, perspektif, atau bukti', 'analisis'],
      create: ['mencipta/merancang/mempraktikkan', 'pemodelan, praktik bertahap, pengujian, dan revisi', 'proses dan hasil'],
      evaluate: ['menilai/mengevaluasi', 'penerapan kriteria, penimbangan bukti, dan revisi keputusan', 'penilaian'],
      apply: ['menerapkan/menyelesaikan', 'latihan bertahap dan transfer ke konteks baru', 'penerapan'],
      investigate: ['mengamati/menyelidiki', 'pengumpulan, pemeriksaan, dan penafsiran bukti', 'data dan simpulan']
    }[demand] || ['memahami', 'pengolahan bukti dan refleksi', 'konsep'];
  }

  function contextFor(page, route) {
    const heading = [...page.querySelectorAll('h2')].find(node => /DIFERENSIASI\s+PERTEMUAN/i.test(node.textContent || ''));
    const objective = page.querySelector('.objective-box');
    const topic = normalize(objective && objective.querySelector('b') && objective.querySelector('b').textContent);
    const chapterNode = objective && [...objective.querySelectorAll('small')]
      .find(node => /^\s*Bab\s+\d+/i.test(node.textContent || ''));
    const chapter = normalize(chapterNode && chapterNode.textContent);
    const meetingMatch = normalize(heading && heading.textContent).match(/PERTEMUAN\s+(\d+)/i)
      || normalize(page.querySelector('.topline')).match(/PERTEMUAN\s+(\d+)/i);
    const meeting = meetingMatch ? meetingMatch[1] : '1';
    const demand = demandOf(topic + ' ' + chapter);
    const [demandLabel, processReason, criterion] = demandLanguage(demand);
    return {
      ...route,
      meeting,
      topic,
      chapter,
      focus: shortFocus(topic, chapter),
      demand,
      demandLabel,
      processReason,
      criterion
    };
  }

  function differentiationTable(page) {
    const heading = [...page.querySelectorAll('h2')].find(node => /DIFERENSIASI\s+PERTEMUAN/i.test(node.textContent || ''));
    if (!heading) return null;
    let table = heading.nextElementSibling;
    while (table && table.tagName !== 'TABLE') table = table.nextElementSibling;
    return table;
  }

  function enhancePage(page, route) {
    if (page.dataset[DONE] === VERSION) return false;
    const table = differentiationTable(page);
    if (!table || !table.tBodies.length || table.tBodies[0].rows.length < 3) return false;
    const context = contextFor(page, route);
    if (!context.topic) return false;
    const plan = makePlan(context);
    const rows = [...table.tBodies[0].rows];
    const values = [plan.content, plan.process, plan.product];
    rows.slice(0, 3).forEach((row, index) => {
      const cell = row.cells[row.cells.length - 1];
      if (cell) cell.innerHTML = values[index];
    });
    table.classList.add('ep-specific-differentiation');
    page.dataset[DONE] = VERSION;
    return true;
  }

  function installStyles() {
    if (document.getElementById('ep-specific-differentiation-style')) return;
    const style = document.createElement('style');
    style.id = 'ep-specific-differentiation-style';
    style.textContent = `
      .ep-specific-differentiation td:last-child { line-height: 1.34; }
      .ep-specific-differentiation strong { color: #0f4f4b; }
      @media print {
        .ep-specific-differentiation { font-size: 8.6pt; }
        .ep-specific-differentiation td { padding-top: 2.1mm !important; padding-bottom: 2.1mm !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyAll() {
    installStyles();
    const route = routeContext();
    let changed = false;
    document.querySelectorAll('.page').forEach(page => {
      changed = enhancePage(page, route) || changed;
    });
    if (changed) document.dispatchEvent(new CustomEvent('ep-differentiation-ready'));
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scheduled = false;
      applyAll();
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('load', schedule, { once: true });
  window.addEventListener('beforeprint', applyAll);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
