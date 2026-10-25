# EducationBridge

Aplikasi penghubung sekolah, donatur, perusahaan, dan pemerintah untuk mendukung kebutuhan pendidikan di Indonesia.

## Teknologi

- Backend: Laravel, Sanctum (SQLite lokal; PostgreSQL saat deploy)
- Frontend: React, Vite, Tailwind CSS

## Deploy gratis untuk demo lomba

Konfigurasi deploy yang disiapkan menggunakan **Vercel** untuk frontend, **Render Free** untuk API, dan **Neon Free** untuk PostgreSQL. Render Free dapat tidur setelah 15 menit tanpa trafik; kunjungan berikutnya bisa menunggu sekitar satu menit. Ini cocok untuk demo, bukan layanan dengan jaminan selalu aktif. Neon Free juga dapat scale-to-zero saat tidak digunakan.

### 1. Siapkan PostgreSQL di Neon

Buat project PostgreSQL di Neon, lalu catat host, nama database, username, dan password dari connection details. Jangan menaruh kredensial ini di Git atau membagikannya di chat.

### 2. Deploy API di Render

1. Push repository ini ke GitHub, lalu pilih **New > Blueprint** di Render dan hubungkan repository. Render akan membaca [render.yaml](./render.yaml) dan membangun backend dari [Dockerfile](./backend-laravel/backend/Dockerfile).
2. Isi environment variables yang diminta Render:
   - `APP_KEY`: jalankan `php artisan key:generate --show` dari folder backend lokal, lalu salin hasilnya ke Render.
   - `APP_URL`: URL service API Render setelah dibuat.
   - `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: nilai dari Neon. Port dan TLS sudah disetel untuk PostgreSQL.
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: akun admin produksi. Password wajib minimal 16 karakter dan jangan gunakan password akun demo.
   - `CORS_ALLOWED_ORIGINS`: domain frontend Vercel, tanpa slash di akhir. Isi setelah URL Vercel tersedia.
   - `MIDTRANS_SERVER_KEY`: Server Key **Sandbox** dari akun Midtrans. Jangan gunakan Server Key produksi untuk demo.
   - `MIDTRANS_NOTIFICATION_URL`: `https://<domain-api-render>/api/payments/midtrans/notification`.
3. Buat service. Saat container berjalan, aplikasi menjalankan migrasi, mengimpor file sekolah yang ada di repository, dan membuat admin produksi dari environment variables. Akun demo lokal tidak dibuat.

### 3. Deploy frontend di Vercel

1. Import repository di Vercel dan atur **Root Directory** menjadi `frontend`.
2. Tambahkan environment variable `VITE_API_URL` dengan URL API Render, misalnya `https://educationbridge-api.onrender.com` (tanpa `/api`).
3. Deploy, lalu salin domain Vercel ke `CORS_ALLOWED_ORIGINS` pada service Render dan deploy ulang API.
4. Uji halaman utama dan login admin. Untuk pembayaran demo, gunakan akun Midtrans Sandbox; pembayaran ini bukan uang sungguhan.

Tidak ada kredensial production di file konfigurasi. Simpan semua nilai rahasia hanya pada environment variable provider. Jangan menjalankan `php artisan migrate --seed` di production karena seeder lokal membuat akun demo dengan password yang diketahui.

### Hosting bersama (cPanel)

Untuk deployment manual pada hosting yang sudah memiliki Laravel:

1. Ekstrak ZIP frontend ke `public_html`, tanpa menimpa `api/index.php`.
2. Ekstrak ZIP backend ke direktori aplikasi Laravel, tanpa menimpa `.env`.
3. Dari Terminal cPanel, jalankan `php artisan migrate --force` di direktori aplikasi Laravel. Migrasi ini menambahkan kolom yang dipakai pengajuan kebutuhan; jangan menghapus atau mengubah tabel secara manual.
4. Pastikan proses PHP hosting dapat menulis ke `storage` dan `bootstrap/cache`. Untuk unggahan foto privat, pastikan `storage/app/private/campaign-uploads` tersedia dan dapat ditulis oleh proses PHP.

