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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('msgraph_user_id')->nullable()->default('');
            $table->string('preferred_language')->nullable()->default('');
            $table->string('user_principal_name')->default('');
            $table->string('name')->nullable()->default('')->index();
            $table->string('email')->unique();
            $table->json('business_phones')->nullable();
            $table->string('given_name')->default('');
            $table->string('job_title')->nullable()->default('');
            $table->string('mobile_phone')->nullable()->default('');
            $table->string('office_location')->nullable()->default('');
            $table->string('surname')->nullable()->default('');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
