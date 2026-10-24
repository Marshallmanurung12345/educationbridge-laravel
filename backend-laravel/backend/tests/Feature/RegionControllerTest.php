<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RegionControllerTest extends TestCase
{
    public function test_it_returns_provinces_from_wilayah_id(): void
    {
        Http::fake([
            'https://wilayah.id/api/provinces.json' => Http::response([
                'data' => [['code' => '11', 'name' => 'Aceh']],
            ]),
        ]);

        $this->getJson('/api/regions/provinces')
            ->assertOk()
            ->assertJsonPath('data.0.code', '11')
            ->assertJsonPath('data.0.name', 'Aceh');

        Http::assertSent(fn ($request) => $request->url() === 'https://wilayah.id/api/provinces.json');
    }

    public function test_it_requests_child_regions_with_the_parent_code(): void
    {
        Http::fake([
            'https://wilayah.id/api/regencies/11.json' => Http::response([
                'data' => [['code' => '11.01', 'name' => 'Kabupaten Simeulue']],
            ]),
        ]);

        $this->getJson('/api/regions/regencies/11')
            ->assertOk()
            ->assertJsonPath('data.0.code', '11.01');
    }

    public function test_it_rejects_invalid_levels_and_parent_codes(): void
    {
        $this->getJson('/api/regions/countries')->assertNotFound();
        $this->getJson('/api/regions/regencies/not-a-code')->assertUnprocessable();

        Http::assertNothingSent();
    }

    public function test_it_reports_upstream_connection_failures(): void
    {
        Http::fake(fn () => throw new ConnectionException('Connection failed.'));

        $this->getJson('/api/regions/provinces')
            ->assertStatus(502)
            ->assertJsonPath(
                'message',
                'Layanan data wilayah sedang tidak dapat dihubungi. Coba lagi sebentar.',
            );
    }
}
