<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Donation;
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
