# EducationBridge

Aplikasi penghubung sekolah, donatur, perusahaan, dan pemerintah untuk mendukung kebutuhan pendidikan di Indonesia.

## Teknologi

- Backend: Laravel, Sanctum, SQLite
- Frontend: React, Vite, Tailwind CSS

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