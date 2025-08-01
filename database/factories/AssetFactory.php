<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word().' '.$this->faker->bothify('Model-###-###'),
            'category_id' => \App\Models\AssetCategory::inRandomOrder()->first()->id,
            'manufacture_id' => \App\Models\Manufacture::inRandomOrder()->first()->id,
            'location' => $this->faker->city(),
            'serial_number' => $this->faker->unique()->bothify('SN-####-####'),
            'asset_tag' => $this->faker->unique()->bothify('AT-####-####'),
            'warranty_expired' => $this->faker->date(),
            'purchase_date' => $this->faker->date(),
            'note' => $this->faker->sentence(),
            'reference_link' => $this->faker->url(),
            'status' => 'available',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
