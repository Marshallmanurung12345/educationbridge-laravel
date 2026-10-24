<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\AuditLog;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_registration_is_pending_and_does_not_trust_submitted_access_fields(): void
    {
        $school = $this->createSchool();

        $response = $this->postJson('/api/register', [
            'name' => 'Perwakilan Sekolah',
            'email' => 'school@example.test',
            'password' => 'strong-password',
            'role' => 'sekolah',
            'organization_name' => 'SD Contoh',
            'npsn' => $school->npsn,
            'phone' => '081234567890',
            'account_status' => 'verified',
            'school_id' => $school->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.account_status', 'pending_verification')
            ->assertJsonPath('user.school_id', $school->id)
            ->assertJsonMissingPath('user.password');
    }

    public function test_donor_registration_uses_the_existing_donor_role_without_profile_subtypes(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Donatur CSR',
            'email' => 'donor@example.test',
            'password' => 'strong-password',
            'role' => 'individu',
            'donor_type' => 'company',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'individu')
            ->assertJsonPath('user.account_status', 'verified')
            ->assertJsonMissingPath('user.donor_type');
        $this->assertDatabaseHas('users', [
            'email' => 'donor@example.test',
            'role' => 'individu',
        ]);
        $this->assertFalse(Schema::hasColumn('users', 'donor_type'));
    }

    public function test_public_registration_cannot_create_admin_or_company_roles(): void
    {
        foreach (['admin', 'perusahaan', 'pemerintah'] as $role) {
            $this->postJson('/api/register', [
                'name' => 'Invalid Role',
                'email' => "{$role}@example.test",
                'password' => 'strong-password',
                'role' => $role,
            ])->assertUnprocessable();
        }
    }

    public function test_registered_donor_can_log_in_and_logout_revokes_the_token(): void
    {
        $user = $this->createUser('individu', 'donor@example.test');

        $login = $this->postJson('/api/login', [
            'email' => 'DONOR@example.test',
            'password' => 'strong-password',
        ])->assertOk()
            ->assertJsonPath('user.role', 'individu');

        $token = $login->json('token');
        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_school_profile_update_cannot_change_role_or_verify_itself(): void
    {
        $account = $this->createSchoolAccount('99999999');

        $this->actingAs($account, 'sanctum')
            ->putJson('/api/school-account', [
                'name' => 'Kepala Sekolah Baru',
                'email' => 'updated-school@example.test',
                'organization_name' => 'SD Contoh',
                'npsn' => '99999999',
                'phone' => '081234567890',
                'role' => 'admin',
                'account_status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('role', 'sekolah')
            ->assertJsonPath('account_status', 'pending_verification');
    }

    public function test_admin_can_verify_a_school_with_an_official_npsn_and_action_is_audited(): void
    {
        $school = $this->createSchool();
        $account = $this->createSchoolAccount($school->npsn);
        $admin = $this->createUser('admin', 'admin@example.test');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/school-accounts/{$account->id}/status", [
                'status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('account_status', 'verified')
            ->assertJsonPath('school_id', $school->id);

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'school_account_status_changed',
            'subject_id' => $account->id,
        ]);
        $auditLog = AuditLog::query()
            ->where('action', 'school_account_status_changed')
            ->where('subject_id', $account->id)
            ->firstOrFail();
        $this->assertSame('pending_verification', $auditLog->old_values['account_status']);
        $this->assertNull($auditLog->old_values['school_id']);
        $this->assertSame('verified', $auditLog->new_values['account_status']);
        $this->assertSame($school->id, $auditLog->new_values['school_id']);
    }

    public function test_admin_cannot_verify_school_with_unmatched_npsn(): void
    {
        $account = $this->createSchoolAccount('99999999');
        $admin = $this->createUser('admin', 'admin@example.test');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/school-accounts/{$account->id}/status", [
                'status' => 'verified',
            ])
            ->assertUnprocessable();

        $this->assertDatabaseHas('users', [
            'id' => $account->id,
            'account_status' => 'pending_verification',
        ]);
    }

    public function test_non_admin_cannot_list_school_accounts(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/admin/school-accounts')
            ->assertForbidden();
    }

    public function test_admin_dashboard_stats_are_real_and_admin_only(): void
    {
        $school = $this->createSchool();
        $this->createSchoolAccount($school->npsn);
        $verifiedAccount = $this->createSchoolAccount('87654321');
        $verifiedAccount->account_status = 'verified';
        $verifiedAccount->save();
        $owner = $this->createUser('sekolah', 'campaign-owner@example.test');
        Campaign::create([
            'user_id' => $owner->id,
            'school_name' => $school->name,
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Pengajuan menunggu',
            'description' => 'Menunggu tinjauan admin.',
            'target_amount' => 1000000,
            'status' => 'pending',
        ]);
        Campaign::create([
            'user_id' => $owner->id,
            'school_name' => $school->name,
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Kampanye aktif',
            'description' => 'Sudah disetujui.',
            'target_amount' => 1000000,
            'status' => 'verified',
        ]);

        $admin = $this->createUser('admin', 'admin@example.test');
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertOk()
            ->assertExactJson([
                'pendingSchoolAccounts' => 1,
                'pendingCampaigns' => 1,
                'verifiedSchoolAccounts' => 2,
                'activeCampaigns' => 1,
            ]);

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertForbidden();
    }

    public function test_pending_school_cannot_submit_a_campaign(): void
    {
        $school = $this->createSchool();
        $account = $this->createSchoolAccount($school->npsn);

        $this->actingAs($account, 'sanctum')
            ->postJson('/api/campaigns', [
                'category' => 'Fasilitas',
                'title' => 'Perbaikan ruang kelas',
                'description' => 'Atap kelas mengalami kebocoran.',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'target_amount' => 10000000,
                'urgency' => 3,
                'facility_condition' => 3,
                'access_score' => 3,
            ])
            ->assertForbidden();
    }

    public function test_school_dashboard_only_returns_campaigns_owned_by_the_school(): void
    {
        $school = $this->createSchool();
        $account = $this->createSchoolAccount($school->npsn);
        $account->account_status = 'verified';
        $account->school_id = $school->id;
        $account->save();
        $otherSchool = $this->createUser('sekolah', 'other-school@example.test');

        foreach ([
            [$account, 'Pengajuan milik akun'],
            [$otherSchool, 'Pengajuan milik sekolah lain'],
        ] as [$owner, $title]) {
            Campaign::create([
                'user_id' => $owner->id,
                'school_id' => $school->id,
                'school_name' => 'SD Negeri Contoh',
                'location' => 'Papua',
                'category' => 'Fasilitas',
                'title' => $title,
                'description' => 'Detail pengajuan.',
                'target_amount' => 1000000,
                'status' => 'pending',
            ]);
        }

        $this->actingAs($account, 'sanctum')
            ->getJson('/api/my-campaigns')
            ->assertOk()
            ->assertJsonPath('summary.total_campaigns', 1)
            ->assertJsonPath('campaigns.0.title', 'Pengajuan milik akun');

        $this->actingAs($otherSchool, 'sanctum')
            ->getJson('/api/my-campaigns')
            ->assertOk()
            ->assertJsonMissing(['title' => 'Pengajuan milik akun']);
    }

    public function test_non_school_cannot_access_school_dashboard_api(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-campaigns')
            ->assertForbidden();
    }

    public function test_donor_dashboard_returns_only_the_authenticated_users_submissions(): void
    {
        $school = $this->createSchool();
        $donor = $this->createUser('individu', 'donor@example.test');
        $otherDonor = $this->createUser('individu', 'other-donor@example.test');

        foreach ([
            [$donor, 'Pengajuan saya', 'needs_revision'],
            [$otherDonor, 'Pengajuan donatur lain', 'pending'],
        ] as [$owner, $title, $status]) {
            Campaign::create([
                'user_id' => $owner->id,
                'school_id' => $school->id,
                'school_name' => $school->name,
                'location' => 'Papua',
                'category' => 'Fasilitas',
                'title' => $title,
                'description' => 'Detail pengajuan kebutuhan.',
                'verification_note' => $title === 'Pengajuan saya' ? 'Mohon lengkapi rincian.' : null,
                'target_amount' => 1000000,
                'status' => $status,
            ]);
        }

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-submissions')
            ->assertOk()
            ->assertJsonPath('summary.total_submissions', 1)
            ->assertJsonPath('summary.needs_revision', 1)
            ->assertJsonPath('campaigns.data.0.title', 'Pengajuan saya')
            ->assertJsonPath('campaigns.data.0.verification_note', 'Mohon lengkapi rincian.')
            ->assertJsonMissing(['title' => 'Pengajuan donatur lain']);
    }

    public function test_donor_dashboard_summarizes_only_the_authenticated_users_donations(): void
    {
        $school = $this->createSchool();
        $donor = $this->createUser('individu', 'donor@example.test');
        $otherDonor = $this->createUser('individu', 'other-donor@example.test');
        $campaign = Campaign::create([
            'user_id' => $this->createUser('sekolah', 'school-owner@example.test')->id,
            'school_id' => $school->id,
            'school_name' => $school->name,
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Kebutuhan disetujui',
            'description' => 'Kebutuhan yang telah disetujui admin.',
            'target_amount' => 1000000,
            'status' => 'verified',
        ]);
        Donation::create([
            'campaign_id' => $campaign->id,
            'user_id' => $donor->id,
            'donor_name' => $donor->name,
            'donor_type' => 'individu',
            'amount' => 25000,
            'payment_status' => 'success',
        ]);
        Donation::create([
            'campaign_id' => $campaign->id,
            'user_id' => $otherDonor->id,
            'donor_name' => $otherDonor->name,
            'donor_type' => 'individu',
            'amount' => 50000,
        ]);

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/my-donations')
            ->assertOk()
            ->assertJsonPath('total_donated', 25000)
            ->assertJsonPath('total_donation_count', 1)
            ->assertJsonPath('campaigns_supported', 1)
            ->assertJsonCount(1, 'donations');
    }

    public function test_non_donor_cannot_access_donor_submission_api(): void
    {
        $schoolAccount = $this->createSchoolAccount('99999999');

        $this->actingAs($schoolAccount, 'sanctum')
            ->getJson('/api/my-submissions')
            ->assertForbidden();
    }

    public function test_donor_cannot_change_admin_decisions_or_priority_score(): void
    {
        $school = $this->createSchool();
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = Campaign::create([
            'user_id' => $donor->id,
            'school_id' => $school->id,
            'school_name' => $school->name,
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Pengajuan yang perlu diperbaiki',
            'description' => 'Deskripsi awal.',
            'target_amount' => 1000000,
            'status' => 'needs_revision',
        ]);

        $priorityScore = $campaign->priority_score;
        $this->actingAs($donor, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", [
                'status' => 'verified',
                'priority_score' => 100,
            ])
            ->assertOk()
            ->assertJsonPath('status', 'needs_revision')
            ->assertJsonPath('priority_score', $priorityScore);

        $this->assertDatabaseHas('campaigns', [
            'id' => $campaign->id,
            'status' => 'needs_revision',
            'priority_score' => $priorityScore,
        ]);

        $this->actingAs($donor, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", [
                'title' => 'Pengajuan yang sudah diperbaiki',
            ])
            ->assertOk()
            ->assertJsonPath('title', 'Pengajuan yang sudah diperbaiki')
            ->assertJsonPath('status', 'needs_revision');

        $otherDonor = $this->createUser('individu', 'other-donor@example.test');
        $this->actingAs($otherDonor, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", [
                'title' => 'Perubahan tanpa izin',
            ])
            ->assertForbidden();
    }

    public function test_donor_can_submit_a_school_campaign_for_admin_review(): void
    {
        $school = $this->createSchool();
        $donor = $this->createUser('individu', 'donor@example.test');

        $response = $this->actingAs($donor, 'sanctum')
            ->postJson('/api/campaigns', [
                'school_id' => $school->id,
                'category' => 'Fasilitas',
                'title' => 'Perbaikan ruang kelas',
                'description' => 'Atap kelas mengalami kebocoran.',
                'rab_description' => 'Atap dan material perbaikan.',
                'supporting_document' => 'Izin tertulis dari pihak sekolah.',
                'applicant_relationship' => 'Relawan sekolah',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'target_amount' => 10000000,
                'urgency' => 3,
                'facility_condition' => 3,
                'access_score' => 3,
            ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('school_id', $school->id)
            ->assertJsonPath('school_name', $school->name)
            ->assertJsonPath('user_id', $donor->id);
        $this->getJson('/api/campaigns?status=pending')->assertJsonCount(0);
    }

    public function test_school_submission_uses_the_reported_number_of_affected_students(): void
    {
        $school = $this->createSchool();
        $school->jumlah_siswa = 342;
        $school->save();
        $account = $this->createSchoolAccount($school->npsn);
        $account->account_status = 'verified';
        $account->school_id = $school->id;
        $account->save();

        $this->actingAs($account, 'sanctum')
            ->postJson('/api/campaigns', [
                'school_id' => $school->id,
                'category' => 'Fasilitas',
                'title' => 'Perbaikan ruang kelas',
                'description' => 'Atap kelas mengalami kebocoran.',
                'rab_description' => 'Pembelian material.',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'target_amount' => 10000000,
                'student_count' => 28,
                'urgency' => 3,
                'facility_condition' => 2,
                'access_score' => 3,
            ])
            ->assertCreated()
            ->assertJsonPath('student_count', 28)
            ->assertJsonPath('status', 'pending');
    }

    public function test_public_campaign_endpoints_do_not_expose_pending_campaigns(): void
    {
        $owner = $this->createUser('sekolah', 'owner@example.test');
        $campaign = Campaign::create([
            'user_id' => $owner->id,
            'school_name' => 'Sekolah Contoh',
            'location' => 'Kabupaten Contoh',
            'category' => 'Fasilitas',
            'title' => 'Draft tidak publik',
            'description' => 'Masih menunggu persetujuan admin.',
            'target_amount' => 10000000,
            'status' => 'pending',
        ]);

        $this->getJson('/api/campaigns?status=pending')
            ->assertOk()
            ->assertJsonCount(0);
        $this->getJson("/api/campaigns/{$campaign->id}")
            ->assertNotFound();
    }

    public function test_school_search_filters_the_official_dataset_and_limits_results(): void
    {
        $this->createSchool();
        School::create([
            'npsn' => '87654321',
            'name' => 'SMP Negeri Data Contoh',
            'jenjang' => 'SMP',
            'status_sekolah' => 'NEGERI',
            'provinsi' => 'Maluku',
            'kabupaten_kota' => 'Kabupaten Contoh',
            'kecamatan' => 'Kecamatan Contoh',
        ]);

        $this->getJson('/api/schools?q=12345678&jenjang=SD&provinsi=Papua&limit=1')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.npsn', '12345678');
        $this->getJson('/api/schools?q=12345678&provinsi=Maluku')
            ->assertOk()
            ->assertJsonCount(0);
    }

    public function test_public_campaign_and_donation_responses_hide_user_identity(): void
    {
        $school = $this->createSchool();
        $donor = $this->createUser('individu', 'donor@example.test');
        $campaign = Campaign::create([
            'user_id' => $donor->id,
            'school_id' => $school->id,
            'school_name' => $school->name,
            'location' => 'Kabupaten Contoh',
            'category' => 'Fasilitas',
            'title' => 'Kebutuhan sekolah terverifikasi',
            'description' => 'Campaign yang boleh dilihat publik.',
            'target_amount' => 10000000,
            'status' => 'verified',
        ]);
        Donation::create([
            'campaign_id' => $campaign->id,
            'user_id' => $donor->id,
            'donor_name' => 'Nama Donatur Rahasia',
            'donor_type' => 'individu',
            'amount' => 10000,
            'payment_status' => 'success',
            'message' => 'Pesan pribadi',
        ]);

        $this->getJson('/api/campaigns?status=verified')
            ->assertOk()
            ->assertJsonMissingPath('0.user')
            ->assertJsonMissingPath('0.user_id');
        $this->getJson("/api/campaigns/{$campaign->id}")
            ->assertOk()
            ->assertJsonMissingPath('user')
            ->assertJsonMissingPath('user_id');
        $this->getJson("/api/campaigns/{$campaign->id}/donations")
            ->assertOk()
            ->assertJsonPath('0.amount', 10000)
            ->assertJsonMissingPath('0.user_id')
            ->assertJsonMissingPath('0.donor_name')
            ->assertJsonMissingPath('0.message');
    }

    private function createSchool(): School
    {
        return School::create([
            'npsn' => '12345678',
            'name' => 'SD Negeri Contoh',
            'jenjang' => 'SD',
            'status_sekolah' => 'NEGERI',
            'provinsi' => 'Papua',
            'kabupaten_kota' => 'Kabupaten Contoh',
            'kecamatan' => 'Distrik Contoh',
        ]);
    }

    private function createSchoolAccount(string $npsn): User
    {
        return User::create([
            'name' => 'Kepala Sekolah',
            'email' => 'school-' . $npsn . '@example.test',
            'password' => Hash::make('strong-password'),
            'role' => 'sekolah',
            'organization_name' => 'SD Contoh',
            'npsn' => $npsn,
            'account_status' => 'pending_verification',
        ]);
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
