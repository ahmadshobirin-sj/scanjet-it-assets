<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Spatie\Permission\Models\Role;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

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
            'password' => bcrypt('password'), // jangan lupa password default
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($user) {
            // default assign role Inactive
            $role = Role::where('name', UserRole::INACTIVE->value)
                ->where('guard_name', config('auth.defaults.guard', 'web'))
                ->first();

            if ($role) {
                $user->assignRole($role);
            }
        });
    }

    // state untuk super admin
    public function superAdmin()
    {
        return $this->afterCreating(function ($user) {
            $role = Role::where('name', UserRole::SUPER_ADMIN->value)
                ->where('guard_name', config('auth.defaults.guard', 'web'))
                ->first();

            if ($role) {
                $user->assignRole($role);
            }
        });
    }

    // state untuk admin
    public function admin()
    {
        return $this->afterCreating(function ($user) {
            $role = Role::where('name', UserRole::ADMIN->value)
                ->where('guard_name', config('auth.defaults.guard', 'web'))
                ->first();

            if ($role) {
                $user->assignRole($role);
            }
        });
    }
}
