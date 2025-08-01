<?php

namespace Database\Factories;

use App\Helpers\GenerateRefCode;
use App\Models\AssetAssignment;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetAssignmentFactory extends Factory
{
    protected $model = AssetAssignment::class;

    public function definition()
    {
        return [
            'reference_code' => GenerateRefCode::generate(),
            'assigned_user_id' => \App\Models\ExternalUser::inRandomOrder()->first()->id,
            'user_id' => \App\Models\User::inRandomOrder()->first()->id,
            'notes' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['assigned', 'returned']),
            'condition' => $this->faker->randomElement(['ok', 'loss', 'damaged', 'malfunction', 'theft']),
            'assigned_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
            'returned_at' => $this->faker->optional()->dateTimeBetween('assigned_at', 'now'),
        ];
    }
}
