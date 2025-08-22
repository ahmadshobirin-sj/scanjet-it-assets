<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat 9 user random
        User::factory(9)->create();

        // Buat 1 user admin khusus
        $user = User::factory()->create([
            'name' => 'Administrator',
            'email' => env('EMAIL_ADMINISTRATOR'),
        ]);

        // Ambil role SUPER_ADMIN
        $role = Role::where('name', UserRole::SUPER_ADMIN->value)
            ->where('guard_name', config('auth.defaults.guard', 'web'))
            ->first();

        // Assign role
        if ($role && $user) {
            $user->assignRole($role);
        }
    }
}
