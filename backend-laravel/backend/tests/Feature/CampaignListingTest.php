<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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

    public function test_campaign_progress_preserves_one_decimal_for_small_percentages(): void
    {
        $campaign = $this->createCampaign([
            'target_amount' => 60000000,
            'raised_amount' => 250000,
        ]);

        $this->getJson('/api/campaigns')
            ->assertOk()
            ->assertJsonPath('0.id', $campaign->id)
            ->assertJsonPath('0.progress_percent', 0.4);
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

    public function test_uploaded_campaign_images_are_private_and_proof_is_admin_only(): void
    {
        Storage::fake('local');
        $imagePath = 'campaign-uploads/'.str_repeat('a', 40).'.jpg';
        $proofPath = 'campaign-uploads/'.str_repeat('b', 40).'.png';
        Storage::disk('local')->put($imagePath, 'photo');
        Storage::disk('local')->put($proofPath, 'proof');
        $campaign = $this->createCampaign([
            'image_url' => $imagePath,
            'supporting_document' => $proofPath,
        ]);

        $this->getJson('/api/campaigns')
            ->assertOk()
            ->assertJsonMissingPath('0.supporting_document');
        $this->get("/api/campaigns/{$campaign->id}/photo")->assertOk();
        $this->getJson("/api/admin/campaigns/{$campaign->id}/proof")->assertUnauthorized();
        $this->actingAs($campaign->user, 'sanctum')
            ->getJson("/api/admin/campaigns/{$campaign->id}/proof")
            ->assertForbidden();

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'campaign-admin@example.test',
            'password' => Hash::make('strong-password'),
            'role' => 'admin',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->get("/api/admin/campaigns/{$campaign->id}/proof")
            ->assertOk();
    }

    public function test_campaign_submission_accepts_only_supported_image_uploads(): void
    {
        Storage::fake('local');
        $owner = User::create([
            'name' => 'Donatur',
            'email' => 'upload-donor@example.test',
            'password' => Hash::make('strong-password'),
            'role' => 'individu',
        ]);
        $payload = [
            'school_npsn' => '12345678',
            'school_jenjang' => 'SD',
            'school_name' => 'SD Contoh',
            'location' => 'Bandung, Jawa Barat',
            'category' => 'Fasilitas',
            'title' => 'Perbaikan ruang kelas',
            'description' => 'Atap kelas perlu diperbaiki.',
            'rab_description' => 'Bahan bangunan dan upah.',
            'applicant_relationship' => 'Alumni',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'target_amount' => 100000,
            'student_count' => 20,
            'urgency' => 3,
            'facility_condition' => 3,
            'remoteness' => 3,
            'access_score' => 3,
            'image_file' => UploadedFile::fake()->image('condition.webp'),
            'supporting_document_file' => UploadedFile::fake()->image('proof.jpg'),
        ];

        $response = $this->actingAs($owner, 'sanctum')
            ->post('/api/campaigns', $payload)
            ->assertCreated();
        $campaign = Campaign::findOrFail($response->json('id'));

        $this->assertStringStartsWith('campaign-uploads/', $campaign->getRawOriginal('image_url'));
        $this->assertStringStartsWith('campaign-uploads/', $campaign->getRawOriginal('supporting_document'));
        Storage::disk('local')->assertExists($campaign->getRawOriginal('image_url'));
        Storage::disk('local')->assertExists($campaign->getRawOriginal('supporting_document'));

        $payload['title'] = 'Unggahan dengan format yang ditolak';
        $payload['image_file'] = UploadedFile::fake()->create('condition.gif', 50, 'image/gif');
        $payload['supporting_document_file'] = UploadedFile::fake()->create('proof.pdf', 50, 'application/pdf');

        $this->actingAs($owner, 'sanctum')
            ->post('/api/campaigns', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image_file', 'supporting_document_file']);
    }

    public function test_editing_campaign_replaces_uploaded_photo_without_removing_the_existing_proof(): void
    {
        Storage::fake('local');
        $oldImage = 'campaign-uploads/'.str_repeat('c', 40).'.jpg';
        $proof = 'campaign-uploads/'.str_repeat('d', 40).'.png';
        Storage::disk('local')->put($oldImage, 'old photo');
        Storage::disk('local')->put($proof, 'proof');
        $campaign = $this->createCampaign([
            'status' => 'needs_revision',
            'image_url' => $oldImage,
            'supporting_document' => $proof,
        ]);

        $this->actingAs($campaign->user, 'sanctum')
            ->post("/api/campaigns/{$campaign->id}", [
                '_method' => 'PUT',
                'title' => 'Judul diperbarui',
                'image_file' => UploadedFile::fake()->image('replacement.jpg'),
            ])
            ->assertOk()
            ->assertJsonPath('title', 'Judul diperbarui');

        $campaign->refresh();
        $this->assertNotSame($oldImage, $campaign->getRawOriginal('image_url'));
        $this->assertSame($proof, $campaign->getRawOriginal('supporting_document'));
        Storage::disk('local')->assertMissing($oldImage);
        Storage::disk('local')->assertExists($campaign->getRawOriginal('image_url'));
        Storage::disk('local')->assertExists($proof);
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
