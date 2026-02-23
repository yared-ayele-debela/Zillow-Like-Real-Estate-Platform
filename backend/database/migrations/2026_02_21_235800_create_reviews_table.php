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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // reviewer
            $table->foreignId('property_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->unsignedInteger('rating'); // 1 to 5
            $table->text('review')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();

            // Unique constraints
            $table->unique(['user_id', 'property_id']); // One review per user per property
            $table->unique(['user_id', 'agent_id']); // One review per user per agent
            
            // Indexes
            $table->index('property_id');
            $table->index('agent_id');
            $table->index('is_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
