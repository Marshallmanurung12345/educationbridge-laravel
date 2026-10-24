<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_and_paginate_actual_audit_records(): void
    {
        $admin = $this->createUser('admin', 'Admin Audit');
        $otherAdmin = $this->createUser('admin', 'Admin Lain');
        foreach (range(1, 21) as $number) {
            AuditLog::create([
                'actor_id' => $number === 1 ? $otherAdmin->id : $admin->id,
                'action' => $number === 1 ? 'report_deleted' : 'campaign_approved',
                'subject_type' => Campaign::class,
                'subject_id' => $number,
                'old_values' => ['status' => 'pending'],
                'new_values' => ['status' => 'verified'],
                'created_at' => now()->subDays(21 - $number),
            ]);
        }

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/audit-logs?actor=' . $admin->id . '&action=campaign_approved&from=' . now()->subDays(10)->toDateString())
            ->assertOk()
            ->assertJsonPath('meta.total', 11)
            ->assertJsonPath('meta.per_page', 20)
            ->assertJsonCount(11, 'data')
            ->assertJsonPath('data.0.action', 'campaign_approved');

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/audit-logs?per_page=10')
            ->assertOk()
            ->assertJsonPath('meta.total', 21)
            ->assertJsonPath('meta.last_page', 3)
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure(['filters' => ['actions', 'actors']]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/audit-logs?search=Admin%20Lain')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.actor.name', 'Admin Lain');
    }

    public function test_non_admin_cannot_read_audit_records_and_logs_have_no_mutation_route(): void
    {
        $donor = $this->createUser('individu', 'Donatur');

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/admin/audit-logs')
            ->assertForbidden();

        $admin = $this->createUser('admin', 'Admin Audit');
        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/audit-logs/1')
            ->assertNotFound();
    }

    public function test_campaign_moderation_records_real_status_transitions(): void
    {
        $admin = $this->createUser('admin', 'Admin Audit');
        $campaign = $this->createCampaign();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/campaigns/{$campaign->id}", ['status' => 'verified'])
            ->assertOk();
        $this->putJson("/api/campaigns/{$campaign->id}", [
            'status' => 'needs_revision',
            'verification_note' => 'Mohon lengkapi dokumen.',
        ])->assertOk();
        $this->putJson("/api/campaigns/{$campaign->id}", [
            'status' => 'rejected',
            'verification_note' => 'Dokumen tidak sesuai.',
        ])->assertOk();

        $approved = AuditLog::query()->where('action', 'campaign_approved')->firstOrFail();
        $this->assertSame('pending', $approved->old_values['status']);
        $this->assertSame('verified', $approved->new_values['status']);

        $revision = AuditLog::query()->where('action', 'campaign_revision_requested')->firstOrFail();
        $this->assertSame('verified', $revision->old_values['status']);
        $this->assertSame('needs_revision', $revision->new_values['status']);
        $this->assertSame('Mohon lengkapi dokumen.', $revision->new_values['verification_note']);

        $rejected = AuditLog::query()->where('action', 'campaign_rejected')->firstOrFail();
        $this->assertSame('needs_revision', $rejected->old_values['status']);
        $this->assertSame('rejected', $rejected->new_values['status']);
    }

    public function test_priority_score_change_is_audited_with_backend_values(): void
    {
        $admin = $this->createUser('admin', 'Admin Audit');
        $campaign = $this->createCampaign([
            'urgency' => 1,
            'facility_condition' => 5,
            'remoteness' => 1,
            'student_count' => 0,
            'access_score' => 5,
        ]);

        $this->actingAs($admin, 'sanctum')
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

        $log = AuditLog::query()->where('action', 'campaign_priority_updated')->firstOrFail();
        $this->assertSame(16, $log->old_values['priority_score']);
        $this->assertSame(100, $log->new_values['priority_score']);
        $this->assertSame(1, $log->old_values['urgency']);
        $this->assertSame(5, $log->new_values['urgency']);
    }

    public function test_audit_model_redacts_sensitive_values(): void
    {
        $log = AuditLog::create([
            'action' => 'account_updated',
            'old_values' => ['api_token' => 'old-token', 'note' => 'token=old-token'],
            'new_values' => ['note' => 'password=new-password'],
            'note' => 'credential:abc123',
        ]);

        $this->assertSame(['note' => 'token=[REDACTED]'], $log->fresh()->old_values);
        $this->assertSame(['note' => 'password=[REDACTED]'], $log->fresh()->new_values);
        $this->assertSame('credential=[REDACTED]', $log->fresh()->note);
    }

    private function createUser(string $role, string $name): User
    {
        $number = User::count() + 1;

        return User::create([
            'name' => $name,
            'email' => "audit{$number}@example.test",
            'password' => Hash::make('strong-password'),
            'role' => $role,
        ]);
    }

    private function createCampaign(array $overrides = []): Campaign
    {
        $owner = $this->createUser('individu', 'Pemilik Kebutuhan');

        return Campaign::create(array_merge([
            'user_id' => $owner->id,
            'school_name' => 'SD Negeri Contoh',
            'location' => 'Papua',
            'category' => 'Fasilitas',
            'title' => 'Perbaikan ruang kelas',
            'description' => 'Perbaikan atap ruang kelas.',
            'target_amount' => 100000,
            'raised_amount' => 0,
            'status' => 'pending',
            'urgency' => 3,
            'facility_condition' => 3,
            'remoteness' => 3,
            'student_count' => 0,
            'access_score' => 3,
        ], $overrides));
    }
}
