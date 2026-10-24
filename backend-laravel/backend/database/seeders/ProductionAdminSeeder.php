<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class ProductionAdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = trim((string) env('ADMIN_NAME'));
        $email = strtolower(trim((string) env('ADMIN_EMAIL')));
        $password = (string) env('ADMIN_PASSWORD');

        $validator = Validator::make(
            ['name' => $name, 'email' => $email, 'password' => $password],
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'password' => ['required', 'string', 'min:16'],
            ],
        );

        if ($validator->fails()) {
            throw new RuntimeException(
                'Set valid ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 16 characters.',
            );
        }

        $existing = User::query()->where('email', $email)->first();
        if ($existing) {
            if ($existing->role !== 'admin') {
                throw new RuntimeException('ADMIN_EMAIL already belongs to a non-admin account.');
            }

            return;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);
    }
}
