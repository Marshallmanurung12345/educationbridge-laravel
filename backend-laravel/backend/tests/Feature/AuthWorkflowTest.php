<?php

namespace Tests\Feature;

use App\Models\Campaign;
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
