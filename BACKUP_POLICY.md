# Kebijakan Backup E-Perangkat

Repository ini adalah sumber utama dan cadangan pemulihan E-Perangkat Online A-F.

Urutan wajib untuk setiap pembaruan:

1. Ubah source code pada salinan kerja repository ini.
2. Uji fitur terkait dan pastikan fitur lama tetap berfungsi.
3. Commit perubahan dengan pesan yang menjelaskan fitur/perbaikan.
4. Push commit ke GitHub.
5. Deploy commit yang sama ke Vercel production.
6. Catat commit GitHub dan deployment production pada laporan penyelesaian.

Jangan melakukan pembaruan production yang hanya bergantung pada deployment Vercel lama atau pembungkus sementara. Source lengkap harus selalu dapat dibangun kembali dari repository ini.

## Titik Pemulihan Awal

- Sumber: snapshot E-Perangkat yang berhasil dipulihkan.
- Cakupan: 69 aplikasi, Fase A-F, Kelas I-XII.
- Database pesanan tidak disimpan di repository karena tetap berada pada layanan database aplikasi.
