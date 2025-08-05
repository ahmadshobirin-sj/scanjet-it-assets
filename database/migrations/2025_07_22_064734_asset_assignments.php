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
            $table->string('reference_code')->unique();

            $table->uuid('assigned_user_id');
            $table->foreign('assigned_user_id')->references('id')->on('scanjet-crm-dev.users')->onDelete('cascade');

            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->text('notes')->nullable();

            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('returned_at')->nullable(); // This is the time when all assets in this assignment are returned
            $table->timestamp('confirmed_at')->nullable();

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
