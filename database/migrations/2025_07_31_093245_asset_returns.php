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

        Schema::create('asset_returns', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('asset_assignment_id');
            $table->foreign('asset_assignment_id')
                ->references('id')->on('asset_assignments')
                ->cascadeOnDelete();

            // Hanya satu penanggung jawab penerima pengembalian
            $table->uuid('received_by_user_id')->nullable();
            $table->foreign('received_by_user_id')
                ->references('id')->on('users')
                ->nullOnDelete();

            $table->timestamp('returned_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['asset_assignment_id', 'created_at'], 'ix_ar_assignment_created');

            // untuk FK komposit dari pivot
            $table->unique(['id', 'asset_assignment_id'], 'uq_ar_id_assignment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_returns');
    }
};
