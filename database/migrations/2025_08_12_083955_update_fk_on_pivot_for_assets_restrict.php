<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('asset_assignment_has_assets', function (Blueprint $table) {
            try {
                $table->dropForeign(['asset_id']);
            } catch (\Throwable $e) {
            }

            $table->foreign('asset_id')
                ->references('id')->on('assets')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_assignment_has_assets', function (Blueprint $table) {
            try {
                $table->dropForeign(['asset_id']);
            } catch (\Throwable $e) {
            }

            $table->foreign('asset_id')
                ->references('id')->on('assets')
                ->cascadeOnDelete();
        });
    }
};
