(()=>{'use strict';
  if(!/\/apps\/fase-[a-f]\//i.test(location.pathname))return;

  const MARK='data-ep-supervision-detail';
  const D=window.EPERANGKAT_DATA||{};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
  const list=items=>`<ul class="ep-supervision-list">${(items||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;

  function minutesFrom(text=''){
    const minuteMatch=String(text).match(/(\d+)\s*menit/i);
    if(minuteMatch)return Number(minuteMatch[1]);
    const jpMatch=String(text).match(/(\d+)\s*JP/i);
    return jpMatch?Number(jpMatch[1])*35:70;
  }

  function timeParts(text=''){
    const total=Math.max(1,minutesFrom(text));
    const opening=total<=35?5:10;
    const closing=total<=35?5:10;
    return{total,opening,core:Math.max(1,total-opening-closing),closing};
  }

  const titleCase=value=>String(value||'').toLowerCase().replace(/(^|\s)([a-zà-ÿ])/g,(_,space,char)=>space+char.toUpperCase()).replace(/\b(Dan|Yang|Di|Ke|Dari|Untuk|Pada|Dalam|Atau)\b/g,word=>word.toLowerCase());
  const cleanSentence=value=>String(value||'').trim().replace(/\s+/g,' ').replace(/\.,/g,',').replace(/\.+$/,'');

  function meetingFocus(meeting){
    const parts=String(meeting?.topic||'').split(':');
    return titleCase(parts.length>1?parts.slice(1).join(':').trim():meeting?.topic||'materi pertemuan');
  }

  function meetingStage(meeting){
    return String(meeting?.topic||'').split(':')[0].trim().toUpperCase();
  }

  function stimulusMaterial(module,meeting){
    const focus=meetingFocus(meeting).toLowerCase(),chapter=String(module.title||'').toLowerCase();
    if(chapter.includes('aku yang unik')){
      if(focus.includes('ciri-ciri'))return'dua kartu tokoh: Aruna berambut keriting dan gemar menolong, sedangkan Bima berkacamata dan teliti merawat tanaman';
      if(focus.includes('keunikan diri'))return'teks profil “Aku, Tara” tentang tahi lalat di pipi, kegemaran merakit layang-layang, dan sifat pantang menyerah';
      if(focus.includes('menceritakan'))return'dua paragraf profil Raka: paragraf pertama hanya berupa daftar ciri, sedangkan paragraf kedua mengubah ciri yang sama menjadi cerita runtut';
      if(focus.includes('orang lain'))return'kartu cerita Nara yang pandai menggambar tetapi pemalu dan Seno yang gemar bercerita serta mudah berteman';
      return'kartu profil tokoh yang memuat ciri fisik, kebiasaan, kegemaran, dan sifat positif';
    }
    if(chapter.includes('buku jendela dunia')){
      if(focus.includes('kartini'))return'kutipan surat Kartini tentang kegemarannya membaca serta gambar rak buku dan meja tulis pada zamannya';
      if(focus.includes('dampak'))return'infografik “Membaca 20 Menit Sehari” yang memuat perubahan jumlah kosakata, pengetahuan, dan kebiasaan berdiskusi';
      if(focus.includes('dibuat'))return'enam kartu urutan perjalanan buku: gagasan penulis, penyuntingan, ilustrasi, tata letak, pencetakan, dan distribusi';
      if(focus.includes('strategi'))return'teks 120 kata “Perpustakaan Keliling” beserta penanda judul, kata kunci, gagasan utama, dan simpulan';
      if(focus.includes('favorit'))return'tiga sampul dan sinopsis singkat buku petualangan, pengetahuan, dan puisi anak';
      return'ilustrasi pintu perpustakaan yang terbuka menuju kota bawah laut, lengkap dengan tiga benda ganjil yang dapat dijadikan awal cerita';
    }
    if(chapter.includes('ekspresi diri')){
      if(focus.includes('mengenal hobi'))return'empat kartu kegiatan: berkebun, bulu tangkis, memasak, dan fotografi, masing-masing disertai alat serta alasan pelakunya';
      if(focus.includes('informasi utama'))return'teks “Nisa dan Kebun Mini” yang memuat hobi, jadwal kegiatan, alat, dan manfaat yang dirasakan Nisa';
      if(focus.includes('manfaat'))return'tabel manfaat hobi bagi kesehatan, kreativitas, pertemanan, dan kedisiplinan dengan satu contoh pada setiap kolom';
      if(focus.includes('visual'))return'poster jadwal klub sekolah yang memadukan ikon, warna, waktu, tempat, dan syarat pendaftaran';
      return'peta gagasan “Hobiku, Ceritaku” dengan cabang awal mula, alat, proses, tantangan, manfaat, dan pengalaman paling berkesan';
    }
    if(chapter.includes('berwirausaha')){
      if(focus.includes('gagasan'))return'foto tiga usaha sederhana peserta didik—keripik pisang, pembatas buku, dan pot dari botol bekas—beserta harga jualnya';
      if(focus.includes('lala'))return'cerita bergambar “Ide Kreatif Lala” tentang sisa kain yang diubah menjadi gantungan kunci dan ditawarkan saat bazar kelas';
      if(focus.includes('tantangan'))return'catatan usaha berisi modal Rp50.000, sepuluh pesanan, dua barang rusak, dan tiga pelanggan yang meminta perubahan';
      if(focus.includes('bima'))return'poster jualan Bima yang memuat harga tidak konsisten, kalimat ajakan kurang jelas, dan informasi pemesanan yang hilang';
      if(focus.includes('pasar kecil'))return'tabel hasil survei 20 calon pembeli tentang produk, harga, rasa atau desain, dan alasan memilih';
      return'kanvas rencana usaha satu halaman berisi masalah pelanggan, gagasan produk, bahan, biaya, harga, dan cara promosi';
    }
    if(chapter.includes('cinta indonesia')){
      if(focus.includes('tempat bersejarah'))return'dua kartu pos bergambar Museum Fatahillah dan Benteng Rotterdam yang mencantumkan lokasi, tahun, fungsi dahulu, dan fungsi sekarang';
      if(focus.includes('informasi relevan'))return'brosur museum berisi jam buka, harga tiket, sejarah bangunan, fasilitas, iklan suvenir, dan nomor layanan';
      if(focus.includes('sebab-akibat'))return'empat kartu peristiwa tentang perawatan cagar budaya, kerusakan, tindakan warga, dan perubahan jumlah pengunjung';
      if(focus.includes('museum dan'))return'foto koleksi kain tradisional, alat musik, dan keramik yang dilengkapi label asal serta kegunaannya';
      if(focus.includes('angka'))return'poster tiket museum yang sengaja salah menulis Rp, bilangan, nama hari, nama bulan, dan huruf kapital';
      if(focus.includes('etika'))return'empat ilustrasi perilaku di museum: mengantre, menyentuh koleksi, memotret dengan lampu kilat, dan membuang sampah';
      return'catatan harian “Kunjungan Pertamaku ke Museum” yang memuat waktu, tempat, urutan peristiwa, perasaan, dan pelajaran';
    }
    if(chapter.includes('sayangi bumi')){
      if(focus.includes('mbah sadiman'))return'dua berita tentang Mbah Sadiman serta foto perbukitan sebelum dan sesudah penghijauan; judul kedua berita memberi penekanan berbeda';
      if(focus.includes('kebenaran'))return'tangkapan pesan berantai “Semua Sampah Plastik Bisa Terurai dalam Setahun” dan kartu fakta dari sumber lingkungan resmi';
      if(focus.includes('cerita bisu'))return'enam panel tanpa teks tentang anak yang melihat selokan tersumbat, mengajak teman, memilah sampah, dan mendapati air kembali lancar';
      if(focus.includes('sampah'))return'foto halaman sekolah setelah istirahat beserta data jumlah bungkus, botol, sisa makanan, dan tempat sampah yang tersedia';
      if(focus.includes('observasi lingkungan'))return'lembar cek kondisi kelas yang memuat cahaya, udara, air, tanaman, kebersihan lantai, dan kebiasaan membuang sampah';
      if(focus.includes('presentasi'))return'dua grafik hasil observasi kebersihan kelas yang sama, satu memakai judul dan label jelas sedangkan satu tidak';
      return'empat kartu praktik baik: membawa botol isi ulang, membuat kompos, menanam pohon, dan menggunakan kembali kertas satu sisi';
    }
    if(chapter.includes('anak-anak yang mengubah dunia')){
      if(focus.includes('mengenal teks'))return'diagram proses hujan dari penguapan hingga presipitasi dan teks eksplanasi singkat “Mengapa Hujan Turun?”';
      if(focus.includes('informasi penting'))return'teks eksplanasi “Terbentuknya Pelangi” yang memuat pernyataan umum, urutan proses, dan simpulan';
      if(focus.includes('inferensial'))return'gambar halaman sekolah yang basah, langit mulai cerah, payung terlipat, dan anak-anak kembali bermain';
      if(focus.includes('kombinasi huruf'))return'kartu kata praktik, struktur, transportasi, nyaring, syarat, dan khawatir untuk dikelompokkan menurut pola bunyinya';
      if(focus.includes('penghubung'))return'potongan kalimat proses perkecambahan yang kehilangan kata karena, sehingga, kemudian, dan akhirnya';
      return'contoh teks “Cara Biji Tumbuh” sepanjang tiga paragraf dengan kartu struktur pernyataan umum, deretan penjelas, dan simpulan';
    }
    if(chapter.includes('nusantara berjuta cerita')){
      if(focus.includes('sastra bergambar'))return'tiga panel cerita bergambar tentang anak menemukan selendang tua di rumah nenek, tanpa panel akhir';
      if(focus.includes('cerita rakyat'))return'cuplikan cerita “Timun Mas” yang memperkenalkan tokoh, latar, masalah, dan usaha tokoh menyelesaikannya';
      if(focus.includes('nilai-nilai'))return'kartu tindakan tokoh: menepati janji, menolong orang asing, berbohong, dan berani mengakui kesalahan';
      if(focus.includes('denotatif'))return'pasangan kalimat “tangan kanan Rani terluka” dan “Rani menjadi tangan kanan ketua”, serta “buah mangga” dan “buah hati”';
      if(focus.includes('pola kombinasi'))return'kartu kata dari cerita rakyat—syarat, khayal, nyiur, prajurit, dan struktur—beserta tanda pemenggalan suku kata';
      if(focus.includes('menulis cerita'))return'peta cerita kosong dengan kotak tokoh, latar, tujuan, rintangan, penyelesaian, dan amanat';
      return'rekaman dua versi penceritaan adegan Timun Mas, satu dibaca datar dan satu menggunakan intonasi serta gerak yang sesuai';
    }
    if(chapter.includes('temukan minat')){
      if(focus.includes('mengenal teks'))return'transkrip wawancara wartawan cilik dengan Dita, pemain biola yang juga menyukai sains, lengkap dengan salam, pertanyaan, jawaban, dan penutup';
      if(focus.includes('tersirat'))return'jawaban narasumber “Saya berlatih sebelum matahari terbit karena sore hari membantu Ibu” tanpa menyebut langsung sifat tokoh';
      if(focus.includes('minat dan bakat'))return'dua profil: Rafi senang menggambar setiap hari dan Siska cepat memahami nada setelah berlatih teratur';
      if(focus.includes('pertanyaan'))return'enam kartu pertanyaan, termasuk “Kamu suka musik?” dan “Bagaimana awalnya kamu tertarik bermain musik?”';
      if(focus.includes('wartawan'))return'kartu tugas wartawan cilik berisi tujuan wawancara, profil narasumber, batas waktu lima menit, dan etika meminta izin';
      if(focus.includes('melakukan wawancara'))return'rekaman simulasi wawancara yang memuat satu pertanyaan ganda, satu interupsi, dan satu pertanyaan lanjutan yang tepat';
      return'contoh laporan hasil wawancara tentang klub robotik yang memuat judul, identitas narasumber, isi pokok, kutipan, dan simpulan';
    }
    if(chapter.includes('dari hobi menjadi profesi')){
      if(focus.includes('mengenal laporan'))return'laporan singkat hasil observasi tanaman cabai yang memuat objek, waktu, ciri daun, tinggi, kondisi tanah, dan simpulan';
      if(focus.includes('dari gambar'))return'tiga foto perubahan adonan roti sebelum mengembang, setelah 30 menit, dan setelah dipanggang';
      if(focus.includes('inferensial'))return'gambar meja kerja pembuat kue dengan pesanan, timbangan, bahan hampir habis, dan jam yang menunjukkan pukul 06.30';
      if(focus.includes('peneliti'))return'kotak observasi berisi daun, batu, pensil, dan botol minum dengan aturan hanya mencatat hal yang dapat dilihat, diukur, atau dihitung';
      if(focus.includes('mengorganisasi'))return'12 catatan acak hasil pengamatan kantin sekolah yang perlu dipilah menjadi objek, ciri, jumlah, perilaku, dan simpulan';
      if(focus.includes('menyusun laporan'))return'kerangka laporan “Kantin Sehat Sekolahku” dengan bagian judul, tujuan, waktu-tempat, hasil pengamatan, dan simpulan';
      return'dua poster presentasi hasil observasi kantin: satu penuh paragraf, satu memakai tabel, foto berlabel, dan tiga temuan utama';
    }
    return`contoh konkret yang memuat tokoh, data, dan masalah pada topik “${meetingFocus(meeting)}”`;
  }

  function specificObjective(meeting){
    const focus=meetingFocus(meeting).toLowerCase(),stage=meetingStage(meeting);
    return({
      'MEMBANGUN KONTEKS':`Menghubungkan pengalaman awal dengan topik ${focus}, mencatat sedikitnya tiga rincian dari stimulus, dan merumuskan satu pertanyaan yang relevan.`,
      'MENYIMAK ATAU MEMBACA MODEL':`Menemukan gagasan utama dan sedikitnya dua informasi pendukung dari teks model tentang ${focus} melalui kegiatan menyimak atau membaca.`,
      'MENEMUKAN INFORMASI':`Mengidentifikasi sedikitnya dua informasi relevan tentang ${focus} dan menunjukkan kalimat, gambar, atau data yang menjadi buktinya.`,
      'MENGANALISIS STRUKTUR DAN BAHASA':`Menjelaskan susunan serta sedikitnya dua ciri kebahasaan dalam teks tentang ${focus}.`,
      'LATIHAN TERBIMBING':`Menerapkan langkah yang dicontohkan guru untuk menyelesaikan latihan ${focus} dengan isi runtut dan bukti yang tepat.`,
      'MENGUMPULKAN DATA':`Mengumpulkan sedikitnya tiga data tentang ${focus}, mencatat sumbernya, dan membedakan fakta dari pendapat atau dugaan.`,
      'MERENCANAKAN PRODUK':`Menyusun kerangka produk tentang ${focus} yang memuat tujuan, sasaran, urutan isi, dan sedikitnya tiga bukti pendukung.`,
      'MENULIS ATAU MENCIPTA':`Menghasilkan draf karya tentang ${focus} dengan pembuka yang menarik, isi runtut, dan sedikitnya tiga informasi atau bukti relevan.`,
      'MENYUNTING':`Menyunting karya tentang ${focus} berdasarkan isi, urutan gagasan, pilihan kata, ejaan, dan tanda baca hingga menghasilkan naskah bersih.`,
      'MEMPRESENTASIKAN':`Mempresentasikan hasil tentang ${focus} selama dua menit dengan isi runtut, bukti jelas, lafal, intonasi, dan kontak mata yang tepat.`,
      'MEREFLEKSIKAN':`Membandingkan hasil awal dan akhir pada topik ${focus}, menunjukkan bukti kemajuan, serta menetapkan satu tindak lanjut yang dapat dilakukan.`
    }[stage]||`Menunjukkan pemahaman tentang ${focus} melalui jawaban atau karya yang tepat, runtut, dan didukung bukti.`);
  }

  function subjectFamily(){
    const subject=String(D.meta?.subject||D.meta?.title||'').toLowerCase();
    if(/bahasa/.test(subject))return'language';
    if(/matematika/.test(subject))return'math';
    if(/agama|paibp|budi pekerti/.test(subject))return'religion';
    if(/pjok|jasmani|olahraga|kesehatan/.test(subject))return'physical';
    if(/seni/.test(subject))return'art';
    if(/informatika|koding|kecerdasan artifisial/.test(subject))return'technology';
    if(/prakarya/.test(subject))return'craft';
    if(/ipas|ilmu pengetahuan alam|\bipa\b|fisika|kimia|biologi/.test(subject))return'science';
    if(/pancasila|\bips\b|ilmu pengetahuan sosial|sejarah|geografi|sosiologi|ekonomi/.test(subject))return'social';
    return'general';
  }

  function universalStage(meeting,index){
    const hint=String(meeting?.topic||'').split(':')[0].toUpperCase();
    const cycle=['orientation','exploration','analysis','practice','application','communication','reflection'];
    if(hint.length>170||/^(PADA AKHIR|PESERTA DIDIK|MURID|SISWA)/.test(hint))return cycle[index%cycle.length];
    if(/ASESMEN AWAL/.test(hint))return'orientation';
    if(/REFLEKSI|UJI KOMPETENSI|ASESMEN SUMATIF|EVALUASI/.test(hint))return'reflection';
    if(/PRESENTASI|MEMPRESENTASIKAN|KOMUNIKASI|SHARE/.test(hint))return'communication';
    if(/MENULIS|MENCIPTA|PRODUK|PROYEK|MERENCANAKAN|CREATE/.test(hint))return'production';
    if(/PENERAPAN|PEMECAHAN|APLIKASI|KONSTRUKSI BERSAMA/.test(hint))return'application';
    if(/LATIHAN|PRAKTIK|BERLATIH|ASK, ANSWER|PENDALAMAN/.test(hint))return'practice';
    if(/ANALISIS|MENGANALISIS|PENGEMBANGAN KONSEP|MENEMUKAN|INFORMASI/.test(hint))return'analysis';
    if(/PENYELIDIKAN|EKSPLORASI|MEMODELKAN|MENYIMAK|MEMBACA MODEL/.test(hint))return'exploration';
    if(/MEMBANGUN|ASESMEN AWAL|MENGENAL|LISTEN, LOOK/.test(hint))return'orientation';
    return cycle[index%cycle.length];
  }

  function universalFocus(module,meeting,chapterObjective){
    const topic=cleanSentence(meeting?.topic||'');
    const afterColon=topic.includes(':')?topic.split(':').slice(1).join(':').trim():'';
    if(afterColon&&afterColon.length<=170)return titleCase(afterColon);
    if(/^(PENDALAMAN DAN PRAKTIK|PERTEMUAN\s+\d+)/i.test(topic))return cleanSentence(chapterObjective||module.title);
    if(topic.length&&topic.length<=150&&!/^(PADA AKHIR|PESERTA DIDIK|MURID|SISWA)/i.test(topic))return titleCase(topic);
    return cleanSentence(module.title||chapterObjective||'materi pembelajaran');
  }

  function universalMaterial(family,focus,objective,meeting){
    const f=focus.toLowerCase(),variant=(Number(meeting.number||1)-1)%4;
    if(family==='math'){
      if(/pecahan|desimal|persen|rasio|perbandingan/.test(f))return`dua pita kertas berpetak, gambar satu loyang yang dibagi berbeda, dan tiga kartu nilai untuk membuktikan konsep ${f}`;
      if(/bangun|sudut|garis|geometri|transformasi|lingkaran|segitiga|segiempat/.test(f))return`model bangun dari sedotan, kertas berpetak, penggaris, dan tiga gambar benda sekitar yang memuat konsep ${f}`;
      if(/ukur|panjang|berat|waktu|volume|luas|keliling/.test(f))return`tiga benda nyata, alat ukur yang sesuai, dan tabel hasil ukur yang satu nilainya sengaja tidak tepat pada topik ${f}`;
      if(/data|statistik|peluang|diagram|grafik/.test(f))return`data hasil survei 20 peserta didik, kartu kategori, dan dua bentuk penyajian data untuk topik ${f}`;
      if(/fungsi|persamaan|aljabar|matriks|limit|turunan|integral|vektor|bilangan kompleks|polinomial|logaritma|trigonometri/.test(f))return`tabel pasangan nilai, satu representasi simbolik, satu grafik, dan satu solusi yang memuat kekeliruan pada materi ${f}`;
      return`${8+variant*2} benda hitung, kartu bilangan, garis bilangan, dan satu cerita kontekstual singkat untuk materi ${f}`;
    }
    if(family==='language')return[
      `teks pendek dua paragraf tentang “${focus}” dengan judul, tiga kata kunci, dan satu kalimat yang sengaja belum lengkap`,
      `empat gambar berurutan tentang “${focus}”, enam kartu kosakata, dan dua pilihan kalimat pembuka`,
      `dialog enam giliran tentang “${focus}” dengan satu respons yang kurang tepat dan satu ungkapan santun`,
      `dua kutipan tentang “${focus}” yang menyampaikan informasi sama dengan susunan dan pilihan kata berbeda`
    ][variant];
    if(family==='science'){
      if(/sel|jaringan|organ|tubuh|makhluk hidup|tumbuhan|hewan/.test(f))return`foto objek biologis, diagram bagian-bagiannya, dan tabel tiga hasil pengamatan yang berkaitan dengan ${f}`;
      if(/gaya|gerak|energi|listrik|gelombang|cahaya|bunyi|dimensi|besaran|pengukuran/.test(f))return`sketsa alat percobaan, tiga data hasil pengukuran, dan dua prediksi berbeda mengenai ${f}`;
      if(/zat|unsur|senyawa|reaksi|asam|basa|kimia/.test(f))return`model partikel, label tiga bahan, tabel sifat, dan satu persamaan atau urutan perubahan pada materi ${f}`;
      if(/bumi|lingkungan|ekosistem|cuaca|iklim|laut|daratan/.test(f))return`dua foto kondisi lingkungan, peta sederhana, dan tabel perubahan data yang berkaitan dengan ${f}`;
      return`foto fenomena ${f}, diagram proses, tiga data pengamatan, dan satu dugaan yang perlu diuji`;
    }
    if(family==='social')return/\/fase-[ab]\//i.test(location.pathname)?`empat kartu gambar tentang “${focus}”, cerita pendek enam kalimat, dan dua kartu perilaku untuk dipilih beserta alasannya`:`paket sumber tentang “${focus}” yang berisi cuplikan berita 120 kata, peta atau garis waktu, tabel tiga data, dan dua sudut pandang`;
    if(family==='religion'){
      if(/hijaiyah|surah|q\.s\.|alquran|al-qur/.test(f))return`kartu huruf atau potongan ayat tentang “${focus}”, audio dua contoh bacaan, penanda harakat atau tajwid, dan kartu arti pokok`;
      if(/salat|wudu|tayamum|ibadah|haji|zakat|puasa/.test(f))return`enam kartu urutan praktik “${focus}”, gambar posisi atau perlengkapan, dan satu contoh urutan yang sengaja tertukar`;
      return`kartu materi tentang “${focus}” berisi dalil atau kutipan, arti pokok, dua contoh perilaku, dan satu kasus keseharian yang perlu dipilih sikapnya`;
    }
    if(family==='physical')return`denah area latihan ${focus}, empat kerucut penanda, alat gerak yang sesuai, serta dua demonstrasi gerak—satu aman dan satu perlu diperbaiki`;
    if(family==='art')return`dua contoh karya bertema “${focus}”, kartu unsur atau prinsip seni, serta sampel alat dan bahan dengan teknik yang berbeda`;
    if(family==='technology')return`kartu input–proses–output, potongan algoritma, contoh data, dan satu hasil program yang sengaja tidak sesuai pada topik ${focus}`;
    if(family==='craft')return`dua contoh produk ${focus}, daftar bahan dan alat, sketsa ukuran, tabel biaya sederhana, serta satu kemasan yang perlu dievaluasi`;
    return`dua contoh nyata, satu tabel data, tiga kartu konsep, dan satu masalah singkat tentang ${focus}`;
  }

  function universalObjective(module,meeting,stage,focus,chapterObjective){
    const lead={
      orientation:`mengidentifikasi pengetahuan awal, mencatat sedikitnya tiga rincian stimulus, dan merumuskan satu pertanyaan tentang ${focus.toLowerCase()}`,
      exploration:`mencoba atau menelaah contoh tentang ${focus.toLowerCase()} dan mencatat sedikitnya tiga temuan dengan cara yang tepat`,
      analysis:`menganalisis bukti pada materi ${focus.toLowerCase()}, membandingkan dua temuan, dan menyusun satu kesimpulan`,
      practice:`menerapkan langkah yang dimodelkan untuk menyelesaikan tugas ${focus.toLowerCase()} serta memeriksa hasil dengan kriteria yang disepakati`,
      application:`menggunakan konsep ${focus.toLowerCase()} untuk menyelesaikan satu masalah kontekstual atau menghasilkan satu produk yang dapat diuji`,
      production:`merencanakan dan menghasilkan karya tentang ${focus.toLowerCase()} yang memuat tujuan, proses, bukti, dan hasil`,
      communication:`menyajikan hasil tentang ${focus.toLowerCase()} secara runtut, menjawab satu pertanyaan, dan memperbaiki hasil berdasarkan umpan balik`,
      reflection:`menunjukkan bukti ketercapaian pada materi ${focus.toLowerCase()}, memperbaiki satu kekeliruan, dan menetapkan tindak lanjut`
    }[stage];
    return`Pada pertemuan ${meeting.number}, peserta didik mampu ${lead||`menunjukkan pemahaman tentang ${focus.toLowerCase()} melalui bukti belajar yang dapat diperiksa`}.`;
  }

  function universalOpening(module,meeting,stage,focus,objective,material){
    const prompt={
      orientation:`“Rincian apa yang kalian temukan, dan apa yang ingin kalian ketahui tentang ${focus.toLowerCase()}?”`,
      exploration:`“Apa yang berubah ketika cara, urutan, atau kondisi pada contoh ini diubah?”`,
      analysis:`“Bukti mana yang paling kuat, dan bagaimana bukti itu mendukung kesimpulan kalian?”`,
      practice:`“Langkah mana yang harus dilakukan lebih dahulu agar hasilnya tepat dan dapat diperiksa?”`,
      application:`“Bagaimana konsep ${focus.toLowerCase()} dapat digunakan untuk menyelesaikan masalah ini?”`,
      production:`“Produk seperti apa yang paling tepat untuk menunjukkan pemahaman tentang ${focus.toLowerCase()}?”`,
      communication:`“Bagaimana menyampaikan hasil agar urutan, bukti, dan alasannya mudah dipahami?”`,
      reflection:`“Bagian mana yang sudah berkembang, dan bukti apa yang menunjukkan perkembangan itu?”`
    }[stage];
    return[
      `Guru membuka pembelajaran dengan salam, doa, presensi, dan pemeriksaan kesiapan, kemudian menghubungkan kegiatan dengan Bab “${module.title}”.`,
      `Guru menyiapkan ${material}; peserta didik mengamati, membaca, menyimak, atau mencoba sesuai karakter materi lalu mencatat temuan awal.`,
      `Guru mengajukan pertanyaan pemantik ${prompt}`,
      `Guru menyampaikan tujuan pertemuan: ${cleanSentence(objective)}; kriteria keberhasilan ditunjukkan melalui ketepatan proses, bukti yang dapat diperiksa, dan komunikasi yang santun.`
    ];
  }

  function domainMoves(family,focus){
    return({
      language:['menyimak atau membaca sumber dan menandai kata kunci','membandingkan informasi, struktur, dan pilihan bahasa','menggunakan kosakata atau ungkapan sasaran','menulis, berbicara, atau mempresentasikan dengan tujuan jelas'],
      math:['memanipulasi model konkret, gambar, tabel, atau simbol','menuliskan strategi dan setiap langkah perhitungan','membandingkan dua cara serta memeriksa kewajaran hasil','menjelaskan alasan matematis dengan representasi yang sesuai'],
      science:['mengamati fenomena dan menentukan variabel atau ciri','mencatat hasil ukur pada tabel dengan satuan yang tepat','membandingkan data dengan prediksi atau model','menarik kesimpulan berdasarkan bukti percobaan atau observasi'],
      social:['membaca sumber dan mencatat asal, waktu, serta sudut pandangnya','membandingkan peta, garis waktu, data, atau kesaksian','menjelaskan sebab, akibat, kepentingan, dan dampak','menyusun argumen atau rekomendasi yang didukung sumber'],
      religion:['menyimak atau membaca contoh dengan pelafalan dan makna yang tepat','memasangkan ajaran, arti pokok, dan contoh perilaku','mempraktikkan bacaan, ibadah, atau sikap secara bertahap dan santun','menjelaskan pilihan tindakan berdasarkan nilai yang dipelajari'],
      physical:['mengamati demonstrasi dan menyebutkan posisi tubuh serta aturan aman','mempraktikkan gerak dari tempo dan jarak paling mudah','mengukur keberhasilan melalui kontrol, ketepatan, kebugaran, dan kerja sama','mengulangi gerak setelah menerima umpan balik spesifik'],
      art:['mengamati unsur, prinsip, teknik, fungsi, dan makna pada karya','mencoba alat, bahan, gerak, bunyi, atau media secara aman','mendokumentasikan pilihan, proses, perubahan, dan hasil eksplorasi','mencipta serta memberi tanggapan menggunakan kosakata seni yang tepat'],
      technology:['menelusuri contoh input, proses, output, dan aturan','menyusun algoritma atau model menjadi urutan yang logis','menguji dengan sedikitnya dua data dan mencatat hasil','menemukan kesalahan, memperbaiki, serta menjelaskan perubahan'],
      craft:['mengamati fungsi, bahan, teknik, ergonomi, dan nilai produk','membuat sketsa, urutan kerja, kebutuhan alat, serta perkiraan biaya','memproduksi atau mengolah dengan prosedur aman dan higienis','menguji mutu, fungsi, kemasan, dampak, serta peluang perbaikan'],
      general:['mengamati sumber dan mencatat informasi penting','mengelompokkan bukti berdasarkan kriteria','menerapkan konsep pada tugas kontekstual','menjelaskan proses, hasil, dan alasan']
    }[family]||[]).map(x=>`${x} pada materi ${focus.toLowerCase()}`);
  }

  function universalCore(module,meeting,stage,focus,objective,material,family){
    const moves=domainMoves(family,focus);
    const plans={
      orientation:[
        `Peserta didik mengamati ${material} dan menulis atau menyampaikan tiga rincian tanpa terlebih dahulu diberi jawaban.`,
        `Secara berpasangan, peserta didik menghubungkan temuan dengan pengalaman yang pernah dialami pada materi ${focus.toLowerCase()}.`,
        `Guru menghimpun jawaban pada dua kolom: sudah diketahui dan masih ingin diketahui.`,
        `Peserta didik ${moves[0]}.`,
        `Kelompok menyusun satu pertanyaan faktual dan satu pertanyaan yang memerlukan alasan atau pembuktian.`,
        `Guru memeriksa kesiapan melalui tugas singkat yang langsung berkaitan dengan tujuan pertemuan.`
      ],
      exploration:[
        `Guru memodelkan cara menggunakan ${material} sambil menjelaskan satu langkah berpikir pada satu waktu.`,
        `Peserta didik ${moves[0]}, kemudian mencatat hasil awal sebelum berdiskusi.`,
        `Peserta didik mencoba contoh kedua dengan satu unsur, kondisi, atau data yang diubah.`,
        `Pasangan ${moves[1]} dan menandai persamaan serta perbedaannya.`,
        `Guru mengajukan pertanyaan penuntun tanpa langsung memberi jawaban akhir.`,
        `Peserta didik memperbaiki catatan dan merumuskan temuan sementara tentang ${focus.toLowerCase()}.`
      ],
      analysis:[
        `Peserta didik memisahkan bagian, data, langkah, unsur, atau gagasan penting dari ${material}.`,
        `Kelompok membuat kategori dan menetapkan alasan setiap bukti ditempatkan pada kategori tersebut.`,
        `Peserta didik ${moves[1]}.`,
        `Guru memberikan satu contoh tandingan untuk menguji apakah alasan peserta didik tetap berlaku.`,
        `Peserta didik ${moves[2]}.`,
        `Kelompok menyusun kesimpulan dua sampai tiga kalimat dan menunjukkan bukti yang mendukungnya.`
      ],
      practice:[
        `Guru menyelesaikan satu contoh ${focus.toLowerCase()} sambil memperagakan cara memahami tugas, memilih strategi, dan memeriksa hasil.`,
        `Kelas menyelesaikan contoh kedua bersama-sama menggunakan ${material}.`,
        `Pasangan mengerjakan tugas ketiga dengan kartu petunjuk atau alat bantu sesuai kebutuhan.`,
        `Peserta didik ${moves[2]}.`,
        `Peserta didik bertukar hasil dan memberi satu catatan kekuatan serta satu saran berbasis kriteria.`,
        `Secara mandiri, peserta didik menyelesaikan satu tugas sejenis sebagai bukti penguasaan.`
      ],
      application:[
        `Guru menyajikan masalah nyata pada Bab “${module.title}” dan membatasi informasi yang benar-benar diperlukan.`,
        `Kelompok menentukan apa yang diketahui, apa yang ditanyakan, serta bukti atau alat yang diperlukan.`,
        `Peserta didik memilih strategi dan ${moves[2]}.`,
        `Peserta didik mencatat keputusan, proses, dan hasil agar dapat diperiksa kelompok lain.`,
        `Kelompok menguji hasil pada kondisi atau contoh berbeda dan mencatat perubahan yang terjadi.`,
        `Peserta didik memperbaiki solusi serta menjelaskan mengapa perbaikan tersebut lebih tepat.`
      ],
      production:[
        `Peserta didik menelaah ${material} dan menentukan tujuan, pengguna atau penonton, serta kriteria produk.`,
        `Peserta didik membuat rancangan yang memuat urutan kerja, bukti, alat atau sumber, dan pembagian waktu.`,
        `Guru melakukan konferensi singkat untuk memeriksa keterhubungan rancangan dengan tujuan pertemuan.`,
        `Peserta didik ${moves[3]}.`,
        `Pasangan menguji atau menelaah produk menggunakan daftar periksa yang telah disepakati.`,
        `Peserta didik merevisi satu bagian produk dan mendokumentasikan perubahan sebelum–sesudah.`
      ],
      communication:[
        `Peserta didik memilih tiga bukti utama dari hasil kerja tentang ${focus.toLowerCase()} dan menyusunnya dalam urutan yang logis.`,
        `Guru mengingatkan kriteria penyajian: isi tepat, proses jelas, bukti terbaca, bahasa santun, dan durasi terjaga.`,
        `Peserta didik berlatih dalam kelompok kecil dengan peran penyaji, pencatat waktu, dan pemberi umpan balik.`,
        `Peserta didik ${moves[3]}.`,
        `Pendengar mengajukan satu pertanyaan klarifikasi dan penyaji menjawab dengan merujuk pada bukti.`,
        `Peserta didik memperbaiki satu bagian penyajian atau produk berdasarkan masukan yang paling relevan.`
      ],
      reflection:[
        `Peserta didik membaca kembali tujuan pertemuan dan memilih bukti kerja yang paling menunjukkan ketercapaiannya.`,
        `Peserta didik membandingkan hasil awal dan akhir pada materi ${focus.toLowerCase()}.`,
        `Guru membahas satu kekeliruan yang paling sering muncul dan memodelkan cara memperbaikinya.`,
        `Peserta didik memperbaiki jawabannya, lalu menjelaskan bagian yang berubah dan alasannya.`,
        `Peserta didik yang memerlukan dukungan mengerjakan tugas bertahap; peserta didik yang siap mengerjakan tantangan konteks baru.`,
        `Kelas menyusun simpulan serta satu contoh penerapan ${focus.toLowerCase()} di luar pembelajaran.`
      ]
    };
    const items=[...(plans[stage]||plans.orientation)];
    while(items.length<(meeting.inti?.length||6)){
      const n=items.length+1,move=moves[(n-1)%moves.length];
      items.push(`Tahap lanjutan ${n}: peserta didik ${move}, kemudian guru memeriksa bukti proses dan memberikan umpan balik khusus pada bagian yang belum tepat.`);
    }
    if(items[0])items[0]=`Pada pertemuan ${meeting.number}, ${items[0].charAt(0).toLowerCase()}${items[0].slice(1)}`;
    return items.slice(0,Math.max(1,meeting.inti?.length||6)).map(cleanSentence);
  }

  function universalClosing(module,meeting,stage,focus){
    const action={
      orientation:'membawa satu contoh dari rumah yang berkaitan dengan pertanyaan kelas',
      exploration:'melengkapi satu catatan pengamatan yang masih belum memiliki bukti',
      analysis:'memperbaiki kesimpulan dengan menambahkan bukti yang paling kuat',
      practice:'mengulang satu tugas sejenis tanpa melihat contoh guru',
      application:'menguji solusi pada satu kondisi baru dan mencatat hasilnya',
      production:'menyiapkan bahan atau sumber untuk revisi produk berikutnya',
      communication:'memperbaiki penyajian berdasarkan satu saran yang paling relevan',
      reflection:'menerapkan satu tindakan perbaikan dan mencatat perkembangannya'
    }[stage];
    return[
      `Peserta didik menyampaikan satu pemahaman baru tentang ${focus.toLowerCase()} dan menunjukkan bukti yang mendukungnya.`,
      `Guru memberi umpan balik pada proses dan hasil, kemudian menetapkan remedial atau pengayaan berdasarkan bukti pertemuan ${meeting.number}.`,
      `Sebagai tindak lanjut, peserta didik ${action}.`
    ];
  }

  function concreteOpening(module,meeting,objective){
    const focus=meetingFocus(meeting),stage=meetingStage(meeting),chapter=module.title,material=stimulusMaterial(module,meeting);
    const stimulus={
      'MEMBANGUN KONTEKS':`Guru menampilkan ${material}; peserta didik mencatat tiga rincian yang terlihat atau terdengar dan satu hal yang membuat mereka penasaran.`,
      'MENYIMAK ATAU MEMBACA MODEL':`Guru menyajikan ${material}; pada penyajian pertama peserta didik hanya menyimak atau memirsa, kemudian menuliskan dua informasi yang masih diingat.`,
      'MENEMUKAN INFORMASI':`Guru menyiapkan ${material}; peserta didik memilih dua informasi yang relevan dengan topik “${focus}” dan menunjukkan bagian yang menjadi buktinya.`,
      'MENGANALISIS STRUKTUR DAN BAHASA':`Guru menayangkan ${material}; peserta didik menandai bagian yang paling efektif dan bagian yang perlu diperbaiki dari sisi susunan atau bahasa.`,
      'LATIHAN TERBIMBING':`Guru menggunakan ${material} sebagai contoh bersama; peserta didik mengusulkan langkah penyelesaian sebelum guru memodelkan caranya.`,
      'MENGUMPULKAN DATA':`Guru menunjukkan ${material}; peserta didik menentukan data apa yang dapat dicatat sebagai fakta, sumber, dan hasil pengamatan.`,
      'MERENCANAKAN PRODUK':`Guru memperlihatkan ${material}; peserta didik menemukan calon judul, isi utama, bukti, dan urutan penyajian untuk rencana produknya.`,
      'MENULIS ATAU MENCIPTA':`Guru menggunakan ${material} sebagai bank gagasan; peserta didik memilih satu rincian sebagai bahan kalimat pembuka dan menjelaskan alasannya.`,
      'MENYUNTING':`Guru membagikan ${material}; peserta didik menandai satu masalah isi atau bahasa yang harus diperbaiki lebih dahulu.`,
      'MEMPRESENTASIKAN':`Guru menyajikan ${material}, lalu memperagakan penyampaian satu menit dalam dua cara; peserta didik membandingkan kejelasan isi, lafal, intonasi, dan kontak mata.`,
      'MEREFLEKSIKAN':`Guru menampilkan kembali ${material} bersama hasil kerja peserta didik; peserta didik menunjukkan perubahan pemahaman yang terjadi sejak pertemuan awal.`
    }[stage]||`Guru menampilkan contoh konkret bertema “${focus}” dan meminta peserta didik menuliskan hal yang sudah diketahui serta hal yang ingin ditanyakan.`;
    return[
      `Guru membuka pembelajaran dengan salam, doa, dan presensi, kemudian menghubungkan kegiatan dengan Bab “${chapter}”.`,
      stimulus,
      `Guru mengajukan pertanyaan pemantik: “Informasi apa yang paling penting tentang ${focus.toLowerCase()}, dan bukti apa yang mendukung jawabanmu?”`,
      `Guru menyampaikan tujuan pertemuan: ${cleanSentence(objective)}; keberhasilan ditunjukkan melalui jawaban yang tepat, bukti yang jelas, dan penggunaan bahasa yang santun.`
    ];
  }

  function concreteCore(module,meeting,objective){
    const focus=meetingFocus(meeting),stage=meetingStage(meeting),chapter=module.title;
    const context=cleanSentence(module.contexts?.[(Math.max(1,Number(meeting.number))-1)%Math.max(1,module.contexts?.length||1)]||`penerapan ${focus}`);
    const plans={
      'MEMBANGUN KONTEKS':[
        `Peserta didik mengamati ilustrasi “${focus}” dan mengisi tabel dua kolom: informasi yang tampak dan informasi yang masih perlu diketahui.`,
        `Secara berpasangan, peserta didik menceritakan pengalaman yang berkaitan dengan ${focus.toLowerCase()} selama satu menit bergantian.`,
        `Guru mencatat kosakata penting dari cerita peserta didik, lalu membedakan kata yang bersifat umum dan kata yang memberi rincian.`,
        `Kelompok menyusun dua pertanyaan literal dan satu pertanyaan inferensial berdasarkan ilustrasi serta pengalaman yang telah dibagikan.`,
        `Peserta didik membaca teks pengantar singkat, kemudian mencocokkan jawabannya dengan kalimat bukti dalam teks.`,
        `Setiap kelompok menyampaikan satu temuan dan satu pertanyaan yang akan dipelajari lebih lanjut pada topik ${focus}.`
      ],
      'MENYIMAK ATAU MEMBACA MODEL':[
        `Guru membacakan teks “${focus}” untuk kedua kalinya dengan jeda pada bagian penting; peserta didik mencatat kata kunci tanpa menyalin seluruh kalimat.`,
        `Peserta didik membaca mandiri dan memberi tanda garis bawah pada informasi utama serta lingkaran pada informasi pendukung.`,
        `Dalam pasangan, peserta didik membandingkan catatan hasil menyimak dengan hasil membaca dan memperbaiki informasi yang belum tepat.`,
        `Guru memandu pembahasan makna kosakata sulit melalui konteks kalimat, bukan langsung memberikan artinya.`,
        `Peserta didik menjawab dua pertanyaan literal dan dua pertanyaan inferensial dengan menyertakan kutipan bukti.`,
        `Peserta didik menulis ringkasan tiga kalimat tentang ${focus.toLowerCase()} menggunakan kata-katanya sendiri.`
      ],
      'MENEMUKAN INFORMASI':[
        `Peserta didik membaca sumber tentang “${focus}” dan menuliskan siapa, apa, kapan, di mana, mengapa, serta bagaimana pada LKPD.`,
        `Guru memodelkan cara memilih informasi relevan dengan membandingkan satu kalimat penting dan satu kalimat tambahan.`,
        `Kelompok menempatkan kartu informasi ke kategori fakta utama, fakta pendukung, atau tidak relevan.`,
        `Peserta didik menuliskan nomor paragraf dan kalimat bukti untuk setiap informasi yang dipilih.`,
        `Pasangan saling memeriksa apakah jawaban benar-benar didukung teks dan memperbaiki jawaban yang masih berupa dugaan.`,
        `Kelompok menyajikan peta informasi ${focus.toLowerCase()} dan menjawab satu pertanyaan dari kelompok lain.`
      ],
      'MENGANALISIS STRUKTUR DAN BAHASA':[
        `Guru membagikan dua kutipan bertema “${focus}”; peserta didik memberi warna berbeda pada bagian pembuka, isi, dan penutup.`,
        `Peserta didik mengidentifikasi kata kunci, kata hubung, pilihan kata, serta tanda baca yang membuat hubungan antargagasan menjadi jelas.`,
        `Kelompok menyusun ulang empat kalimat acak menjadi paragraf yang runtut dan menjelaskan dasar urutannya.`,
        `Peserta didik membandingkan makna sebelum dan sesudah satu kata hubung diganti, lalu mencatat perubahan hubungan gagasannya.`,
        `Guru memberikan satu kalimat kurang efektif; peserta didik memperbaikinya agar lebih tepat untuk menjelaskan ${focus.toLowerCase()}.`,
        `Peserta didik menyimpulkan dua ciri struktur dan dua ciri kebahasaan yang akan digunakan pada tugas berikutnya.`
      ],
      'LATIHAN TERBIMBING':[
        `Guru memodelkan satu contoh pada topik “${focus}” sambil mengucapkan langkah berpikir: memahami tugas, mencari bukti, memilih kata, dan memeriksa hasil.`,
        `Kelas menyelesaikan contoh kedua bersama-sama; guru hanya memberi pertanyaan penuntun ketika jawaban belum memiliki bukti.`,
        `Pasangan mengerjakan contoh ketiga menggunakan bank kata atau kartu struktur sesuai kebutuhan.`,
        `Peserta didik bertukar hasil dan memeriksa ketepatan isi, urutan gagasan, pilihan kata, ejaan, serta tanda baca dengan daftar periksa.`,
        `Peserta didik memperbaiki hasil berdasarkan catatan pasangannya, kemudian menjelaskan alasan perbaikan tersebut.`,
        `Secara mandiri, peserta didik menyelesaikan satu tugas singkat tentang ${focus.toLowerCase()} sebagai bukti kesiapan.`
      ],
      'MENGUMPULKAN DATA':[
        `Guru dan peserta didik menyepakati data yang diperlukan untuk membahas “${focus}” serta menentukan sumber yang aman dan dapat dipercaya.`,
        `Peserta didik menggunakan lembar observasi atau wawancara untuk memperoleh sedikitnya tiga data yang relevan.`,
        `Setiap data dicatat bersama sumber, waktu perolehan, dan kata kunci agar dapat diperiksa kembali.`,
        `Kelompok memilah hasil menjadi fakta, pendapat, dan dugaan; data yang belum jelas diberi tanda untuk diverifikasi.`,
        `Peserta didik membandingkan dua sumber dan mencatat persamaan, perbedaan, serta informasi yang paling kuat.`,
        `Peserta didik menyusun tabel ringkas yang akan digunakan sebagai bahan karya atau penjelasan tentang ${focus.toLowerCase()}.`
      ],
      'MERENCANAKAN PRODUK':[
        `Guru menunjukkan contoh produk bertema “${focus}”; peserta didik menilai bagian yang sudah memenuhi tujuan dan bagian yang perlu diperbaiki.`,
        `Peserta didik menentukan bentuk produk, pembaca atau pendengar sasaran, serta pesan utama yang ingin disampaikan.`,
        `Peserta didik memilih tiga bukti dari teks, hasil pengamatan, atau wawancara yang paling sesuai dengan tujuan.`,
        `Peserta didik membuat kerangka berisi judul, pembuka, urutan isi, kosakata penting, dan penutup.`,
        `Pasangan melakukan konferensi rencana dengan dua pertanyaan: “Apakah urutannya jelas?” dan “Apakah setiap gagasan memiliki bukti?”`,
        `Peserta didik memperbaiki kerangka dan menuliskan daftar bahan atau sumber yang diperlukan untuk membuat produk.`
      ],
      'MENULIS ATAU MENCIPTA':[
        `Peserta didik membuka kembali kerangka dan data, kemudian menulis bagian pembuka karya tentang “${focus}” untuk menarik perhatian pembaca.`,
        `Peserta didik mengembangkan isi dengan urutan logis serta memasukkan sedikitnya tiga informasi atau bukti yang relevan.`,
        `Guru melakukan konferensi singkat kepada beberapa peserta didik dengan fokus berbeda: isi, struktur, atau pilihan kata.`,
        `Peserta didik menggunakan daftar kosakata Bab “${chapter}” dan mengganti kata yang berulang dengan pilihan yang lebih tepat.`,
        `Pasangan membacakan draf secara bergantian untuk menemukan bagian yang belum jelas atau sulit dipahami.`,
        `Peserta didik merevisi draf pertama dan memberi judul yang mencerminkan isi karya tentang ${focus.toLowerCase()}.`
      ],
      'MENYUNTING':[
        `Guru memodelkan kode penyuntingan sederhana pada paragraf “${focus}”: HK untuk huruf kapital, TB untuk tanda baca, PK untuk pilihan kata, dan UG untuk urutan gagasan.`,
        `Peserta didik membaca drafnya dengan suara pelan untuk menemukan kalimat yang terlalu panjang, berulang, atau belum lengkap.`,
        `Peserta didik menandai dan memperbaiki huruf kapital, ejaan, tanda baca, serta kata hubung berdasarkan daftar periksa.`,
        `Pasangan bertukar draf dan memberikan dua catatan spesifik: satu kekuatan dan satu bagian yang perlu diperjelas.`,
        `Peserta didik memutuskan catatan yang digunakan, lalu menulis alasan jika tidak menggunakan suatu saran.`,
        `Peserta didik menghasilkan naskah bersih tentang ${focus.toLowerCase()} dan membandingkannya dengan draf awal.`
      ],
      'MEMPRESENTASIKAN':[
        `Peserta didik menyiapkan kartu kata kunci untuk menyampaikan hasil tentang “${focus}” tanpa membaca seluruh naskah.`,
        `Guru mengingatkan kriteria presentasi: isi runtut, bukti jelas, lafal dan intonasi tepat, kontak mata, serta durasi dua menit.`,
        `Peserta didik berlatih dalam kelompok tiga dengan peran penyaji, pencatat waktu, dan pemberi umpan balik.`,
        `Setiap peserta didik atau kelompok mempresentasikan hasil; pendengar mencatat satu informasi baru dan satu pertanyaan.`,
        `Penyaji menjawab pertanyaan dengan merujuk pada teks, data, atau hasil pengamatan yang digunakan.`,
        `Peserta didik memperbaiki satu bagian penyajian berdasarkan umpan balik dan menuliskan perubahan yang dilakukan.`
      ],
      'MEREFLEKSIKAN':[
        `Peserta didik membandingkan pekerjaan awal dan akhir pada topik “${focus}”, lalu menandai bukti kemajuan pada isi, bahasa, dan penyajian.`,
        `Peserta didik memilih satu kegiatan yang paling membantu pemahaman serta menjelaskan alasannya secara tertulis.`,
        `Kelompok membahas kesulitan yang masih muncul dan menyusun satu strategi perbaikan yang dapat dilakukan.`,
        `Guru mengembalikan tujuan pembelajaran; peserta didik memberi bukti apakah tujuan tersebut sudah, sebagian, atau belum tercapai.`,
        `Peserta didik menyusun satu tindakan nyata untuk menerapkan pembelajaran ${focus.toLowerCase()} di rumah atau sekolah.`,
        `Kelas membuat simpulan bersama yang menghubungkan ${focus.toLowerCase()} dengan pesan utama Bab “${chapter}”.`
      ]
    };
    const fallback=[
      `Peserta didik mengamati sumber khusus tentang “${focus}” dan mencatat informasi penting.`,
      `Guru mengajukan pertanyaan bertahap yang langsung mengarah pada tujuan: ${cleanSentence(objective)}.`,
      `Peserta didik mencari bukti, membandingkan jawaban, dan memperbaiki informasi yang belum tepat.`,
      `Kelompok menerapkan hasil pembahasan pada konteks: ${context}.`,
      `Peserta didik menyusun hasil dalam bentuk paragraf, tabel, peta gagasan, atau penyajian lisan yang sesuai tugas.`,
      `Guru memberi umpan balik spesifik dan peserta didik melakukan satu perbaikan sebelum mengumpulkan hasil.`
    ];
    return(plans[stage]||fallback).map(cleanSentence);
  }

  function concreteClosing(module,meeting){
    const focus=meetingFocus(meeting),stage=meetingStage(meeting);
    const nextAction={
      'MEMBANGUN KONTEKS':'membawa satu contoh atau informasi dari rumah yang berkaitan dengan topik berikutnya',
      'MENYIMAK ATAU MEMBACA MODEL':'membaca kembali teks model dan menandai satu bukti yang belum dibahas',
      'MENEMUKAN INFORMASI':'memperbaiki tabel informasi berdasarkan bukti yang ditemukan',
      'MENGANALISIS STRUKTUR DAN BAHASA':'menulis ulang satu paragraf dengan struktur dan bahasa yang telah dipelajari',
      'LATIHAN TERBIMBING':'menyelesaikan satu latihan mandiri serupa tanpa bantuan contoh',
      'MENGUMPULKAN DATA':'melengkapi satu data yang masih belum memiliki sumber yang jelas',
      'MERENCANAKAN PRODUK':'menyiapkan bahan dan sumber sesuai kerangka produk',
      'MENULIS ATAU MENCIPTA':'menyelesaikan bagian draf yang belum lengkap sebelum penyuntingan',
      'MENYUNTING':'menyiapkan naskah bersih untuk dipresentasikan atau dipublikasikan',
      'MEMPRESENTASIKAN':'memperbaiki penyajian berdasarkan satu saran yang paling berguna',
      'MEREFLEKSIKAN':'melaksanakan tindakan nyata yang telah dipilih dan mencatat hasilnya'
    }[stage]||'menyelesaikan perbaikan yang sudah disepakati';
    return[
      `Peserta didik menyampaikan satu pemahaman baru tentang ${focus.toLowerCase()} dan menunjukkan bukti yang mendukungnya.`,
      `Guru memberi umpan balik pada hasil yang muncul dalam pertemuan ini dan meluruskan kekeliruan yang masih ditemukan.`,
      `Sebagai tindak lanjut, peserta didik ${nextAction}.`
    ];
  }

  function enrichAllSubjects(){
    if(!Array.isArray(D.modules))return;
    const family=subjectFamily();
    const isApprovedBindoC=/bahasa indonesia/i.test(String(D.meta?.subject||D.meta?.title||''))&&/\/fase-c\//i.test(location.pathname);
    for(const module of D.modules){
      for(const [index,meeting] of (module.meetings||[]).entries()){
        const objectiveIndex=Math.max(0,Number(meeting.objectiveIndex||1)-1);
        const chapterObjective=module.objectives?.[objectiveIndex]?.text||meeting.topic;
        const stage=isApprovedBindoC?meetingStage(meeting):universalStage(meeting,index);
        const focus=isApprovedBindoC?meetingFocus(meeting):universalFocus(module,meeting,chapterObjective);
        const objective=isApprovedBindoC?specificObjective(meeting):universalObjective(module,meeting,stage,focus,chapterObjective);
        meeting.supervisionObjective=objective;
        meeting.chapterObjective=chapterObjective;
        if(isApprovedBindoC){
          meeting.pendahuluan=concreteOpening(module,meeting,objective);
          meeting.inti=concreteCore(module,meeting,objective);
          meeting.penutup=concreteClosing(module,meeting);
        }else{
          const material=universalMaterial(family,focus,chapterObjective,meeting);
          meeting.pendahuluan=universalOpening(module,meeting,stage,focus,objective,material);
          meeting.inti=universalCore(module,meeting,stage,focus,objective,material,family);
          meeting.penutup=universalClosing(module,meeting,stage,focus);
        }
      }
    }
  }

  function meetingData(number,topic='',chapter=''){
    const grade=(new URLSearchParams(location.search).get('grade')||'').toUpperCase();
    const chapterNumber=Number(String(chapter).match(/Bab\s+(\d+)/i)?.[1]||0);
    const modules=Array.isArray(D.modules)?D.modules:[];
    const candidates=modules.filter(module=>(!grade||String(module.grade).toUpperCase()===grade)&&(!chapterNumber||Number(module.chapter)===chapterNumber));
    for(const module of candidates){
      const meeting=(module.meetings||[]).find(item=>Number(item.number)===Number(number)&&(!topic||String(item.topic).trim()===String(topic).trim()));
      if(meeting)return{module,meeting};
    }
    for(const module of modules){
      const meeting=(module.meetings||[]).find(item=>Number(item.number)===Number(number)&&String(item.topic).trim()===String(topic).trim());
      if(meeting)return{module,meeting};
    }
    return null;
  }

  function addStyle(){
    if(document.getElementById('ep-supervision-detail-style'))return;
    const style=document.createElement('style');
    style.id='ep-supervision-detail-style';
    style.textContent=`
      .ep-supervision-meeting{border-top:3px solid #0f766e!important}
      .ep-supervision-meeting .topline{border-bottom:2px solid #0f766e!important;padding-bottom:2.2mm!important}
      .ep-supervision-meeting .objective-box{border-left:4px solid #0f766e!important}
      .ep-supervision-objective{margin:2.2mm 0 0!important;font-size:9.4pt!important;line-height:1.35!important}
      .ep-supervision-stage td{background:#e9f6f4!important;color:#115e59!important;font-weight:700!important;border-top:2px solid #0f766e!important}
      .ep-supervision-list{margin:0!important;padding-left:4.5mm!important}
      .ep-supervision-list li{margin:0 0 1mm!important;line-height:1.32!important}
      .ep-supervision-screen{border-top:4px solid #0f766e!important;padding-top:18px!important;margin-top:24px!important}
      .ep-supervision-screen h3{margin-bottom:6px!important}
      .ep-supervision-screen .ep-supervision-objective{font-size:14px!important}
      /* Preserve preview typography and cell spacing in print. */`;
    (document.head||document.documentElement).appendChild(style);
  }

  function patchPrintMeeting(page){
    if(page.hasAttribute(MARK))return;
    const spans=[...page.querySelectorAll('.topline span')];
    if(!spans.length||!/MODUL AJAR\s*·\s*PERTEMUAN/i.test(spans[0].textContent||''))return;
    const number=Number((spans[0].textContent||'').match(/PERTEMUAN\s+(\d+)/i)?.[1]||0);
    const duration=spans[1]?.textContent||'2 JP : 70 MENIT';
    const topic=page.querySelector('.objective-box b')?.textContent?.trim()||'';
    const chapter=page.querySelector('.objective-box small:last-child')?.textContent||'';
    const found=meetingData(number,topic,chapter);
    const parts=timeParts(duration);

    page.setAttribute(MARK,'1');
    page.classList.add('ep-supervision-meeting');
    spans[0].textContent=`RANCANGAN PERTEMUAN${found?.module?.allocation?` (${found.module.allocation})`:''}`;
    if(spans[1])spans[1].textContent=`Pertemuan ${number} · ${duration}`;

    const objectiveBox=page.querySelector('.objective-box');
    const objectiveIndex=Number(found?.meeting?.objectiveIndex||0)-1;
    const objective=found?.meeting?.supervisionObjective||found?.module?.objectives?.[objectiveIndex]?.text;
    if(objectiveBox&&objective&&!objectiveBox.querySelector('.ep-supervision-objective')){
      objectiveBox.insertAdjacentHTML('beforeend',`<p class="ep-supervision-objective"><b>Tujuan:</b> ${esc(objective)}</p>`);
    }

    const heading=[...page.querySelectorAll('h2')].find(node=>/LANGKAH PEMBELAJARAN/i.test(node.textContent||''));
    const table=heading?.nextElementSibling;
    const rows=table?[...table.querySelectorAll('tbody > tr')]:[];
    if(rows.length<2)return;

    const opening=rows[0];
    const closing=rows[rows.length-1];
    const openingCells=opening.children;
    const closingCells=closing.children;
    if(openingCells[0])openingCells[0].textContent=`Pendahuluan (${parts.opening} menit)`;
    if(closingCells[0])closingCells[0].textContent=`Penutup (${parts.closing} menit)`;
    if(found?.meeting&&openingCells[1])openingCells[1].innerHTML=list(found.meeting.pendahuluan);
    if(found?.meeting&&closingCells[1])closingCells[1].innerHTML=list(found.meeting.penutup);

    if(found?.meeting){
      rows.slice(1,-1).forEach((row,index)=>{
        const cells=row.children;
        if(cells[1]&&found.meeting.inti[index])cells[1].textContent=found.meeting.inti[index];
      });
    }

    const divider=document.createElement('tr');
    divider.className='ep-supervision-stage';
    divider.innerHTML=`<td colspan="3">Kegiatan Inti (${parts.core} menit)</td>`;
    opening.insertAdjacentElement('afterend',divider);
  }

  function patchScreenMeeting(section){
    if(section.hasAttribute(MARK))return;
    const eyebrow=section.querySelector('.eyebrow');
    if(!eyebrow||!/^PERTEMUAN\s+\d+/i.test(eyebrow.textContent?.trim()||''))return;
    const number=Number((eyebrow.textContent||'').match(/PERTEMUAN\s+(\d+)/i)?.[1]||0);
    const duration=(eyebrow.textContent||'').split('·').slice(1).join('·').trim()||'2 JP : 70 MENIT';
    const topic=section.querySelector('h3')?.textContent?.trim()||'';
    const found=meetingData(number,topic);
    const parts=timeParts(duration);
    const columns=[...section.querySelectorAll('.grid-3 > div')];

    section.setAttribute(MARK,'1');
    section.classList.add('ep-supervision-screen');
    eyebrow.textContent=`RANCANGAN PERTEMUAN · Pertemuan ${number} · ${duration}`;
    if(found){
      const objectiveIndex=Number(found.meeting.objectiveIndex||0)-1;
      const objective=found.meeting.supervisionObjective||found.module.objectives?.[objectiveIndex]?.text;
      if(objective)section.querySelector('h3')?.insertAdjacentHTML('afterend',`<p class="ep-supervision-objective"><b>Tujuan:</b> ${esc(objective)}</p>`);
    }
    const labels=[`Pendahuluan (${parts.opening} menit)`,`Kegiatan Inti (${parts.core} menit)`,`Penutup (${parts.closing} menit)`];
    columns.forEach((column,index)=>{
      const label=column.querySelector('b');if(label)label.textContent=labels[index]||label.textContent;
      if(found){const items=[found.meeting.pendahuluan,found.meeting.inti,found.meeting.penutup][index];const oldList=column.querySelector('ul');if(oldList&&items)oldList.outerHTML=list(items)}
    });
  }

  function apply(){
    addStyle();
    if(/\/fase-c\//i.test(location.pathname))document.querySelectorAll('td').forEach(cell=>{
      const value=(cell.textContent||'').trim();
      if(/^(V|VI)\s*\/\s*E$/i.test(value))cell.textContent=value.replace(/\/\s*E$/i,'/ C');
    });
    document.querySelectorAll('section.page').forEach(patchPrintMeeting);
    document.querySelectorAll('section.section').forEach(patchScreenMeeting);
  }

  enrichAllSubjects();
  apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
