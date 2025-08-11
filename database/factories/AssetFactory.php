<?php

namespace Database\Factories;

use App\Enums\AssetStatus;
use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word().' '.$this->faker->bothify('Model-###-###'),
            'category_id' => \App\Models\AssetCategory::inRandomOrder()->first()?->id ?? \App\Models\AssetCategory::factory(),
            'manufacture_id' => \App\Models\Manufacture::inRandomOrder()->first()?->id ?? \App\Models\Manufacture::factory(),
            'location' => $this->faker->city(),
            'serial_number' => $this->faker->unique()->bothify('SN-####-####'),
            'asset_tag' => $this->faker->unique()->bothify('AT-####-####'),
            'warranty_expired' => $this->faker->dateTimeBetween('now', '+2 years'),
            'purchase_date' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'note' => $this->faker->sentence(),
            'reference_link' => $this->faker->url(),
            'status' => AssetStatus::AVAILABLE,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
