# Data Sekolah dan Wilayah

Pengajuan kebutuhan tidak lagi mewajibkan sekolah ditemukan di direktori lokal. Pengaju mengisi **nama sekolah dan NPSN** secara manual, memilih **jenjang pendidikan**, lalu memilih **provinsi dan kabupaten/kota** dari layanan data wilayah. NPSN tetap harus berupa delapan angka. Admin memeriksa identitas, NPSN, dan bukti kewenangan sebelum menyetujui kampanye.

Pendaftaran akun sekolah juga menerima nama dan NPSN secara manual. Jika NPSN tidak ada pada snapshot lokal, admin dapat memeriksa NPSN melalui Data Induk Kemendikdasmen atau sumber resmi lain, lalu wajib mencatat hasil pemeriksaan sebelum menyetujui akun. Sekolah terverifikasi yang belum tertaut ke direktori dapat mengajukan kebutuhan dengan memilih jenjang dan lokasi; pengajuannya tetap berstatus menunggu pemeriksaan admin.

Lokasi administratif berasal dari layanan data wilayah bertingkat yang diproksikan backend. Layanan harus tersedia saat daftar provinsi/kabupaten dimuat.

## Impor direktori sekolah (opsional)

Portal [Data Induk Kemendikdasmen](https://data.kemendikdasmen.go.id/data-induk) menyediakan data satuan pendidikan dan unduhan CSV/XLSX/PDF. Jika tersedia CSV yang berisi satu baris per sekolah, direktori lokal dapat diperkaya agar NPSN yang cocok tertaut ke record sekolah resmi.

1. Unduh tab **Daftar Satuan Pendidikan**, bukan tab **Jumlah Satuan Pendidikan**. Rekap jumlah provinsi tidak memuat sekolah satu per satu.
2. Pastikan CSV memiliki NPSN, nama satuan pendidikan, jenjang/bentuk pendidikan, provinsi, dan kabupaten/kota.
3. Simpan file di komputer, lalu jalankan dari folder backend:

   ```powershell
   cd "D:\SEMESTER 6\PPL Final\educationbridge-laravel\backend-laravel\backend"
   php artisan import:official-schools "C:\lokasi\file\data-sekolah.csv"
   ```

4. Setelah pesan `Successfully imported ... schools` muncul, data itu bisa dipakai untuk pencocokan NPSN otomatis. Formulir tetap menerima identitas yang dimasukkan manual jika sekolah belum ada di direktori.

Impor dapat dijalankan ulang dengan CSV yang lebih baru. Data diperbarui berdasarkan NPSN, sekolah yang tidak ada dalam file baru tidak otomatis dihapus, dan status 3T yang sudah tersimpan tidak ditimpa oleh CSV.

## Kolom CSV

CSV perlu memiliki kolom untuk **NPSN**, **nama sekolah**, **jenjang/bentuk pendidikan**, **provinsi**, dan **kabupaten/kota**. Kolom status sekolah, kecamatan, alamat, koordinat, jumlah siswa, dan jumlah guru digunakan jika tersedia. Nama kolom berbahasa Indonesia umum seperti `Nama Satuan Pendidikan`, `Bentuk Pendidikan`, `Provinsi`, serta `Kabupaten/Kota` dikenali oleh importer.

Jika importer menolak header, jangan ubah data secara manual atau menganggap impor berhasil. Periksa pesan error dan nama kolom pada CSV yang diunduh. Jangan memakai CSV yang hanya berisi ringkasan statistik, sebab aplikasi memerlukan satu baris per sekolah dan NPSN untuk menghubungkan pengajuan ke sekolah yang tepat.

## Batasan penting

- Impor ini adalah pembaruan snapshot saat perintah dijalankan; **bukan sinkronisasi otomatis atau real-time**.
- File contoh yang disertakan dalam repository hanya berisi sejumlah kecil sekolah untuk pengembangan.
- NPSN yang diisi manual tidak otomatis membuktikan bahwa pengaju berwenang mewakili sekolah. Admin tetap perlu memeriksa bukti pengajuan sebelum mengubah status kampanye menjadi terverifikasi.
- Direktori lokal hanya membantu pencocokan dan pelengkapan data; direktori tersebut bukan syarat pendaftaran atau verifikasi bila admin telah memeriksa sumber resmi secara manual.
- Daftar jenjang di formulir adalah pilihan standar untuk pengajuan; nomenklatur pada sumber CSV bisa berbeda dan tidak digunakan untuk memvalidasi isian manual.
