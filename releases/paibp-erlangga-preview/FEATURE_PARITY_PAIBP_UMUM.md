# Paritas Fitur PAIBP Umum → PAIBP Versi Erlangga

Target: **fitur, kelengkapan perangkat, alur UI, penyimpanan, dan paket cetak mengikuti PAIBP umum terbaru**, sedangkan **judul bab, subbab, tujuan, konteks, aktivitas, asesmen, dan materi tetap mengikuti struktur Erlangga Kelas 1–6**.

## Hasil perbandingan

| Area | PAIBP Umum | Erlangga sebelum sinkronisasi | Erlangga setelah sinkronisasi |
|---|---|---|---|
| Beranda + kelas per fase | Ada | Ada | Sama |
| Kalender Pendidikan | Runtime terbaru + pilihan 2024/2025, 2025/2026, 2026/2027 | Menu ada, runtime terbaru belum dimuat | **Disamakan** |
| Jadwal Mengajar | Ada + sinkron kalender/profil | Ada | **Disamakan + storage terisolasi** |
| CP | CP 2026 | CP 2026 | Sama |
| ATP | Ada | Ada | Sama, isi Erlangga |
| Prota | Ada | Ada | Sama, isi Erlangga |
| Promes | Rinci per TP, JP, bulan/minggu + patch tanggal | Dasar ada, patch terbaru belum dimuat | **Disamakan** |
| Jurnal Mengajar | Ada | Ada | Sama |
| Daftar Hadir + impor CSV | Ada | Ada | Sama |
| KKTP | Terhubung Pesanan & Analisis Nilai | Dasar ada | **Disamakan dengan runtime KKTP terbaru** |
| Modul Ajar Deep Learning | Lengkap | Ada | Sama, isi Erlangga |
| Aktivitas tiap pertemuan | Runtime supervisi rinci per fokus/tujuan | Masih generik | **Disamakan dengan runtime rinci PAIBP umum** |
| Diferensiasi | Konten/proses/produk + runtime cetak | Data ada, runtime cetak belum sama | **Disamakan** |
| Bahan Ajar | Ada | Ada | Sama, isi Erlangga |
| LKPD | Ada | Ada | Sama, isi Erlangga |
| Asesmen | Diagnostik, formatif, sumatif, remedial, pengayaan | Ada | Sama, isi Erlangga |
| Analisis Nilai | Ada | Ada | Sama |
| Pesanan & Riwayat | Ada | Ada | Sama, **data Erlangga dipisahkan dari PAIBP umum** |
| Tanda tangan/logo | Runtime terbaru | Dasar ada | **Disamakan** |
| Paket Cetak | Tahunan/Semester/komponen | Ada | **Disamakan termasuk filename, diferensiasi, pagination aman** |
| Salin pesanan / dukungan Guru Kelas | Runtime production | Belum sinkron | **Disamakan bila konteks UI mendukung** |

## Isolasi data

PAIBP umum tetap memakai:
`eperangkat.pendidikan-agama-islam.faseX.v1.*`

PAIBP Erlangga memakai:
`eperangkat.pendidikan-agama-islam-erlangga.faseX.v1.*`

Shim storage dipasang sebelum script PAIBP umum berjalan, sehingga fitur yang diwarisi tetap bekerja tetapi tidak mencampur pesanan, profil, peserta didik, jadwal, atau nilai dengan PAIBP umum.

## Konten Erlangga yang dipertahankan

- Fase A: Kelas I–II, 20 bab.
- Fase B: Kelas III–IV, 22 bab.
- Fase C: Kelas V–VI, 20 bab.
- Judul bab dan subbab tetap mengikuti daftar isi Erlangga yang diberikan pengguna.
- CP tetap CP PAI dan Budi Pekerti 2026.
- Isi tujuan, konteks, kegiatan, diferensiasi, asesmen, bahan ajar, dan LKPD dikembangkan secara orisinal berdasarkan cakupan bab/subbab Erlangga; tidak menyalin teks buku secara verbatim.

## Runtime yang sekarang disamakan dengan PAIBP umum

- calendar-year
- calendar-level-runtime
- calendar-source-runtime
- calendar-2024-extension
- kktp-order-runtime
- promes-print-route-fix
- logo-fix
- grade-one-cover
- copy-order
- phase-c-supervision (dipakai lintas Fase A–F)
- print-filename
- differentiation-runtime
- print-safe-pages

Production tidak diubah oleh pekerjaan preview ini.
