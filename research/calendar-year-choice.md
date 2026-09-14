# Pilihan kalender per pesanan

Kalender 2025/2026 dan 2026/2027 tersedia pada seluruh rute aplikasi Fase A–F. Simpan Pesanan & Profil menyimpan kalender dan tahun profil bersama-sama. Kalender yang diganti disimpan pada calendarYears agar suntingan kalender sebelumnya dapat dikembalikan. Tidak ada migrasi massal tahun pesanan lama.

Kalender web, editor semester, dan kalender cetak menggunakan tahun serta events milik pesanan. Tabel memakai kelas CSS cetak asli. Generator membaca kalender dalam snapshot pesanan yang sama.

Referensi tanggal 2025/2026:
- Salinan SK Dinas Pendidikan Buol untuk SD/SMP: https://de.scribd.com/document/896508851/Kalender-Pendidikan-Tahun-Ajaran-2025-2026
- Libur nasional dan cuti bersama 2026, Sekretariat Negara: https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2026
- SKB 2025: https://www.kemenkopmk.go.id/sites/default/files/pengumuman/2024-10/SKB%203%20Menteri%20Libur%20Nasional%20dan%20Cuti%20Bersama%20Tahun%202025.pdf

Jadwal kegiatan sekolah 2025/2026 berasal dari acuan SD/SMP Buol, disediakan sebagai contoh yang dapat diedit untuk fase E/F atau daerah lain. Jangan menyebutnya SK resmi SMA/SMK atau Tolitoli. Hari libur 2026 mengikuti SKB nasional; Tahun Baru Islam dikoreksi menjadi 16 Juni 2026. Kalender 2026/2027 lama dan estimasinya dipertahankan.

Validasi: node --test tests/calendar-year.test.cjs. Fixture browser memakai renderer v3 dan print-v3 dari bundle cadangan, tidak memuat skrip sinkronisasi atau API pesanan. Dibuat dengan python tests/build-calendar-fixture.py <source-restored> <fixture-dir>. Fixture tidak masuk deployment production.

Production sebelum perubahan: dpl_9o2EhbmxUQ9JMG5xPjLDFwv2z6FL. Rilis tetap menggunakan arsitektur sumber dan pemulihan yang sudah ada, bukan mengganti keseluruhan aplikasi.
