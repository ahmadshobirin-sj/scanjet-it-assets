<?php

namespace Database\Seeders;

use App\Models\AssetCategory;
use Illuminate\Database\Seeder;

class AssetCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'Laptop',
            'Monitor',
            'Mobile Device',
            'Headset',
            'Keyboard',
            'Mouse',
        ];
        foreach ($data as $item) {
            AssetCategory::factory()->create([
                'name' => $item,
            ]);
        }
    }
}
