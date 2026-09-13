<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Notification;
use App\Models\Report;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Official Government School Dataset
        $this->call(SchoolSeeder::class);

        // Retrieve official real schools from Kemendikdasmen dataset
        $wamena = School::where('npsn', '60301416')->first();
        $sula = School::where('npsn', '60200843')->first();
        $cikoneng = School::where('npsn', '20211543')->first();
        $alor = School::where('npsn', '50300215')->first();
        $sukaMakmur = School::where('npsn', '10645210')->first();
        $kupang = School::where('npsn', '50300189')->first();
        $agats = School::where('npsn', '60302194')->first();
        $nias = School::where('npsn', '10208123')->first();

        // ---------- USERS (Role Accounts linked to Official Schools) ----------
        $admin = User::create([
            'name' => 'Admin EducationBridge',
            'email' => 'admin@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $sekolah1 = User::create([
            'name' => 'Kepala Sekolah SD NEGERI 1 WAMENA',
            'email' => 'sekolah1@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'sekolah',
            'organization_name' => 'SD NEGERI 1 WAMENA',
            'school_id' => $wamena?->id,
            'npsn' => $wamena?->npsn,
        ]);

        $sekolah2 = User::create([
            'name' => 'Kepala Sekolah SMP NEGERI 1 KEPULAUAN SULA',
            'email' => 'sekolah2@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'sekolah',
            'organization_name' => 'SMP NEGERI 1 KEPULAUAN SULA',
            'school_id' => $sula?->id,
            'npsn' => $sula?->npsn,
        ]);

        $sekolah3 = User::create([
            'name' => 'Kepala Sekolah SD NEGERI CIKONENG 2',
            'email' => 'sekolah3@educationbridge.id',
            'password' => Hash::make('password'),
            'role' => 'sekolah',
            'organization_name' => 'SD NEGERI CIKONENG 2',
            'school_id' => $cikoneng?->id,
            'npsn' => $cikoneng?->npsn,
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

        // ---------- CAMPAIGNS (EducationBridge Needs Submitted by Verified Real Schools) ----------
        $samples = [
            [
                'owner' => $sekolah1,
                'school' => $wamena,
                'category' => 'Fasilitas',
                'tags' => ['3t', 'renovasi', 'infrastruktur'],
                'title' => 'Perbaikan Atap dan Lantai Kelas yang Bocor',
                'description' => 'Tiga ruang kelas mengalami kebocoran parah saat musim hujan sehingga kegiatan belajar mengajar di SD NEGERI 1 WAMENA sering terganggu.',
                'target_amount' => 45000000,
                'raised_amount' => 12500000,
                'urgency' => 5,
                'facility_condition' => 1,
                'remoteness' => 5,
                'access_score' => 2,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah2,
                'school' => $sula,
                'category' => 'Teknologi',
                'tags' => ['teknologi', '3t', 'digital'],
                'title' => 'Pengadaan Laptop dan Akses Internet untuk Ujian Online (ANBK)',
                'description' => 'SMP NEGERI 1 KEPULAUAN SULA belum memiliki unit laptop yang cukup untuk pelaksanaan Asesmen Nasional Berbasis Komputer (ANBK).',
                'target_amount' => 60000000,
                'raised_amount' => 22000000,
                'urgency' => 4,
                'facility_condition' => 2,
                'remoteness' => 5,
                'access_score' => 2,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah3,
                'school' => $cikoneng,
                'category' => 'Buku & Literasi',
                'tags' => ['buku', 'literasi'],
                'title' => 'Pengadaan Buku Bacaan Perpustakaan Anak',
                'description' => 'Perpustakaan SD NEGERI CIKONENG 2 membutuhkan penambahan buku bacaan cerita dan pengetahuan umum bagi siswa.',
                'target_amount' => 15000000,
                'raised_amount' => 15000000,
                'urgency' => 3,
                'facility_condition' => 3,
                'remoteness' => 2,
                'access_score' => 4,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah2,
                'school' => $alor,
                'category' => 'Beasiswa',
                'tags' => ['beasiswa', '3t'],
                'title' => 'Beasiswa Pendidikan untuk 20 Siswa Berprestasi Kurang Mampu',
                'description' => 'Bantuan perlengkapan dan seragam bagi 20 siswa SMAN 1 ALOR yang terancam putus sekolah karena kendala ekonomi.',
                'target_amount' => 40000000,
                'raised_amount' => 8000000,
                'urgency' => 5,
                'facility_condition' => 3,
                'remoteness' => 4,
                'access_score' => 3,
                'status' => 'pending',
            ],
            [
                'owner' => $sekolah1,
                'school' => $sukaMakmur,
                'category' => 'Teknologi',
                'tags' => ['internet', '3t', 'digital'],
                'title' => 'Pemasangan Akses Internet Satelit untuk Pembelajaran Digital',
                'description' => 'SD NEGERI SUKA MAKMUR di Musi Rawas Utara berada pada area blank spot sinyal sehingga membutuhkan koneksi satelit.',
                'target_amount' => 25000000,
                'raised_amount' => 3000000,
                'urgency' => 4,
                'facility_condition' => 3,
                'remoteness' => 5,
                'access_score' => 1,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah2,
                'school' => $kupang,
                'category' => 'Teknologi',
                'tags' => ['teknologi', 'digital', 'vokasi'],
                'title' => 'Komputer Perangkat Utama Praktik Jurusan Vokasi Multimedia',
                'description' => 'SMK NEGERI 2 KUPANG memerlukan tambahan komputer berespesifikasi standar untuk praktik pengolahan audio-video.',
                'target_amount' => 55000000,
                'raised_amount' => 27500000,
                'urgency' => 3,
                'facility_condition' => 2,
                'remoteness' => 2,
                'access_score' => 4,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah1,
                'school' => $agats,
                'category' => 'Fasilitas',
                'tags' => ['3t', 'sanitasi', 'infrastruktur'],
                'title' => 'Pembangunan Fasilitas Sanitasi & Air Bersih Sekolah',
                'description' => 'SD NEGERI 1 AGATS membutuhkan sarana penampung air hujan dan sanitasi layak bagi murid di area rawa.',
                'target_amount' => 35000000,
                'raised_amount' => 5000000,
                'urgency' => 5,
                'facility_condition' => 1,
                'remoteness' => 5,
                'access_score' => 1,
                'status' => 'verified',
            ],
            [
                'owner' => $sekolah2,
                'school' => $nias,
                'category' => 'Buku & Literasi',
                'tags' => ['3t', 'buku', 'literasi'],
                'title' => 'Pengadaan Fasilitas Baca dan Koleksi Buku SMPN 1 Nias Barat',
                'description' => 'SMP NEGERI 1 NIAS BARAT memerlukan tambahan buku referensi dan rak baca perpustakaan.',
                'target_amount' => 20000000,
                'raised_amount' => 7500000,
                'urgency' => 4,
                'facility_condition' => 3,
                'remoteness' => 5,
                'access_score' => 2,
                'status' => 'verified',
            ]
        ];

        foreach ($samples as $s) {
            $schoolObj = $s['school'];
            $campaign = Campaign::create([
                'user_id' => $s['owner']->id,
                'school_id' => $schoolObj?->id,
                'school_name' => $schoolObj?->name ?? 'Sekolah Resmi',
                'location' => $schoolObj ? "{$schoolObj->kecamatan}, {$schoolObj->kabupaten_kota}, {$schoolObj->provinsi}" : 'Indonesia',
                'category' => $s['category'],
                'tags' => $s['tags'],
                'title' => $s['title'],
                'description' => $s['description'],
                'target_amount' => $s['target_amount'],
                'raised_amount' => $s['raised_amount'],
                'student_count' => $schoolObj?->jumlah_siswa ?? 0,
                'urgency' => $s['urgency'],
                'facility_condition' => $s['facility_condition'],
                'remoteness' => $schoolObj?->is_3t ? 5 : $s['remoteness'],
                'access_score' => $s['access_score'],
                'status' => $s['status'],
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(60)->toDateString(),
            ]);

            if ($s['title'] === 'Pengadaan Buku Bacaan Perpustakaan Anak') {
                Report::create([
                    'campaign_id' => $campaign->id,
                    'title' => 'Buku Telah Diterima dan Digunakan',
                    'narrative' => 'Buku bacaan telah diterima SD NEGERI CIKONENG 2 dan disusun di perpustakaan sekolah. Antusiasme membaca siswa meningkat.',
                ]);
            }

            // Sample Notification for pending/verified campaigns
            if ($campaign->status === 'pending') {
                Notification::create([
                    'target_role' => 'admin',
                    'type' => 'campaign_submitted',
                    'title' => '📥 Pengajuan Bantuan Baru',
                    'message' => "Sekolah {$campaign->school_name} mengajukan permohonan bantuan '{$campaign->title}'. Perlu pemeriksaan verifikator.",
                    'campaign_id' => $campaign->id,
                    'is_read' => false,
                ]);
            } else {
                Notification::create([
                    'user_id' => $campaign->user_id,
                    'type' => 'campaign_verified',
                    'title' => '✅ Campaign Terverifikasi & Tayang!',
                    'message' => "Permohonan bantuan '{$campaign->title}' di {$campaign->school_name} telah disetujui Admin dan dipublikasikan.",
                    'campaign_id' => $campaign->id,
                    'is_read' => false,
                ]);
            }
        }

        $this->command->info('Seed selesai dengan Data Sekolah Resmi Kemendikdasmen.');
    }
}
