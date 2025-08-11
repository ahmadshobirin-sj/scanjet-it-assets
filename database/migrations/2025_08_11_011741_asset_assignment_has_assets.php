<?php

use App\Enums\AssetAssignmentAssetCondition;
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

            $table->uuid('asset_return_id')->nullable(); // NULL = belum dikembalikan

            $table->timestamp('returned_at')->nullable();
            $table->enum('condition', array_column(AssetAssignmentAssetCondition::cases(), 'value'))->default('ok');

            $table->timestamps();

            // FK dasar
            $table->foreign('asset_id')->references('id')->on('assets')->cascadeOnDelete();
            $table->foreign('asset_assignment_id')->references('id')->on('asset_assignments')->cascadeOnDelete();

            // FK komposit (guard): return form harus milik assignment yang sama
            $table->foreign(['asset_return_id', 'asset_assignment_id'], 'fk_aha_return_header_guard')
                ->references(['id', 'asset_assignment_id'])
                ->on('asset_returns')
                ->restrictOnDelete(); // <-- mencegah delete sebelum NULL di pivot

            $table->primary(['asset_id', 'asset_assignment_id'], 'asset_assignment_has_assets_primary');

            $table->index(['asset_assignment_id', 'returned_at'], 'ix_aha_assignment_returned_at');
            $table->index(['asset_return_id'], 'ix_aha_asset_return_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignment_has_assets');
    }
};
