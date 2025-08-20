<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->name(),
            'email' => fake()->unique()->safeEmail(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($user) {
            $role = Role::firstOrCreate(['name' => UserRole::INACTIVE->value]);
            $user->assignRole($role);
        });
    }

    // state untuk super admin
    public function superAdmin()
    {
        return $this->afterCreating(function ($user) {
            $role = Role::firstOrCreate(['name' => UserRole::SUPER_ADMIN->value]);
            $user->assignRole($role);
        });
    }

    // state untuk admin
    public function admin()
    {
        return $this->afterCreating(function ($user) {
            $role = Role::firstOrCreate(['name' => UserRole::ADMIN->value]);
            $user->assignRole($role);
        });
    }
}
