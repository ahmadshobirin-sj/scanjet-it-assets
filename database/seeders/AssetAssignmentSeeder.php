<?php

namespace Database\Seeders;

use App\Enums\AssetAssignmentAssetCondition;
use App\Enums\AssetAssignmentAssetStatus;
use App\Models\Asset;
use App\Models\AssetAssignment;
use Illuminate\Database\Seeder;

class AssetAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AssetAssignment::factory()
            ->hasAttached(
                Asset::inRandomOrder()->take(3)->get(), // ambil 3 asset random
                function () {
                    $isReturned = fake()->boolean();

                    return [
                        'status' => $isReturned ? AssetAssignmentAssetStatus::RETURNED : AssetAssignmentAssetStatus::ASSIGNED,
                        'condition' => fake()->randomElement(array_column(AssetAssignmentAssetCondition::cases(), 'value')),
                        'returned_at' => $isReturned ? now() : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            )
            ->create();
    }
}
