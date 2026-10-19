# Flora of Thirty

Website katalog flora Kelompok Ilmiah Remaja SMAN 30 Jakarta.

## Menjalankan

Buka `index.html` di browser. Website memakai HTML, CSS, dan JavaScript biasa tanpa instalasi. Inter dimuat dari Google Fonts; tanpa koneksi internet, browser memakai font fallback sistem. Tombol bulan atau matahari di header mengganti mode terang dan gelap, lalu menyimpan pilihan di browser.

## Isi

- Pencarian nama, indeks A–Z, filter area, dan pilihan tanaman acak. Hero menampilkan foto flora pilihan yang berganti setiap lima detik; foto dapat diklik untuk membuka detail tanaman.
- Intro KIR singkat tampil sekali per sesi tab dan tidak berulang saat membuka detail tanaman. Intro dilewati bila perangkat memakai pengaturan reduced motion.
- Tanaman bisa ditandai sebagai favorit dari kartu atau halaman detail. Favorit tersimpan di browser/perangkat ini dan bisa difilter dari katalog.
- Foto di halaman detail bisa dibuka lebih besar; dialog foto dapat ditutup dengan tombol tutup, klik area luar, atau tombol Escape.
- Navigasi keyboard memiliki penanda fokus yang jelas. Kontrol di layar kecil memakai area sentuh yang lebih besar dan gerakan menghormati pengaturan reduced motion perangkat.
- Setiap kartu membuka halaman detail dengan URL `?tanaman=<slug>` yang bisa disalin. Detail mencakup nama ilmiah, ciri-ciri, manfaat umum, bunga/perkembangbiakan, habitat/sebaran, perawatan, fakta, area tanaman tercatat, tingkat kepastian identifikasi, dan rujukan.
- Nama umum yang ambigu ditandai perlu verifikasi. Detail yang belum dapat diidentifikasi meminta foto tanaman, bukan menebak nama ilmiah atau manfaatnya.
- Beberapa tanaman beracun diberi catatan kehati-hatian. Informasi manfaat bukan anjuran konsumsi atau pengobatan.
- Form usulan menyimpan data di `localStorage` browser/perangkat ini. Tombol ekspor mengunduh JSON agar tim KIR dapat meninjau usulan secara manual; usulan belum terkirim ke KIR.

## Berkas data

- `plants.js` adalah daftar nama umum unik, lokasi, dan alias dari dokumen inspeksi sekolah serta lampiran LT1 yang dilengkapi.
- `botany.js` menyimpan informasi botani dan tautan sumber per nama. Tinjau entri berstatus sementara dengan foto langsung tanaman di SMAN 30.
- `flora-details.js` menyimpan ringkasan profil dari lampiran dokumen inspeksi Flora Of Thirty (LT1) yang dilengkapi. Lokasi yang ditampilkan tetap mengikuti inventaris utama; nama yang meragukan diberi catatan verifikasi.
- Foto referensi berada di `assets/flora/`. Kredit, lisensi, dan halaman sumber ditampilkan di halaman detail tanaman serta disertakan kembali dalam `assets/flora/Atribusi.csv`.
- `plants.json` menyimpan salinan daftar nama dan lokasi yang lebih mudah dibaca.

Katalog menampilkan satu nama umum untuk setiap tanaman, mengikuti kolom nama umum pada dokumen LT1 yang dilengkapi. Variasi nama inspeksi digabung sebagai alias dan semua lokasinya dipertahankan. Inventaris 157 baris menjadi 116 entri unik; tautan lama yang memakai variasi nama tetap membuka halaman nama umum. Kemuning dipertahankan sebagai satu tanaman tambahan dari inventaris awal; tidak ada profil/foto Kemuning di dokumen dan folder aset LT1.

## Tautan detail

Rute detail menggunakan query, misalnya `index.html?tanaman=lidah-mertua`, sehingga tetap bekerja pada hosting statis. Saat situs dibuka sebagai file lokal, tautan hanya dapat dibuka di perangkat yang memiliki folder ini. Agar orang lain bisa membukanya, unggah folder situs ke hosting statis lalu bagikan URL publiknya.



