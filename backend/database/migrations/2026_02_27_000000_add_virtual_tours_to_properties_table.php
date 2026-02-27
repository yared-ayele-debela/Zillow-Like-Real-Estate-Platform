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
        Schema::table('properties', function (Blueprint $table) {
            $table->string('virtual_tour_url')->nullable()->after('price_history');
            $table->string('video_tour_url')->nullable()->after('virtual_tour_url');

            $table->index('virtual_tour_url');
            $table->index('video_tour_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['virtual_tour_url']);
            $table->dropIndex(['video_tour_url']);
            $table->dropColumn(['virtual_tour_url', 'video_tour_url']);
        });
    }
};

