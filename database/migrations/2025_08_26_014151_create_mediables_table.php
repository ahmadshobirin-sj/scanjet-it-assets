<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('media_library_id');
            $table->string('linkable_type');
            $table->uuid('linkable_id');
            $table->unsignedInteger('order_column')->nullable();
            $table->string('collection_name');
            $table->timestamps();

            $table->index(['linkable_type', 'linkable_id']);
            $table->unique(['media_library_id', 'linkable_type', 'linkable_id'], 'media_links_unique');

            $table->foreign('media_library_id')
                ->references('id')->on('media_libraries')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_links');
    }
};
