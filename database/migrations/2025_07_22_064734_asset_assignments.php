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
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('asset_id');
            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');

            $table->uuid('assigned_user_id');
            $table->foreign('assigned_user_id')->references('id')->on('users')->onDelete('cascade');

            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->text('note')->nullable();
            $table->enum('status', ['assigned', 'returned'])->default('assigned');

            $table->enum('condition', ['ok', 'loss', 'damaged', 'malfunction', 'theft'])->default('ok');

            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('returned_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignments');
    }
};
