<?php

namespace Database\Seeders;

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
        $assignments = AssetAssignment::factory()->count(5)->create();
        foreach ($assignments as $assignment) {
            $assignment->assets()->attach(Asset::inRandomOrder()->take(4)->pluck('id'));
        }
    }
}
