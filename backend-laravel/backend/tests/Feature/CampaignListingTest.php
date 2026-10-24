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

    public function test_public_listing_orders_campaigns_by_calculated_priority_score(): void
    {
        $lowerPriority = $this->createCampaign([
            'urgency' => 1,
            'facility_condition' => 5,
            'remoteness' => 1,
            'student_count' => 0,
            'access_score' => 5,
        ]);
        $higherPriority = $this->createCampaign([
            'urgency' => 5,
            'facility_condition' => 1,
            'remoteness' => 5,
            'student_count' => 1000,
            'access_score' => 1,
        ]);

        $this->getJson('/api/campaigns')
            ->assertOk()
            ->assertJsonPath('0.id', $higherPriority->id)
            ->assertJsonPath('0.priority_score', 100)
            ->assertJsonPath('1.id', $lowerPriority->id)
            ->assertJsonPath('1.priority_score', 16);
    }

    public function test_editing_priority_inputs_recalculates_score_and_rejects_invalid_values(): void
    {
        $campaign = $this->createCampaign([
            'status' => 'needs_revision',
            'urgency' => 1,
            'facility_condition' => 5,
            'remoteness' => 1,
            'student_count' => 0,
            'access_score' => 5,
        ]);
        $owner = $campaign->user;

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", [
                'urgency' => 5,
                'facility_condition' => 1,
                'remoteness' => 5,
                'student_count' => 1000,
                'access_score' => 1,
                'priority_score' => 0,
            ])
            ->assertOk()
            ->assertJsonPath('priority_score', 100);

        $this->actingAs($owner, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", ['urgency' => 6])
            ->assertUnprocessable();

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'priority_score' => 100,
            'urgency' => 5,
        ]);
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        $ownerNumber = User::count() + 1;
        $owner = User::create([
            'name' => 'Sekolah',
            'email' => "school{$ownerNumber}@example.test",
            'password' => Hash::make('strong-password'),
            'role' => 'individu',
        ]);

        return Campaign::create(array_merge([
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
            'urgency' => 3,
            'facility_condition' => 3,
            'remoteness' => 3,
            'student_count' => 0,
            'access_score' => 3,
        ], $overrides));
    }
}
