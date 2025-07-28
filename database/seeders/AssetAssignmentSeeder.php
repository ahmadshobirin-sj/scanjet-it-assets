<?php

namespace Database\Seeders;

use App\Models\AssetAssignment;
use Illuminate\Database\Seeder;

class AssetAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AssetAssignment::factory()->count(50)->create();
    }
}
