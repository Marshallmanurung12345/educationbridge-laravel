# EducationBridge — versi Laravel (backend) + React (frontend)

Backend diganti dari Node/Express menjadi **Laravel** (REST API + Sanctum untuk autentikasi token),
frontend tetap **React (Vite) + Tailwind**. Sekarang seluruh 5 role dari dokumen konsep sudah diimplementasikan
dengan akun/login sungguhan:

| Role | Bisa apa saja |
|---|---|
| 🏫 **Sekolah** | Mengajukan campaign, mengunggah laporan dampak untuk campaign miliknya |
| 👤 **Individu** | Berdonasi ke campaign yang sudah terverifikasi |
| 🏢 **Perusahaan** | Berdonasi (disalurkan sebagai CSR) |
| 🏛️ **Pemerintah/Mitra** | Berdonasi/mendukung campaign |
| 🛡️ **Admin** | Verifikasi, tolak, dan hapus campaign |

> ⚠️ **Catatan penting**: kode Laravel di folder `backend-laravel/` ditulis lengkap dan sudah dicek
> `php -l` (bebas syntax error), TAPI belum bisa saya jalankan/test end-to-end di lingkungan saya karena
> sandbox ini tidak punya akses ke Packagist (server paket Composer). Jadi ikuti langkah instalasi di bawah
> dengan teliti — semua perintah `composer`/`artisan` perlu dijalankan di komputer/server kalian sendiri.

## Struktur folder

```
educationbridge-laravel/
├── frontend/            React (Vite) + Tailwind — SUDAH lengkap, siap `npm install && npm run dev`
└── backend-laravel/     File custom untuk DITEMPEL ke instalasi Laravel baru (bukan project Laravel utuh)
    ├── app/Http/Controllers/*.php
    ├── app/Http/Middleware/EnsureRole.php
    ├── app/Models/*.php
    ├── database/migrations/*.php
    ├── database/seeders/DatabaseSeeder.php
    ├── routes/api.php
    └── config/cors.php
```

## Langkah 1 — Buat project Laravel baru

```bash
composer create-project laravel/laravel backend
cd backend
php artisan install:api
```

`php artisan install:api` otomatis meng-install **Laravel Sanctum** dan mengaktifkan `routes/api.php`. Ini wajib dijalankan sebelum langkah berikut.

## Langkah 2 — Tempel file dari `backend-laravel/` ke project Laravel

Salin isi folder `backend-laravel/app`, `backend-laravel/database`, `backend-laravel/config`
ke folder yang sama persis di project Laravel baru kalian (timpa file yang sudah ada bila diminta),
dan timpa `routes/api.php` dengan punya kami.

```bash
# dari dalam folder project Laravel ("backend")
cp -r ../educationbridge-laravel/backend-laravel/app/Http/Controllers/*.php app/Http/Controllers/
cp -r ../educationbridge-laravel/backend-laravel/app/Http/Middleware/*.php app/Http/Middleware/
cp -r ../educationbridge-laravel/backend-laravel/app/Models/*.php app/Models/
cp -r ../educationbridge-laravel/backend-laravel/database/migrations/*.php database/migrations/
cp -r ../educationbridge-laravel/backend-laravel/database/seeders/DatabaseSeeder.php database/seeders/
cp ../educationbridge-laravel/backend-laravel/routes/api.php routes/api.php
cp ../educationbridge-laravel/backend-laravel/config/cors.php config/cors.php
```

## Langkah 3 — Daftarkan middleware `role`

Buka `bootstrap/app.php`, cari bagian `->withMiddleware(function (Middleware $middleware) {`
dan tambahkan alias berikut di dalamnya:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureRole::class,
    ]);
})
```

## Langkah 4 — Konfigurasi database & migrate

Cara termudah (SQLite, tanpa install MySQL):

```bash
touch database/database.sqlite
```
Di file `.env`, set:
```
DB_CONNECTION=sqlite
DB_DATABASE=/path/absolut/ke/backend/database/database.sqlite
```
(Boleh juga pakai MySQL/PostgreSQL seperti biasa — ganti `DB_CONNECTION` sesuai kebutuhan.)

Lalu jalankan migrasi + seed data contoh (termasuk 1 akun demo untuk setiap role):

```bash
php artisan migrate --seed
```

Kredensial demo yang dibuat seeder (password semua **"password"**):
- `admin@educationbridge.id` — Admin
- `sekolah1@educationbridge.id`, `sekolah2@educationbridge.id` — Sekolah
- `individu@educationbridge.id` — Individu
- `perusahaan@educationbridge.id` — Perusahaan (CSR)
- `pemerintah@educationbridge.id` — Pemerintah/Mitra

## Langkah 5 — Jalankan backend

```bash
php artisan serve
```
API akan tersedia di `http://localhost:8000/api`.

## Langkah 6 — Jalankan frontend React

```bash
cd frontend
npm install
cp .env.example .env      # isi VITE_API_URL=http://localhost:8000
npm run dev
```
Buka `http://localhost:5173`.

## Autentikasi

Frontend menggunakan **token Bearer** dari Laravel Sanctum (bukan cookie), jadi tidak perlu konfigurasi
domain "stateful" khusus. Alur: `POST /api/login` atau `/api/register` → dapat `token` → disimpan di
`localStorage` → dikirim sebagai header `Authorization: Bearer <token>` di setiap request terproteksi.

## Endpoint API

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/register` | Publik (role: sekolah/individu/perusahaan/pemerintah) |
| POST | `/api/login` | Publik |
| POST | `/api/logout` | Login |
| GET | `/api/me` | Login |
| GET | `/api/campaigns` | Publik |
| POST | `/api/campaigns` | Role: sekolah |
| GET | `/api/campaigns/{id}` | Publik |
| PUT | `/api/campaigns/{id}` | Pemilik (sekolah) atau admin |
| DELETE | `/api/campaigns/{id}` | Role: admin |
| GET/POST | `/api/campaigns/{id}/donations` | GET publik, POST role donatur |
| GET/POST | `/api/campaigns/{id}/reports` | GET publik, POST pemilik sekolah |
| GET | `/api/match?focus=tag1,tag2` | Publik (Smart Matching) |
| GET | `/api/stats` | Publik |

## Deploy

- **Backend Laravel**: Railway, Render, Laravel Forge, atau VPS biasa (butuh PHP 8.2+, Composer, dan database).
- **Frontend React**: Vercel/Netlify (`npm run build`, arahkan `VITE_API_URL` ke URL backend production),
  atau di-serve lewat Laravel juga dengan build ke `public/` bila ingin satu domain.
- Jangan lupa tambahkan domain frontend production ke `allowed_origins` di `config/cors.php`.
