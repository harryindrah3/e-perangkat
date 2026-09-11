# Snapshot production 4ip6l9g5h

Deployment: dpl_47hWrAybCWuWmrujbg828eBf9FnZ
Domain utama: https://e-perangkat-online-a-f.vercel.app
Tanggal pencadangan: 2026-09-11

Empat berkas source disalin dari tab Source deployment Vercel. index.html (111 baris), delete-order.js (231 baris), print-filename.js (55 baris), vercel.json (20 baris). Semua nomor baris diperiksa agar tidak ada yang terlewat. Baris terakhir dinormalisasi dengan newline.

## Pemulihan pembaruan

Unduh folder ini, lalu jalankan `vercel` dari folder ini untuk membuat preview. Setelah diuji, promosikan deployment preview yang sama ke production.

## Batas pemulihan yang harus diperhatikan

Snapshot ini adalah pembungkus/pembaruan production, BUKAN aplikasi mandiri. index.html dan vercel.json bergantung pada deployment dasar berikut:
https://e-perangkat-online-a-fucdkqkuq-harryindrah3-6239s-projects.vercel.app

Jangan menghapus deployment dasar tersebut. Bundle source sebelumnya tetap disimpan di direktori backups; bundle itu memiliki 2.192 berkas dan 69 aplikasi, tetapi kesetaraannya dengan deployment dasar fucdkqkuq belum dibuktikan. Karena itu backup ini belum menjamin pemulihan lengkap apabila deployment dasar terhapus.

Database pesanan, environment variables, dan data pelanggan tidak disertakan. Tidak ada perubahan pada aplikasi production selama pencadangan ini.
