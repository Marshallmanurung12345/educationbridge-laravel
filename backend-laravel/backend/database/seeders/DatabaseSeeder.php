<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- USERS (satu akun contoh per role) ----------
        $admin = User::create([
            'name' => 'Admin EducationBridge',
            'email' => 'admin@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $sekolah1 = User::create([
            'name' => 'Kepala Sekolah Wamena',
            'email' => 'sekolah1@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'sekolah',
            'organization_name' => 'SDN 03 Wamena Tengah',
        ]);

        $sekolah2 = User::create([
            'name' => 'Kepala Sekolah Sula',
            'email' => 'sekolah2@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'sekolah',
            'organization_name' => 'SMPN 1 Kepulauan Sula',
        ]);

        $individu = User::create([
            'name' => 'Budi Santoso',
            'email' => 'individu@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'individu',
        ]);

        $perusahaan = User::create([
            'name' => 'CSR PT Teknologi Nusantara',
            'email' => 'perusahaan@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'perusahaan',
            'organization_name' => 'PT Teknologi Nusantara',
        ]);

        $pemerintah = User::create([
            'name' => 'Dinas Pendidikan Provinsi',
            'email' => 'pemerintah@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'pemerintah',
            'organization_name' => 'Dinas Pendidikan Provinsi',
        ]);

        // ---------- CAMPAIGNS ----------
        $samples = [
            [
                'owner' => $sekolah1, 'school_name' => 'SDN 03 Wamena Tengah', 'location' => 'Wamena, Papua Pegunungan',
                'category' => 'Fasilitas', 'tags' => ['3t', 'renovasi', 'infrastruktur'],
                'title' => 'Perbaikan Atap dan Lantai Kelas yang Bocor',
                'description' => 'Tiga ruang kelas mengalami kebocoran parah saat musim hujan sehingga kegiatan belajar sering dihentikan.',
                'target_amount' => 45000000, 'raised_amount' => 12500000, 'student_count' => 128,
                'urgency' => 5, 'facility_condition' => 1, 'remoteness' => 5, 'status' => 'verified',
            ],
            [
                'owner' => $sekolah2, 'school_name' => 'SMPN 1 Kepulauan Sula', 'location' => 'Sanana, Maluku Utara',
                'category' => 'Teknologi', 'tags' => ['teknologi', '3t', 'digital'],
                'title' => 'Pengadaan Laptop dan Akses Internet untuk Ujian Online',
                'description' => 'Sekolah belum memiliki laptop yang cukup untuk pelaksanaan asesmen berbasis komputer.',
                'target_amount' => 60000000, 'raised_amount' => 22000000, 'student_count' => 210,
                'urgency' => 4, 'facility_condition' => 2, 'remoteness' => 5, 'status' => 'verified',
            ],
            [
                'owner' => $sekolah1, 'school_name' => 'SDN Cikoneng 2', 'location' => 'Ciamis, Jawa Barat',
                'category' => 'Buku', 'tags' => ['buku', 'literasi'],
                'title' => 'Pengadaan Buku Bacaan Perpustakaan',
                'description' => 'Perpustakaan sekolah hanya memiliki buku pelajaran lama tanpa buku bacaan anak.',
                'target_amount' => 15000000, 'raised_amount' => 15000000, 'student_count' => 180,
                'urgency' => 3, 'facility_condition' => 3, 'remoteness' => 2, 'status' => 'verified',
            ],
            [
                'owner' => $sekolah2, 'school_name' => 'SMAN 1 Alor', 'location' => 'Kalabahi, Nusa Tenggara Timur',
                'category' => 'Beasiswa', 'tags' => ['beasiswa', '3t'],
                'title' => 'Beasiswa untuk 20 Siswa Tidak Mampu',
                'description' => '20 siswa berprestasi terancam putus sekolah karena kesulitan ekonomi keluarga.',
                'target_amount' => 40000000, 'raised_amount' => 8000000, 'student_count' => 20,
                'urgency' => 5, 'facility_condition' => 3, 'remoteness' => 4, 'status' => 'pending',
            ],
            [
                'owner' => $sekolah1, 'school_name' => 'SDN Suka Makmur', 'location' => 'Musi Rawas Utara, Sumatra Selatan',
                'category' => 'Fasilitas', 'tags' => ['internet', '3t', 'digital'],
                'title' => 'Pemasangan Internet untuk Pembelajaran Digital',
                'description' => 'Sekolah berada di area blank spot sinyal sehingga tidak bisa mengakses platform belajar digital.',
                'target_amount' => 25000000, 'raised_amount' => 3000000, 'student_count' => 95,
                'urgency' => 4, 'facility_condition' => 3, 'remoteness' => 5, 'status' => 'verified',
            ],
            [
                'owner' => $sekolah2, 'school_name' => 'SMK Negeri 2 Kupang', 'location' => 'Kupang, Nusa Tenggara Timur',
                'category' => 'Teknologi', 'tags' => ['teknologi', 'digital', 'vokasi'],
                'title' => 'Komputer untuk Praktik Jurusan Multimedia',
                'description' => 'Jurusan Multimedia hanya memiliki 8 unit komputer untuk 60 siswa.',
                'target_amount' => 55000000, 'raised_amount' => 27500000, 'student_count' => 60,
                'urgency' => 3, 'facility_condition' => 2, 'remoteness' => 2, 'status' => 'verified',
            ],
        ];

        foreach ($samples as $s) {
            $campaign = Campaign::create([
                'user_id' => $s['owner']->id,
                'school_name' => $s['school_name'],
                'location' => $s['location'],
                'category' => $s['category'],
                'tags' => $s['tags'],
                'title' => $s['title'],
                'description' => $s['description'],
                'target_amount' => $s['target_amount'],
                'raised_amount' => $s['raised_amount'],
                'student_count' => $s['student_count'],
                'urgency' => $s['urgency'],
                'facility_condition' => $s['facility_condition'],
                'remoteness' => $s['remoteness'],
                'status' => $s['status'],
            ]);

            if ($s['title'] === 'Pengadaan Buku Bacaan Perpustakaan') {
                Report::create([
                    'campaign_id' => $campaign->id,
                    'title' => 'Buku Telah Diterima dan Digunakan',
                    'narrative' => '150 buku bacaan telah diterima sekolah dan disusun di rak baca kelas. Antusiasme siswa meningkat pada jam literasi pagi.',
                ]);
            }
        }

        $this->command->info('Seed selesai. Kredensial demo (password semua: "password"):');
        $this->command->info('- admin@educationbridge.id (Admin)');
        $this->command->info('- sekolah1@educationbridge.id / sekolah2@educationbridge.id (Sekolah)');
        $this->command->info('- individu@educationbridge.id (Individu)');
        $this->command->info('- perusahaan@educationbridge.id (Perusahaan/CSR)');
        $this->command->info('- pemerintah@educationbridge.id (Pemerintah/Mitra)');
    }
}
