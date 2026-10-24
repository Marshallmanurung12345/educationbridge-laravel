<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class NotificationAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_see_personal_and_role_notifications_only(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $otherDonor = $this->createUser('individu', 'other@example.test');
        $own = $this->createNotification(['user_id' => $donor->id]);
        $broadcast = $this->createNotification(['target_role' => 'individu']);
        $other = $this->createNotification(['user_id' => $otherDonor->id]);
        $adminBroadcast = $this->createNotification(['target_role' => 'admin']);

        $this->actingAs($donor, 'sanctum')
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $own->id])
            ->assertJsonFragment(['id' => $broadcast->id])
            ->assertJsonMissing(['id' => $other->id])
            ->assertJsonMissing(['id' => $adminBroadcast->id]);
    }

    public function test_users_cannot_mark_another_users_notification_read(): void
    {
        $donor = $this->createUser('individu', 'donor@example.test');
        $notification = $this->createNotification([
            'user_id' => $this->createUser('individu', 'other@example.test')->id,
        ]);

        $this->actingAs($donor, 'sanctum')
            ->putJson("/api/notifications/{$notification->id}/read")
            ->assertNotFound();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => false,
        ]);
    }

    private function createNotification(array $values): Notification
    {
        return Notification::create(array_merge([
            'type' => 'test',
            'title' => 'Test notification',
            'message' => 'Notification content',
            'is_read' => false,
        ], $values));
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
