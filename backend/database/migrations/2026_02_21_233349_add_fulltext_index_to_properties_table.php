<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for better search performance
        Schema::table('properties', function (Blueprint $table) {
            // Full-text index for MySQL 5.6+ (InnoDB supports fulltext)
            // For older MySQL or if fulltext doesn't work, we'll use regular indexes
            try {
                DB::statement('ALTER TABLE properties ADD FULLTEXT INDEX ft_search (title, description, address, city)');
            } catch (\Exception $e) {
                // If fulltext fails, add regular indexes
                $table->index(['title', 'description']);
                $table->index('address');
                $table->index('city');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            try {
                DB::statement('ALTER TABLE properties DROP INDEX ft_search');
            } catch (\Exception $e) {
                $table->dropIndex(['title', 'description']);
                $table->dropIndex(['address']);
                $table->dropIndex(['city']);
            }
        });
    }
};
