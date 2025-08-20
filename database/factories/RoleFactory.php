<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Spatie\Permission\Models\Role;
use App\Enums\UserRole;
use Illuminate\Support\Str;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'name' => $this->faker->unique()->randomElement(
                array_map(fn(UserRole $case) => $case->value, UserRole::cases())
            ),
            'guard_name' => config('auth.defaults.guard', 'web'),
        ];
    }
}
