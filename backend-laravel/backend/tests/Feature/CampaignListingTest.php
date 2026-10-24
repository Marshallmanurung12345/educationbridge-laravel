<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CampaignListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_summary_listing_omits_fields_not_used_by_campaign_cards(): void
    {
        $campaign = $this->createCampaign();

        $this->getJson('/api/campaigns?summary=1')
            ->assertOk()
            ->assertJsonPath('0.id', $campaign->id)
            ->assertJsonPath('0.title', $campaign->title)
            ->assertJsonMissingPath('0.description')
            ->assertJsonMissingPath('0.rab_description')
            ->assertJsonMissingPath('0.supporting_document');
    }

    public function test_regular_listing_keeps_full_campaign_details(): void
    {
        $campaign = $this->createCampaign();

        $this->getJson('/api/campaigns')
            ->assertOk()
            ->assertJsonPath('0.id', $campaign->id)
            ->assertJsonPath('0.description', $campaign->description);
    }

    public function test_summary_matching_keeps_card_data_without_campaign_details(): void
    {
        $campaign = $this->createCampaign();

        $this->getJson('/api/match?focus=3t&summary=1')
            ->assertOk()
            ->assertJsonPath('0.id', $campaign->id)
            ->assertJsonPath('0.title', $campaign->title)
            ->assertJsonPath('0.match_score', 0)
            ->assertJsonMissingPath('0.description');
    }

    private function createCampaign(): Campaign
    {
        $owner = User::create([
            'name' => 'Sekolah',
            'email' => 'school@example.test',
            'password' => Hash::make('strong-password'),
            'role' => 'sekolah',
        ]);

        return Campaign::create([
            'user_id' => $owner->id,
            'school_name' => 'SD Negeri Contoh',
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Perbaikan ruang kelas',
            'description' => 'Perbaikan atap ruang kelas.',
            'rab_description' => 'Bahan bangunan',
            'supporting_document' => 'document.pdf',
            'target_amount' => 100000,
            'raised_amount' => 0,
            'status' => 'verified',
        ]);
    }
}
