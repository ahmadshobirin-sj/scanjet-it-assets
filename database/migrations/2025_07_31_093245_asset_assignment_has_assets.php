<?php

use App\Enums\AssetAssignmentAssetCondition;
use App\Enums\AssetAssignmentAssetStatus;
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
        Schema::create('asset_assignment_has_assets', function (Blueprint $table) {
            $table->uuid('asset_id');
            $table->uuid('asset_assignment_id');

            $table->enum('status', array_column(AssetAssignmentAssetStatus::cases(), 'value'))->default('assigned');
            $table->enum('condition', array_column(AssetAssignmentAssetCondition::cases(), 'value'))->default('ok');

            $table->timestamp('returned_at')->nullable(); // This is the time when this asset is returned

            $table->timestamps();

            $table->foreign('asset_id')
                ->references('id')
                ->on('assets')
                ->cascadeOnDelete();

            $table->foreign('asset_assignment_id')
                ->references('id')
                ->on('asset_assignments')
                ->cascadeOnDelete();

            $table->primary(['asset_id', 'asset_assignment_id'], 'asset_assignment_has_assets_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
