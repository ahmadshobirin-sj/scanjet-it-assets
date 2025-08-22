<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($user) {
            if ($user->email !== env('EMAIL_ADMINISTRATOR')) {
                // default assign role Inactive
                $role = Role::where('name', UserRole::INACTIVE->value)
                    ->where('guard_name', config('auth.defaults.guard', 'web'))
                    ->first();

                if ($role) {
                    $user->assignRole($role);
                }
            }
        });
    }
}
