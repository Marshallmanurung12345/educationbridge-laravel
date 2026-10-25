<?php

namespace App\Console\Commands;

use App\Models\School;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportOfficialSchools extends Command
{
    private const CSV_FIELD_ALIASES = [
        'npsn' => ['npsn', 'nomor pokok sekolah nasional'],
        'name' => ['nama satuan pendidikan', 'nama sekolah', 'nama'],
        'jenjang' => ['bentuk pendidikan', 'jenjang', 'tingkat pendidikan'],
        'status_sekolah' => ['status satuan pendidikan', 'status sekolah', 'status'],
        'provinsi' => ['provinsi', 'propinsi'],
        'kabupaten_kota' => ['kabupaten kota', 'kabupaten/kota', 'kab kota', 'kabupaten', 'kota'],
        'kecamatan' => ['kecamatan'],
        'desa_kelurahan' => ['desa kelurahan', 'desa/kelurahan', 'desa', 'kelurahan'],
        'alamat' => ['alamat satuan pendidikan', 'alamat'],
        'latitude' => ['latitude', 'lintang', 'garis lintang'],
        'longitude' => ['longitude', 'bujur', 'garis bujur'],
        'jumlah_siswa' => ['jumlah peserta didik', 'jumlah siswa'],
        'jumlah_guru' => ['jumlah pendidik dan tenaga kependidikan', 'jumlah guru'],
    ];

    protected $signature = 'import:official-schools {file? : Path to official schools JSON or CSV dataset}';

    protected $description = 'Import the official Kemendikdasmen school dataset from JSON or CSV';

    public function handle()
    {
        $filePath = $this->argument('file') ?: database_path('data/official_schools.json');

        if (! File::exists($filePath)) {
            $this->error("Dataset file not found at: {$filePath}");

            return Command::FAILURE;
        }

        if (strtolower(File::extension($filePath)) === 'csv') {
            return $this->importCsv($filePath);
        }

        return $this->importJson($filePath);
    }

    private function importJson(string $filePath): int
    {
        $jsonContent = File::get($filePath);
        $schools = json_decode($jsonContent, true);

        if (! is_array($schools)) {
            $this->error('Invalid JSON content in dataset file.');

            return Command::FAILURE;
        }

        $this->info('Importing '.count($schools).' official school records into database...');

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
                    'desa_kelurahan' => $item['desa_kelurahan']
                        ?? $item['desa']
                        ?? $item['kelurahan']
                        ?? null,
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

    private function importCsv(string $filePath): int
    {
        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            $this->error("Unable to open CSV dataset at: {$filePath}");

            return Command::FAILURE;
        }

        $firstLine = fgets($handle);
        if ($firstLine === false) {
            fclose($handle);
            $this->error('CSV dataset is empty.');

            return Command::FAILURE;
        }

        $firstLine = (string) preg_replace('/^\xEF\xBB\xBF/', '', $firstLine);
        $separatorDirective = preg_match('/^\s*sep=(.)\s*$/i', trim($firstLine), $separatorMatch) === 1;
        $delimiter = $separatorDirective
            ? $separatorMatch[1]
            : (substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',');
        if (! $separatorDirective) {
            rewind($handle);
        }
        $headers = fgetcsv($handle, null, $delimiter, '"', '\\');
        if (! is_array($headers)) {
            fclose($handle);
            $this->error('Unable to read the CSV header row.');

            return Command::FAILURE;
        }

        $headerMap = $this->mapCsvHeaders($headers);
        foreach (['npsn', 'name', 'jenjang', 'provinsi', 'kabupaten_kota'] as $required) {
            if (! isset($headerMap[$required])) {
                fclose($handle);
                $this->error("CSV is missing a required column for '{$required}'. Check the official export headers.");

                return Command::FAILURE;
            }
        }

        $optionalFields = array_intersect(
            ['status_sekolah', 'kecamatan', 'desa_kelurahan', 'alamat', 'latitude', 'longitude', 'jumlah_siswa', 'jumlah_guru'],
            array_keys($headerMap),
        );
        $updateColumns = array_values(array_unique([
            'name',
            'jenjang',
            'provinsi',
            'kabupaten_kota',
            ...$optionalFields,
            'data_source',
            'source_url',
            'updated_at',
        ]));

        $this->info('Importing official school CSV dataset...');
        $batch = [];
        $imported = 0;
        $skipped = 0;
        $now = now();

        while (($values = fgetcsv($handle, null, $delimiter, '"', '\\')) !== false) {
            if ($values === [null] || $values === []) {
                continue;
            }

            $row = [];
            foreach ($headerMap as $field => $index) {
                $row[$field] = trim((string) ($values[$index] ?? ''));
            }

            if (
                ($row['npsn'] ?? '') === ''
                || ($row['name'] ?? '') === ''
                || ($row['jenjang'] ?? '') === ''
                || ($row['provinsi'] ?? '') === ''
                || ($row['kabupaten_kota'] ?? '') === ''
            ) {
                $skipped++;

                continue;
            }

            $batch[] = $this->csvSchoolRecord($row, $now);
            if (count($batch) >= 40) {
                DB::table('schools')->upsert($batch, ['npsn'], $updateColumns);
                $imported += count($batch);
                $batch = [];
            }
        }

        fclose($handle);

        if ($batch !== []) {
            DB::table('schools')->upsert($batch, ['npsn'], $updateColumns);
            $imported += count($batch);
        }

        if ($imported === 0) {
            $this->error('No valid school records were imported. Verify the CSV data and headers.');

            return Command::FAILURE;
        }

        $this->info("Successfully imported {$imported} schools. Skipped {$skipped} rows with missing required values.");
        $this->warn('Schools absent from this CSV were not deleted. Existing 3T classifications were preserved.');

        return Command::SUCCESS;
    }

    private function mapCsvHeaders(array $headers): array
    {
        $normalized = [];
        foreach ($headers as $index => $header) {
            $name = preg_replace('/^\xEF\xBB\xBF/', '', (string) $header);
            $name = mb_strtolower(trim($name));
            $name = trim((string) preg_replace('/[^a-z0-9]+/u', ' ', $name));
            $normalized[$name] = $index;
        }

        $map = [];
        foreach (self::CSV_FIELD_ALIASES as $field => $aliases) {
            foreach ($aliases as $alias) {
                $alias = trim((string) preg_replace('/[^a-z0-9]+/u', ' ', mb_strtolower($alias)));
                if (isset($normalized[$alias])) {
                    $map[$field] = $normalized[$alias];
                    break;
                }
            }
        }

        return $map;
    }

    private function csvSchoolRecord(array $row, mixed $now): array
    {
        $record = [
            'npsn' => $row['npsn'],
            'name' => $row['name'],
            'jenjang' => $row['jenjang'],
            'status_sekolah' => $row['status_sekolah'] ?? 'Data tidak tersedia',
            'provinsi' => $row['provinsi'],
            'kabupaten_kota' => $row['kabupaten_kota'],
            'kecamatan' => $row['kecamatan'] ?? 'Data tidak tersedia',
            'desa_kelurahan' => $row['desa_kelurahan'] ?? null,
            'alamat' => $row['alamat'] ?? null,
            'latitude' => $this->nullableNumber($row['latitude'] ?? null),
            'longitude' => $this->nullableNumber($row['longitude'] ?? null),
            'jumlah_siswa' => $this->nullableInteger($row['jumlah_siswa'] ?? null),
            'jumlah_guru' => $this->nullableInteger($row['jumlah_guru'] ?? null),
            'fasilitas' => null,
            'is_3t' => false,
            'status_3t_detail' => null,
            'data_source' => 'Data Induk Pendidikan Kemendikdasmen',
            'source_url' => 'https://data.kemendikdasmen.go.id/data-induk',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        return $record;
    }

    private function nullableNumber(?string $value): ?float
    {
        return $value !== null && $value !== '' && is_numeric($value) ? (float) $value : null;
    }

    private function nullableInteger(?string $value): ?int
    {
        return $value !== null && $value !== '' && is_numeric($value) ? (int) $value : null;
    }
}
