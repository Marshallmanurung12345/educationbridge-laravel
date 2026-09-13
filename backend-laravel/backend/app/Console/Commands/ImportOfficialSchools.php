<?php

namespace App\Console\Commands;

use App\Models\School;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportOfficialSchools extends Command
{
    protected $signature = 'import:official-schools {file? : Path to official schools JSON dataset}';
    protected $description = 'Import official school dataset from Kemendikdasmen JSON file into database';

    public function handle()
    {
        $filePath = $this->argument('file') ?: database_path('data/official_schools.json');

        if (!File::exists($filePath)) {
            $this->error("Dataset file not found at: {$filePath}");
            return Command::FAILURE;
        }

        $jsonContent = File::get($filePath);
        $schools = json_decode($jsonContent, true);

        if (!is_array($schools)) {
            $this->error("Invalid JSON content in dataset file.");
            return Command::FAILURE;
        }

        $this->info("Importing " . count($schools) . " official school records into database...");

        $imported = 0;
        foreach ($schools as $item) {
            if (empty($item['npsn']) || empty($item['name'])) {
                continue;
            }

            School::updateOrCreate(
                ['npsn' => (string) $item['npsn']],
                [
                    'name' => $item['name'],
                    'jenjang' => $item['jenjang'] ?? 'SD',
                    'status_sekolah' => $item['status_sekolah'] ?? 'NEGERI',
                    'provinsi' => $item['provinsi'] ?? 'Data belum tersedia',
                    'kabupaten_kota' => $item['kabupaten_kota'] ?? 'Data belum tersedia',
                    'kecamatan' => $item['kecamatan'] ?? 'Data belum tersedia',
                    'alamat' => $item['alamat'] ?? null,
                    'latitude' => $item['latitude'] ?? null,
                    'longitude' => $item['longitude'] ?? null,
                    'jumlah_siswa' => isset($item['jumlah_siswa']) ? (int) $item['jumlah_siswa'] : null,
                    'jumlah_guru' => isset($item['jumlah_guru']) ? (int) $item['jumlah_guru'] : null,
                    'fasilitas' => $item['fasilitas'] ?? null,
                    'is_3t' => (bool) ($item['is_3t'] ?? false),
                    'status_3t_detail' => $item['status_3t_detail'] ?? null,
                    'data_source' => $item['data_source'] ?? 'Data Induk Pendidikan Kemendikdasmen',
                    'source_url' => $item['source_url'] ?? 'https://data.kemendikdasmen.go.id/data-induk',
                ]
            );
            $imported++;
        }

        $this->info("Successfully imported {$imported} official schools from dataset.");
        return Command::SUCCESS;
    }
}