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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('property_type', ['house', 'apartment', 'condo', 'land', 'commercial']);
            $table->enum('status', ['for_sale', 'for_rent', 'sold', 'pending'])->default('for_sale');
            $table->decimal('price', 15, 2);
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->string('country')->default('USA');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('square_feet')->nullable();
            $table->integer('year_built')->nullable();
            $table->integer('lot_size')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->integer('views')->default(0);
            $table->integer('saves')->default(0);
            $table->json('price_history')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better query performance
            $table->index('user_id');
            $table->index('property_type');
            $table->index('status');
            $table->index('price');
            $table->index('city');
            $table->index('is_approved');
            $table->index('is_featured');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
