<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use App\Models\Amenity;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = User::where('role', 'agent')->get();
        $amenities = Amenity::all();

        if ($agents->isEmpty()) {
            $this->command->warn('No agents found. Please run UserSeeder first.');
            return;
        }

        $italianCities = [
            ['city' => 'Rome', 'state' => 'Lazio', 'zip' => '00100', 'lat' => 41.9028, 'lng' => 12.4964],
            ['city' => 'Milan', 'state' => 'Lombardy', 'zip' => '20100', 'lat' => 45.4642, 'lng' => 9.1900],
            ['city' => 'Naples', 'state' => 'Campania', 'zip' => '80100', 'lat' => 40.8518, 'lng' => 14.2681],
            ['city' => 'Turin', 'state' => 'Piedmont', 'zip' => '10100', 'lat' => 45.0703, 'lng' => 7.6869],
            ['city' => 'Palermo', 'state' => 'Sicily', 'zip' => '90100', 'lat' => 38.1157, 'lng' => 13.3615],
            ['city' => 'Bologna', 'state' => 'Emilia-Romagna', 'zip' => '40100', 'lat' => 44.4949, 'lng' => 11.3426],
            ['city' => 'Florence', 'state' => 'Tuscany', 'zip' => '50100', 'lat' => 43.7696, 'lng' => 11.2558],
            ['city' => 'Bari', 'state' => 'Apulia', 'zip' => '70100', 'lat' => 41.1171, 'lng' => 16.8719],
            ['city' => 'Venice', 'state' => 'Veneto', 'zip' => '30100', 'lat' => 45.4408, 'lng' => 12.3155],
            ['city' => 'Verona', 'state' => 'Veneto', 'zip' => '37100', 'lat' => 45.4384, 'lng' => 10.9916],
            ['city' => 'Genoa', 'state' => 'Liguria', 'zip' => '16100', 'lat' => 44.4056, 'lng' => 8.9463],
            ['city' => 'Catania', 'state' => 'Sicily', 'zip' => '95100', 'lat' => 37.5079, 'lng' => 15.0830],
            ['city' => 'Padua', 'state' => 'Veneto', 'zip' => '35100', 'lat' => 45.4064, 'lng' => 11.8768],
            ['city' => 'Trieste', 'state' => 'Friuli-Venezia Giulia', 'zip' => '34100', 'lat' => 45.6495, 'lng' => 13.7768],
            ['city' => 'Perugia', 'state' => 'Umbria', 'zip' => '06100', 'lat' => 43.1107, 'lng' => 12.3908],
        ];

        $streetNames = [
            'Via Roma', 'Via Garibaldi', 'Via Dante', 'Via Verdi', 'Via Cavour',
            'Via Mazzini', 'Corso Italia', 'Piazza del Duomo', 'Viale Europa', 'Via Manzoni',
        ];

        $titlesByType = [
            'house' => ['Elegant Family House', 'Classic Italian Villa', 'Renovated Town House', 'Private Garden Residence'],
            'apartment' => ['Central Apartment', 'Bright Urban Flat', 'Modern Loft Apartment', 'Cozy City Apartment'],
            'condo' => ['Contemporary Condo', 'Premium Condo Residence', 'Stylish Condo Unit'],
            'land' => ['Residential Land Plot', 'Buildable Land Opportunity', 'Investment Land Parcel'],
            'commercial' => ['Commercial Office Space', 'Retail Street Unit', 'Mixed-Use Commercial Property'],
        ];

        $propertyTypes = ['house', 'apartment', 'condo', 'land', 'commercial'];
        $statuses = ['for_sale', 'for_rent', 'sold', 'pending'];
        $descriptionTemplates = [
            'Well-located property in {city}, featuring high-quality finishes and excellent access to services, public transport, and local amenities.',
            'Beautiful opportunity in {city}. Ideal for families and professionals looking for comfort, convenience, and strong long-term value.',
            'Recently updated property in {city} with generous spaces, natural light, and a practical layout for modern living.',
            'Prime real estate offering in {city}, suitable for both residence and investment with strong local market demand.',
        ];

        $properties = [];
        for ($i = 0; $i < 50; $i++) {
            $loc = $italianCities[$i % count($italianCities)];
            $type = $propertyTypes[array_rand($propertyTypes)];
            $status = $statuses[array_rand($statuses)];
            $street = $streetNames[array_rand($streetNames)];
            $houseNumber = rand(1, 180);
            $title = $titlesByType[$type][array_rand($titlesByType[$type])];
            $desc = str_replace('{city}', $loc['city'], $descriptionTemplates[array_rand($descriptionTemplates)]);

            $lat = $loc['lat'] + (rand(-120, 120) / 1000); // ~ up to 0.12 deg variation
            $lng = $loc['lng'] + (rand(-120, 120) / 1000);

            $bedrooms = $type === 'land' || $type === 'commercial' ? null : rand(1, 5);
            $bathrooms = $type === 'land' ? null : rand(1, 4);
            $sqft = $type === 'land'
                ? rand(2500, 15000)
                : ($type === 'commercial' ? rand(900, 6000) : rand(450, 3600));
            $lotSize = $type === 'apartment' || $type === 'condo' ? null : rand(1200, 12000);
            $yearBuilt = rand(1950, 2024);

            $price = match ($type) {
                'land' => rand(60000, 350000),
                'commercial' => $status === 'for_rent' ? rand(1200, 9500) : rand(220000, 1800000),
                'apartment', 'condo' => $status === 'for_rent' ? rand(650, 4200) : rand(120000, 980000),
                default => $status === 'for_rent' ? rand(900, 5200) : rand(180000, 1450000),
            };

            $amenitiesCount = rand(4, 8);
            $selectedAmenityNames = $amenities->random(min($amenitiesCount, $amenities->count()))
                ->pluck('name')
                ->toArray();

            $properties[] = [
                'title' => "{$title} - {$loc['city']}",
                'description' => $desc,
                'property_type' => $type,
                'status' => $status,
                'price' => $price,
                'address' => "{$street} {$houseNumber}",
                'city' => $loc['city'],
                'state' => $loc['state'],
                'zip_code' => $loc['zip'],
                'country' => 'Italy',
                'latitude' => round($lat, 8),
                'longitude' => round($lng, 8),
                'bedrooms' => $bedrooms,
                'bathrooms' => $bathrooms,
                'square_feet' => $sqft,
                'year_built' => $yearBuilt,
                'lot_size' => $lotSize,
                'is_featured' => (bool) rand(0, 1),
                'is_approved' => true,
                'amenities' => $selectedAmenityNames,
            ];
        }

        foreach ($properties as $index => $propertyData) {
            $amenitiesList = $propertyData['amenities'];
            unset($propertyData['amenities']);

            // Assign to random agent
            $agent = $agents->random();
            $propertyData['user_id'] = $agent->id;

            // Create property
            $property = Property::create($propertyData);

            // Attach amenities
            foreach ($amenitiesList as $amenityName) {
                $amenity = $amenities->firstWhere('name', $amenityName);
                if ($amenity) {
                    $property->amenities()->attach($amenity->id);
                }
            }

            // Create sample property images (database records only)
            // Note: Actual image files would need to be created separately
            $imageCount = rand(3, 8);
            for ($i = 0; $i < $imageCount; $i++) {
                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_path' => "properties/sample-{$property->id}-{$i}.jpg",
                    'thumbnail_path' => "properties/thumbnails/sample-{$property->id}-{$i}.jpg",
                    'order' => $i,
                    'is_primary' => $i === 0,
                    'alt_text' => "{$property->title} - Image " . ($i + 1),
                ]);
            }

            // Set initial views and saves
            $property->update([
                'views' => rand(50, 500),
                'saves' => rand(5, 50),
            ]);
        }
    }
}
