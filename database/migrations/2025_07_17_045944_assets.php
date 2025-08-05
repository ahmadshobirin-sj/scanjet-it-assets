<?php

use App\Enums\AssetStatus;
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
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('asset_tag')->nullable();
            $table->string('location')->nullable();
            $table->string('serial_number')->unique()->nullable();
            $table->date('warranty_expired')->nullable();
            $table->date('last_maintenance')->nullable();
            $table->text('note')->nullable();
            $table->date('purchase_date')->nullable();

            $table->uuid('category_id');
            $table->foreign('category_id')->references('id')->on('asset_categories')->onDelete('restrict');

            $table->uuid('manufacture_id');
            $table->foreign('manufacture_id')->references('id')->on('manufactures')->onDelete('restrict');

            $table->enum('status', array_column(AssetStatus::cases(), 'value'))->default('available');

            $table->string('reference_link')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
