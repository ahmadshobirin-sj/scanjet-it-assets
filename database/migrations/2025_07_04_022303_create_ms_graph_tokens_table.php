<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ms_graph_tokens', function (Blueprint $table) {
            $table->increments('id');
            $table->foreignUuid('user_id')
                ->constrained('users', 'id')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->string('email')->nullable();
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->string('expires');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ms_graph_tokens');
    }
};
