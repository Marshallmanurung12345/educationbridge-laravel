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

## Role Pengguna

| Role       | Akses                                          |
| ---------- | ---------------------------------------------- |
| Sekolah    | Mengajukan campaign dan membuat laporan dampak |
| Individu   | Melihat dan memberikan donasi                  |
| Perusahaan | Menyalurkan donasi sebagai CSR                 |
| Pemerintah | Mendukung dan memantau campaign                |
| Admin      | Memverifikasi dan mengelola campaign           |

## Akun Demo

Semua akun menggunakan password `password`.

| Email                           | Role       |
| ------------------------------- | ---------- |
| `admin@educationbridge.id`      | Admin      |
| `sekolah1@educationbridge.id`   | Sekolah    |
| `sekolah2@educationbridge.id`   | Sekolah    |
| `individu@educationbridge.id`   | Individu   |
| `perusahaan@educationbridge.id` | Perusahaan |
| `pemerintah@educationbridge.id` | Pemerintah |

## API Utama

```text
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
GET  /api/campaigns
POST /api/campaigns
POST /api/campaigns/{id}/donations
GET  /api/stats
```
