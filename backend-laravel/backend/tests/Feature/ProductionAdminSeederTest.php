<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ProductionAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class ProductionAdminSeederTest extends TestCase
{
    use RefreshDatabase;

    private array $previousEnvironment = [];

    public function test_production_seeder_creates_admin_from_secret_environment_values(): void
    {
        $this->withAdminEnvironment('Competition Admin', 'admin@example.test', 'a-long-random-password-123');

        try {
            $this->seed(ProductionAdminSeeder::class);
        } finally {
            $this->clearAdminEnvironment();
        }

        $admin = User::query()->where('email', 'admin@example.test')->firstOrFail();
        $this->assertSame('admin', $admin->role);
        $this->assertNotSame('a-long-random-password-123', $admin->password);
        $this->assertTrue(password_verify('a-long-random-password-123', $admin->password));
    }

    public function test_production_seeder_rejects_missing_or_short_admin_password(): void
    {
        $this->withAdminEnvironment('Competition Admin', 'admin@example.test', 'weak');

        try {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('ADMIN_PASSWORD of at least 16 characters');
            $this->seed(ProductionAdminSeeder::class);
        } finally {
            $this->clearAdminEnvironment();
        }
    }

    private function withAdminEnvironment(string $name, string $email, string $password): void
    {
        foreach (['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as $key) {
            $this->previousEnvironment[$key] = [
                getenv($key),
                $_ENV[$key] ?? null,
                $_SERVER[$key] ?? null,
            ];
        }

        putenv("ADMIN_NAME={$name}");
        putenv("ADMIN_EMAIL={$email}");
        putenv("ADMIN_PASSWORD={$password}");
        $_ENV['ADMIN_NAME'] = $name;
        $_ENV['ADMIN_EMAIL'] = $email;
        $_ENV['ADMIN_PASSWORD'] = $password;
    }

    private function clearAdminEnvironment(): void
    {
        foreach (['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as $key) {
            [$processValue, $environmentValue, $serverValue] = $this->previousEnvironment[$key];
            putenv($processValue === false ? $key : "{$key}={$processValue}");

            if ($environmentValue === null) {
                unset($_ENV[$key]);
            } else {
                $_ENV[$key] = $environmentValue;
            }

            if ($serverValue === null) {
                unset($_SERVER[$key]);
            } else {
                $_SERVER[$key] = $serverValue;
            }
        }
    }
}
