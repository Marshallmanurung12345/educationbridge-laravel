<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_review_reports_and_delete_one_with_an_audit_entry(): void
    {
        $admin = $this->createUser('admin', 'admin@example.test');
        $report = $this->createReport();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/reports')
            ->assertOk()
            ->assertJsonPath('0.id', $report->id)
            ->assertJsonPath('0.title', $report->title)
            ->assertJsonPath('0.campaign.title', $report->campaign->title);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/reports/{$report->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('reports', ['id' => $report->id]);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'report_deleted',
            'subject_type' => Report::class,
            'subject_id' => $report->id,
        ]);
    }

    public function test_non_admin_cannot_view_or_delete_reports(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $report = $this->createReport();

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/admin/reports')
            ->assertForbidden();

        $this->actingAs($donor, 'sanctum')
            ->deleteJson("/api/admin/reports/{$report->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('reports', ['id' => $report->id]);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    private function createReport(): Report
    {
        $owner = $this->createUser('sekolah', 'school@example.test');
        $campaign = Campaign::create([
            'user_id' => $owner->id,
            'school_name' => 'SD Negeri Contoh',
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Perbaikan ruang kelas',
            'description' => 'Perbaikan atap ruang kelas.',
            'target_amount' => 100000,
            'raised_amount' => 100000,
            'status' => 'completed',
        ]);

        return Report::create([
            'campaign_id' => $campaign->id,
            'title' => 'Atap telah diperbaiki',
            'narrative' => 'Pekerjaan selesai.',
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
