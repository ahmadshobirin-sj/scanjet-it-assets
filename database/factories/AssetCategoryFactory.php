<?php

namespace Database\Factories;

use App\Models\AssetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetCategoryFactory extends Factory
{
    protected $model = AssetCategory::class;

    public function definition()
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Laptop',
                'Desktop',
                'Monitor (primary)',
                'Monitor (secondary)',
                'Printer',
                'Router',
                'Switch',
                'Tablet',
                'Mobile Phone',
                'Projector',
            ]),
            'description' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
