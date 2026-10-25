<?php

namespace Tests\Feature;

use App\Models\School;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_search_can_be_filtered_by_jenjang_province_and_city(): void
    {
        School::create($this->schoolData([
            'name' => 'SD Contoh A',
            'npsn' => '10000001',
            'jenjang' => 'SD',
            'provinsi' => 'Papua Pegunungan',
            'kabupaten_kota' => 'Kab. Jayawijaya',
        ]));
        School::create($this->schoolData([
            'name' => 'SD Contoh B',
            'npsn' => '10000002',
            'jenjang' => 'SD',
            'provinsi' => 'Papua Pegunungan',
            'kabupaten_kota' => 'Kab. Yalimo',
        ]));

        $this->getJson('/api/schools?jenjang=SD&provinsi=Papua%20Pegunungan&kabupaten_kota=Kab.%20Jayawijaya')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.npsn', '10000001');
    }

    public function test_csv_import_upserts_school_records_and_preserves_existing_three_t_status(): void
    {
        $existing = School::create($this->schoolData([
            'name' => 'Nama Lama',
            'npsn' => '10000001',
            'is_3t' => true,
            'status_3t_detail' => 'Status hasil verifikasi sebelumnya',
        ]));

        $filePath = $this->temporaryCsv(
            "NPSN,Nama Satuan Pendidikan,Bentuk Pendidikan,Status Satuan Pendidikan,Provinsi,Kabupaten/Kota,Kecamatan\n"
            ."10000001,SD Contoh D,SD,Negeri,Papua Pegunungan,Kab. Jayawijaya,Wamena\n"
            ."10000002,SMP Contoh E,SMP,Negeri,Maluku Utara,Kab. Kepulauan Sula,Sanana\n",
        );

        try {
            $this->artisan('import:official-schools', ['file' => $filePath])
                ->assertExitCode(0);
        } finally {
            @unlink($filePath);
        }

        $this->assertDatabaseCount('schools', 2);
        $existing->refresh();
        $this->assertSame('SD Contoh D', $existing->name);
        $this->assertTrue($existing->is_3t);
        $this->assertSame('Status hasil verifikasi sebelumnya', $existing->status_3t_detail);
        $this->assertDatabaseHas('schools', [
            'npsn' => '10000002',
            'name' => 'SMP Contoh E',
            'data_source' => 'Data Induk Pendidikan Kemendikdasmen',
        ]);
    }

    public function test_csv_import_fails_clearly_when_required_headers_are_missing(): void
    {
        $filePath = $this->temporaryCsv("NPSN,Nama Sekolah\n10000001,SD Contoh\n");

        try {
            $this->artisan('import:official-schools', ['file' => $filePath])
                ->expectsOutputToContain("CSV is missing a required column for 'jenjang'.")
                ->assertExitCode(1);
        } finally {
            @unlink($filePath);
        }
    }

    public function test_csv_import_accepts_excel_separator_directive_and_utf8_bom(): void
    {
        $filePath = $this->temporaryCsv(
            "\xEF\xBB\xBFsep=;\n"
            ."NPSN;Nama Satuan Pendidikan;Bentuk Pendidikan;Status;Provinsi;Kabupaten/Kota\n"
            ."10000001;SD Contoh;SD;Negeri;Papua Pegunungan;Kab. Jayawijaya\n",
        );

        try {
            $this->artisan('import:official-schools', ['file' => $filePath])
                ->assertExitCode(0);
        } finally {
            @unlink($filePath);
        }

        $this->assertDatabaseHas('schools', [
            'npsn' => '10000001',
            'name' => 'SD Contoh',
            'provinsi' => 'Papua Pegunungan',
            'kabupaten_kota' => 'Kab. Jayawijaya',
        ]);
    }

    private function temporaryCsv(string $contents): string
    {
        $temporaryPath = tempnam(sys_get_temp_dir(), 'educationbridge-schools-');
        $csvPath = $temporaryPath.'.csv';
        rename($temporaryPath, $csvPath);
        file_put_contents($csvPath, $contents);

        return $csvPath;
    }

    private function schoolData(array $overrides = []): array
    {
        return array_merge([
            'npsn' => '10000000',
            'name' => 'SD Contoh',
            'jenjang' => 'SD',
            'status_sekolah' => 'NEGERI',
            'provinsi' => 'Papua Pegunungan',
            'kabupaten_kota' => 'Kab. Jayawijaya',
            'kecamatan' => 'Wamena',
            'is_3t' => false,
        ], $overrides);
    }
}