**Data sekolah:** dataset contoh dalam repository hanya memuat 9 sekolah. Pengaju kebutuhan dapat memasukkan nama sekolah dan NPSN secara manual serta memilih wilayah administratif dari daftar. Jika NPSN cocok dengan data yang sudah diimpor, pengajuan akan ditautkan ke data sekolah tersebut; jika tidak, admin perlu memeriksa identitas dan bukti sebelum menyetujui kampanye. Pendaftaran akun sekolah tetap memerlukan verifikasi admin.

Impor snapshot CSV sekolah nasional bersifat opsional untuk memperkaya direktori dan mencocokkan NPSN secara otomatis. Lihat [panduan data sekolah](./docs/sinkronisasi-data-sekolah.md). Impor dijalankan manual; data tidak disinkronkan otomatis atau real-time.

## Menjalankan Backend

Pastikan PHP dan Composer sudah terpasang.

```powershell
cd backend-laravel/backend
php artisan migrate --seed
php artisan serve --host 127.0.0.1 --port 8000
```

Backend berjalan di `http://127.0.0.1:8000`.

## Menjalankan Frontend

Buka terminal baru:

```powershell
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Registrasi dan Hak Akses

- Pendaftaran publik hanya menyediakan **Sekolah / Perwakilan** dan **Donatur**. Role internal donatur yang digunakan backend adalah `individu`; pendaftar perusahaan/CSR juga memilih Donatur dan tidak memperoleh role atau hak akses terpisah.
- Akun sekolah baru dapat login setelah registrasi, tetapi berstatus **Menunggu Verifikasi**. Admin harus mencocokkan nama sekolah dan NPSN dengan data sekolah resmi sebelum akun dapat mengajukan kebutuhan. Jika diminta perbaikan, sekolah dapat memperbarui datanya di halaman status verifikasi.
- Setelah login, Donatur diarahkan ke `/dashboard-donatur` untuk melihat catatan donasi, laporan yang tersedia, dan status pengajuan miliknya. Donatur juga dapat menjelajahi kebutuhan sekolah serta mengajukan kebutuhan dengan sekolah tujuan, hubungan dengan sekolah, RAB, dan bukti izin/kewenangan. Kebutuhan baru tampil ke publik setelah disetujui admin.
- Daftar sekolah pada aplikasi berasal dari dataset lokal yang tersedia, bukan sinkronisasi API real-time. Periksa kelengkapan dataset sebelum menganggap pencarian mencakup seluruh sekolah.
- Admin tidak dapat mendaftar melalui form publik. Akun admin lokal disediakan oleh seeder. Untuk produksi, buat akun admin melalui provisioning yang aman dan jangan gunakan kredensial demo.
- Role `perusahaan` dan `pemerintah` pada akun lama tetap didukung untuk kompatibilitas; keduanya tidak tersedia pada pendaftaran publik.

## Akun Demo

Jalankan `php artisan migrate --seed` di backend untuk membuat data demo lokal. Semua akun di bawah menggunakan password `password`; kredensial ini hanya untuk pengembangan lokal dan wajib diganti sebelum aplikasi dipakai di lingkungan lain.

| Email                           | Role       |
| ------------------------------- | ---------- |
| `admin@educationbridge.id`      | Admin      |
| `sekolah1@educationbridge.id`   | Sekolah    |
| `sekolah2@educationbridge.id`   | Sekolah    |
| `individu@educationbridge.id`   | Donatur    |
| `perusahaan@educationbridge.id` | Donatur lama (kompatibilitas) |
| `pemerintah@educationbridge.id` | Pemerintah lama (kompatibilitas) |

Sekolah membuka dashboard di `/dashboard-sekolah`; Donatur membuka dashboard di `/dashboard-donatur`. Admin mengelola kebutuhan yang perlu ditinjau di `/admin`, verifikasi akun sekolah di `/admin/akun-sekolah`, dan catatan tindakan di `/admin/audit-log`. Keputusan status akun dan kebutuhan dicatat di audit log.

## API Utama

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
GET  /api/campaigns
POST /api/campaigns
GET  /api/my-submissions
GET  /api/my-donations
POST /api/campaigns/{id}/donations
GET  /api/stats
```

akun yang bisa di akses 
Peran	Email	Kata sandi
Admin	admin@educationbridge.id	password
Sekolah	sekolah1@educationbridge.id	password
Donatur	individu@educationbridge.id	password