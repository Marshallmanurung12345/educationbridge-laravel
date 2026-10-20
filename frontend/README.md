# EducationBridge

EducationBridge adalah aplikasi web untuk menghubungkan sekolah, donatur, perusahaan, dan pemerintah dalam mendukung kebutuhan pendidikan.

## Persyaratan

- PHP 8.3 atau lebih baru
- Composer
- Node.js 20.19+ atau 22.12+, beserta npm

## Menjalankan aplikasi

Aplikasi terdiri dari backend Laravel dan frontend React. Jalankan backend dan frontend di **dua terminal terpisah** dari direktori utama repository.

### 1. Menyiapkan backend (pertama kali)

Di terminal pertama, jalankan dari direktori utama repository:

```powershell
cd backend-laravel\backend
composer install

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

php artisan key:generate

if (-not (Test-Path database\database.sqlite)) {
    New-Item -ItemType File -Path database\database.sqlite
}

php artisan migrate --seed
```

`composer install` memasang dependensi PHP dan biasanya cukup dijalankan sekali. Lewati jika folder `vendor` sudah tersedia. Penyalinan `.env`, pembuatan app key, dan pembuatan file SQLite juga merupakan setup awal. Jalankan `php artisan migrate --seed` saat pertama menyiapkan database atau ketika database perlu dibuat ulang.

### 2. Menjalankan backend

Setelah setup awal selesai, jalankan backend di terminal pertama:

```powershell
cd backend-laravel\backend
php artisan serve --host 127.0.0.1 --port 8000
```

Backend berjalan di `http://127.0.0.1:8000`. Biarkan terminal ini tetap terbuka.

### 3. Menyiapkan dan menjalankan frontend

Di terminal kedua, jalankan dari direktori utama repository:

```powershell
cd frontend

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

npm install
```

`npm install` cukup dijalankan saat pertama kali atau ketika dependensi frontend berubah. Untuk menjalankan frontend, gunakan:

```powershell
cd frontend
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`. Biarkan terminal frontend tetap terbuka dan pastikan backend juga berjalan agar fitur yang menggunakan API dapat digunakan.

Frontend menggunakan `VITE_API_URL` untuk menentukan alamat backend. Nilai bawaan di `.env.example` adalah `http://localhost:8000`. Ubah nilai tersebut jika backend berjalan di alamat atau port lain, lalu jalankan ulang server frontend.

## Build frontend

Untuk membuat build produksi frontend:

```powershell
npm run build
```

Hasil build akan tersedia di folder `dist`.
