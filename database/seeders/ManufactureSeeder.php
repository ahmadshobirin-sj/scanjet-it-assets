<?php

namespace Database\Seeders;

use App\Models\Manufacture;
use Illuminate\Database\Seeder;

class ManufactureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Manufacture::factory()->count(20)->create();
    }
}
