<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DonationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_donation_can_exceed_the_remaining_target_and_closes_the_campaign(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign([
            'target_amount' => 100000,
            'raised_amount' => 90000,
        ]);

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 50000,
                'payment_method' => 'transfer_bank',
            ])
            ->assertCreated()
            ->assertJsonPath('amount', 50000);

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'raised_amount' => 140000,
            'status' => 'completed',
        ]);
        $this->assertDatabaseHas('donations', [
            'campaign_id' => $campaign->id,
            'user_id' => $donor->id,
            'amount' => 50000,
        ]);
    }

    public function test_campaign_that_reaches_its_target_is_closed_and_rejects_future_donations(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign([
            'target_amount' => 100000,
            'raised_amount' => 90000,
        ]);

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 10000,
                'payment_method' => 'e_wallet',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'raised_amount' => 100000,
            'status' => 'completed',
        ]);

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 10000,
                'payment_method' => 'e_wallet',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Kebutuhan ini sudah ditutup untuk donasi.');

        $this->assertDatabaseCount('donations', 1);
    }

    public function test_completed_campaign_donation_history_remains_publicly_available(): void
    {
        $campaign = $this->createCampaign([
            'target_amount' => 100000,
            'raised_amount' => 100000,
            'status' => 'completed',
        ]);
        Donation::create([
            'campaign_id' => $campaign->id,
            'donor_name' => 'Donatur',
            'donor_type' => 'individu',
            'amount' => 100000,
            'payment_method' => 'transfer_bank',
        ]);

        $this->getJson("/api/campaigns/{$campaign->id}/donations")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.amount', 100000);
    }

    public function test_donor_dashboard_can_link_to_reports_for_completed_campaigns(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign([
            'target_amount' => 100000,
            'raised_amount' => 100000,
            'status' => 'completed',
        ]);
        Donation::create([
            'campaign_id' => $campaign->id,
            'user_id' => $donor->id,
            'donor_name' => $donor->name,
            'donor_type' => 'individu',
            'amount' => 100000,
            'payment_method' => 'bank_bca',
        ]);
        Report::create([
            'campaign_id' => $campaign->id,
            'title' => 'Perbaikan ruang kelas',
            'narrative' => 'Atap ruang kelas telah diperbaiki.',
        ]);

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-donations')
            ->assertOk()
            ->assertJsonPath('donations.0.campaign.reports_count', 1)
            ->assertJsonPath('donations.0.campaign.status', 'completed');

        $this->getJson("/api/campaigns/{$campaign->id}")
            ->assertOk()
            ->assertJsonPath('status', 'completed');

        $this->getJson("/api/campaigns/{$campaign->id}/reports")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Perbaikan ruang kelas');
    }

    public function test_donor_dashboard_summaries_are_zero_when_the_account_has_no_activity(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-donations')
            ->assertOk()
            ->assertJsonPath('total_donated', 0)
            ->assertJsonPath('total_donation_count', 0)
            ->assertJsonPath('campaigns_supported', 0)
            ->assertJsonCount(0, 'donations');

        $this->getJson('/api/my-submissions')
            ->assertOk()
            ->assertJsonPath('summary.total_submissions', 0)
            ->assertJsonPath('summary.pending', 0)
            ->assertJsonCount(0, 'campaigns.data');
    }

    public function test_donation_records_selected_bank_name_without_payment_verification(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 25000,
                'payment_method' => 'bank_bca',
            ])
            ->assertCreated()
            ->assertJsonPath('payment_method', 'bank_bca');

        $this->assertDatabaseHas('donations', [
            'campaign_id' => $campaign->id,
            'payment_method' => 'bank_bca',
            'amount' => 25000,
        ]);
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        $owner = $this->createUser('sekolah', 'school@example.test');

        return Campaign::create(array_merge([
            'user_id' => $owner->id,
            'school_name' => 'SD Negeri Contoh',
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Perbaikan ruang kelas',
            'description' => 'Perbaikan atap ruang kelas.',
            'target_amount' => 100000,
            'raised_amount' => 0,
            'status' => 'verified',
        ], $overrides));
    }

    private function createUser(string $role, string $email): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $email,
            'password' => Hash::make('strong-password'),
            'role' => $role,
        ]);
    }
}
