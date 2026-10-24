<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DonationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.midtrans.server_key' => 'SB-TEST-SERVER-KEY']);
    }

    public function test_donation_can_exceed_the_remaining_target_and_closes_the_campaign(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign([
            'target_amount' => 100000,
            'raised_amount' => 90000,
        ]);

        $donation = $this->createDonation($donor, $campaign, 50000);
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

        $donation = $this->createDonation($donor, $campaign, 10000);
        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'raised_amount' => 100000,
            'status' => 'completed',
        ]);

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 10000,
                'payment_method' => 'bank_bca',
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
            'payment_status' => 'success',
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
            'payment_status' => 'success',
            'order_id' => 'legacy-verified-test',
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

    public function test_bank_donation_is_recorded_as_success_and_updates_campaign_total_immediately(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();
        config(['services.midtrans.server_key' => null]);

        $response = $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 25000,
                'payment_method' => 'bank_bca',
            ])
            ->assertCreated()
            ->assertJsonPath('payment_status', 'success')
            ->assertJsonMissingPath('payment_url')
            ->assertJsonPath('donation.payment_method', 'bank_bca')
            ->assertJsonPath('campaign_raised_amount', 25000);

        $donation = Donation::findOrFail($response->json('donation.id'));

        $this->assertDatabaseHas('donations', [
            'id' => $donation->id,
            'payment_status' => 'success',
            'payment_method' => 'bank_bca',
            'amount' => 25000,
        ]);
        $this->assertSame(25000, $campaign->fresh()->raised_amount);

    }

    public function test_invalid_donation_amount_is_rejected_before_creating_a_transaction(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();

        $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", ['amount' => 9999])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('amount');

        $this->assertDatabaseCount('donations', 0);
    }

    public function test_invalid_bank_is_rejected_without_creating_a_donation(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();

        $response = $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => 25000,
                'payment_method' => 'bank_unknown',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_method');

        $this->assertDatabaseCount('donations', 0);
    }

    public function test_donor_cannot_refresh_another_users_payment_status(): void
    {
        $owner = $this->createUser('individu', 'owner@example.test');
        $otherDonor = $this->createUser('individu', 'other@example.test');
        $campaign = $this->createCampaign();
        $donation = $this->createDonation($owner, $campaign, 25000);

        $this->actingAs($otherDonor, 'sanctum')
            ->getJson("/api/my-donations/status/{$donation->order_id}")
            ->assertNotFound();

        $this->assertDatabaseHas('donations', [
            'id' => $donation->id,
            'payment_status' => 'success',
        ]);
    }

    public function test_donor_can_view_their_bank_donation_status_without_gateway_configuration(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();
        $donation = $this->createDonation($donor, $campaign, 25000);
        config(['services.midtrans.server_key' => null]);

        $this->actingAs($donor, 'sanctum')
            ->getJson("/api/my-donations/status/{$donation->order_id}")
            ->assertOk()
            ->assertJsonPath('payment_status', 'success')
            ->assertJsonPath('payment_method', 'bank_bca');
    }

    public function test_failed_midtrans_payment_cannot_become_success_from_a_later_notification(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();
        $donation = $this->createLegacyPendingDonation($donor, $campaign, 25000);

        $this->notifyMidtrans($donation, 'expire')->assertOk();
        $this->notifyMidtrans($donation, 'settlement')->assertOk();

        $this->assertDatabaseHas('donations', [
            'id' => $donation->id,
            'payment_status' => 'failed',
        ]);
        $this->assertSame(0, $campaign->fresh()->raised_amount);
    }

    public function test_midtrans_notification_must_be_signed_and_confirmed_by_status_api(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();
        $donation = $this->createLegacyPendingDonation($donor, $campaign, 25000);
        $payload = $this->notificationPayload($donation, 'settlement');

        $this->postJson('/api/payments/midtrans/notification', array_merge($payload, [
            'signature_key' => str_repeat('0', 128),
        ]))->assertUnauthorized();

        Http::fake([
            'https://api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => $donation->order_id,
                'gross_amount' => '25000.00',
                'status_code' => '200',
                'transaction_status' => 'settlement',
                'payment_type' => 'bank_transfer',
                'transaction_id' => 'provider-transaction-1',
            ]),
        ]);
        $this->postJson('/api/payments/midtrans/notification', $payload)->assertOk();
        $this->postJson('/api/payments/midtrans/notification', $payload)->assertOk();

        $this->assertDatabaseHas('donations', [
            'id' => $donation->id,
            'payment_status' => 'success',
            'payment_method' => 'bank_transfer',
            'midtrans_transaction_id' => 'provider-transaction-1',
        ]);
        $this->assertSame(25000, $campaign->fresh()->raised_amount);
    }

    public function test_donor_totals_include_only_midtrans_confirmed_donations(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = $this->createCampaign();
        foreach (['unverified', 'pending', 'failed', 'success'] as $index => $paymentStatus) {
            Donation::create([
                'campaign_id' => $campaign->id,
                'user_id' => $donor->id,
                'donor_name' => $donor->name,
                'donor_type' => 'individu',
                'amount' => 10000 * ($index + 1),
                'payment_status' => $paymentStatus,
                'order_id' => "test-order-{$index}",
            ]);
        }

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-donations')
            ->assertOk()
            ->assertJsonPath('total_donated', 40000)
            ->assertJsonPath('total_donation_count', 1)
            ->assertJsonPath('campaigns_supported', 1)
            ->assertJsonFragment(['payment_status' => 'success'])
            ->assertJsonFragment(['payment_status' => 'failed'])
            ->assertJsonFragment(['payment_status' => 'pending'])
            ->assertJsonFragment(['payment_status' => 'unverified']);
    }

    private function createDonation(User $donor, Campaign $campaign, int $amount): Donation
    {
        $response = $this->actingAs($donor, 'sanctum')
            ->postJson("/api/campaigns/{$campaign->id}/donations", [
                'amount' => $amount,
                'payment_method' => 'bank_bca',
            ]);
        $response
            ->assertCreated()
            ->assertJsonPath('payment_status', 'success')
            ->assertJsonPath('donation.payment_method', 'bank_bca');

        return Donation::findOrFail($response->json('donation.id'));
    }

    private function createLegacyPendingDonation(User $donor, Campaign $campaign, int $amount): Donation
    {
        return $campaign->donations()->create([
            'user_id' => $donor->id,
            'donor_name' => $donor->name,
            'donor_type' => 'individu',
            'amount' => $amount,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
            'order_id' => 'legacy-pending-' . uniqid(),
        ]);
    }

    private function notifyMidtrans(Donation $donation, string $transactionStatus)
    {
        Http::fake([
            'https://api.sandbox.midtrans.com/v2/*/status' => Http::response([
                'order_id' => $donation->order_id,
                'gross_amount' => number_format((int) $donation->amount, 2, '.', ''),
                'status_code' => '200',
                'transaction_status' => $transactionStatus,
                'fraud_status' => 'accept',
                'payment_type' => 'bank_transfer',
                'transaction_id' => 'provider-transaction-1',
            ]),
        ]);

        return $this->postJson(
            '/api/payments/midtrans/notification',
            $this->notificationPayload($donation, $transactionStatus),
        );
    }

    private function notificationPayload(Donation $donation, string $transactionStatus): array
    {
        $statusCode = '200';
        $grossAmount = number_format((int) $donation->amount, 2, '.', '');

        return [
            'order_id' => $donation->order_id,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => $transactionStatus,
            'signature_key' => hash(
                'sha512',
                $donation->order_id . $statusCode . $grossAmount . 'SB-TEST-SERVER-KEY',
            ),
        ];
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
