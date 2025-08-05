<?php

namespace Database\Factories;

use App\Helpers\GenerateRefCode;
use App\Models\AssetAssignment;
use App\Models\ExternalUser;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetAssignmentFactory extends Factory
{
    protected $model = AssetAssignment::class;

    public function definition()
    {
        return [
            'reference_code' => GenerateRefCode::generate(),
            'assigned_user_id' => ExternalUser::inRandomOrder()->first()?->id ?? ExternalUser::factory(),
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'notes' => $this->faker->sentence(),
            'assigned_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
            'confirmed_at' => $this->faker->optional()->dateTimeBetween('-1 years', 'now'),
        ];
    }
}
