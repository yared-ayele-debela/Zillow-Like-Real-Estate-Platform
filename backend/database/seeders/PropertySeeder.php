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

        $properties = [
            [
                'title' => 'Luxury Modern Home with Pool',
                'description' => 'Stunning 4-bedroom, 3-bathroom modern home featuring an open floor plan, high-end finishes, and a beautiful swimming pool. Located in a prestigious neighborhood with excellent schools nearby. The home boasts a gourmet kitchen with granite countertops, stainless steel appliances, and a large island. Master suite includes a walk-in closet and spa-like bathroom. Large backyard perfect for entertaining.',
                'property_type' => 'house',
                'status' => 'for_sale',
                'price' => 850000,
                'address' => '1234 Oak Street',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90001',
                'country' => 'USA',
                'latitude' => 34.0522,
                'longitude' => -118.2437,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'square_feet' => 3200,
                'year_built' => 2018,
                'lot_size' => 8500,
                'is_featured' => true,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Swimming Pool', 'Garage', 'Fireplace', 'Hardwood Floors', 'Dishwasher'],
            ],
            [
                'title' => 'Cozy Downtown Apartment',
                'description' => 'Beautiful 2-bedroom, 2-bathroom apartment in the heart of downtown. Features include hardwood floors, updated kitchen, and large windows with city views. Building amenities include fitness center, rooftop terrace, and 24-hour concierge. Perfect for professionals or couples. Walking distance to restaurants, shops, and public transportation.',
                'property_type' => 'apartment',
                'status' => 'for_rent',
                'price' => 2800,
                'address' => '567 Main Avenue',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
                'country' => 'USA',
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'bedrooms' => 2,
                'bathrooms' => 2,
                'square_feet' => 1200,
                'year_built' => 2015,
                'lot_size' => null,
                'is_featured' => false,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Elevator', 'Gym/Fitness Center', 'Concierge', 'Hardwood Floors', 'Dishwasher'],
            ],
            [
                'title' => 'Spacious Family Home',
                'description' => 'Perfect family home with 5 bedrooms and 4 bathrooms. Large backyard with deck and garden. Updated kitchen with modern appliances. Located in a quiet neighborhood with excellent schools. Features include a finished basement, two-car garage, and a beautiful front porch. Close to parks and shopping centers.',
                'property_type' => 'house',
                'status' => 'for_sale',
                'price' => 625000,
                'address' => '789 Elm Drive',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60601',
                'country' => 'USA',
                'latitude' => 41.8781,
                'longitude' => -87.6298,
                'bedrooms' => 5,
                'bathrooms' => 4,
                'square_feet' => 3800,
                'year_built' => 2010,
                'lot_size' => 12000,
                'is_featured' => true,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Garage', 'Deck', 'Garden', 'Fireplace', 'Walk-in Closet', 'Laundry Room'],
            ],
            [
                'title' => 'Modern Condo with City Views',
                'description' => 'Stylish 3-bedroom, 2-bathroom condo with breathtaking city views. Features include an open-concept living area, modern kitchen with granite countertops, and a private balcony. Building offers luxury amenities including pool, gym, and rooftop lounge. Prime location in the city center.',
                'property_type' => 'condo',
                'status' => 'for_sale',
                'price' => 495000,
                'address' => '321 Park Boulevard',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip_code' => '94102',
                'country' => 'USA',
                'latitude' => 37.7749,
                'longitude' => -122.4194,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'square_feet' => 1800,
                'year_built' => 2019,
                'lot_size' => null,
                'is_featured' => false,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Balcony', 'Elevator', 'Gym/Fitness Center', 'Swimming Pool', 'Hardwood Floors'],
            ],
            [
                'title' => 'Charming Victorian House',
                'description' => 'Beautifully restored Victorian home with original character and modern updates. Features 4 bedrooms, 3 bathrooms, original hardwood floors, and period details. Large front porch and private backyard. Located in a historic neighborhood.',
                'property_type' => 'house',
                'status' => 'for_sale',
                'price' => 725000,
                'address' => '456 Heritage Lane',
                'city' => 'Boston',
                'state' => 'MA',
                'zip_code' => '02101',
                'country' => 'USA',
                'latitude' => 42.3601,
                'longitude' => -71.0589,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'square_feet' => 2800,
                'year_built' => 1895,
                'lot_size' => 7500,
                'is_featured' => true,
                'is_approved' => true,
                'amenities' => ['Heating', 'Fireplace', 'Hardwood Floors', 'Garden', 'Patio', 'Garage'],
            ],
            [
                'title' => 'Luxury Penthouse Apartment',
                'description' => 'Exclusive penthouse with panoramic views. Features 3 bedrooms, 3.5 bathrooms, private terrace, and premium finishes throughout. Building amenities include concierge, valet parking, and private elevator access.',
                'property_type' => 'apartment',
                'status' => 'for_rent',
                'price' => 8500,
                'address' => '999 Skyline Drive',
                'city' => 'Miami',
                'state' => 'FL',
                'zip_code' => '33101',
                'country' => 'USA',
                'latitude' => 25.7617,
                'longitude' => -80.1918,
                'bedrooms' => 3,
                'bathrooms' => 4,
                'square_feet' => 3500,
                'year_built' => 2020,
                'lot_size' => null,
                'is_featured' => true,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Balcony', 'Elevator', 'Concierge', 'Doorman', 'Gym/Fitness Center', 'Swimming Pool'],
            ],
            [
                'title' => 'Starter Home - Great Value',
                'description' => 'Affordable 3-bedroom, 2-bathroom starter home in a family-friendly neighborhood. Recently updated kitchen and bathrooms. Large backyard perfect for kids and pets. Great investment opportunity.',
                'property_type' => 'house',
                'status' => 'for_sale',
                'price' => 325000,
                'address' => '234 Maple Street',
                'city' => 'Phoenix',
                'state' => 'AZ',
                'zip_code' => '85001',
                'country' => 'USA',
                'latitude' => 33.4484,
                'longitude' => -112.0740,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'square_feet' => 1800,
                'year_built' => 2005,
                'lot_size' => 6000,
                'is_featured' => false,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Garage', 'Yard', 'Dishwasher'],
            ],
            [
                'title' => 'Downtown Studio Apartment',
                'description' => 'Modern studio apartment in the heart of downtown. Perfect for students or young professionals. Includes all utilities. Walking distance to universities, cafes, and nightlife.',
                'property_type' => 'apartment',
                'status' => 'for_rent',
                'price' => 1200,
                'address' => '111 College Avenue',
                'city' => 'Austin',
                'state' => 'TX',
                'zip_code' => '78701',
                'country' => 'USA',
                'latitude' => 30.2672,
                'longitude' => -97.7431,
                'bedrooms' => 0,
                'bathrooms' => 1,
                'square_feet' => 600,
                'year_built' => 2018,
                'lot_size' => null,
                'is_featured' => false,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'High Speed Internet', 'Cable Ready'],
            ],
            [
                'title' => 'Waterfront Property',
                'description' => 'Stunning waterfront home with private dock. Features 5 bedrooms, 4 bathrooms, and direct water access. Perfect for boating enthusiasts. Large deck overlooking the water.',
                'property_type' => 'house',
                'status' => 'for_sale',
                'price' => 1250000,
                'address' => '888 Harbor View Road',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip_code' => '98101',
                'country' => 'USA',
                'latitude' => 47.6062,
                'longitude' => -122.3321,
                'bedrooms' => 5,
                'bathrooms' => 4,
                'square_feet' => 4200,
                'year_built' => 2015,
                'lot_size' => 15000,
                'is_featured' => true,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Fireplace', 'Deck', 'Garage', 'Hardwood Floors', 'Walk-in Closet'],
            ],
            [
                'title' => 'Commercial Office Space',
                'description' => 'Prime commercial office space in business district. 2000 sq ft of office space with reception area, private offices, and conference room. Great location with high visibility.',
                'property_type' => 'commercial',
                'status' => 'for_rent',
                'price' => 4500,
                'address' => '555 Business Park Drive',
                'city' => 'Dallas',
                'state' => 'TX',
                'zip_code' => '75201',
                'country' => 'USA',
                'latitude' => 32.7767,
                'longitude' => -96.7970,
                'bedrooms' => null,
                'bathrooms' => 2,
                'square_feet' => 2000,
                'year_built' => 2012,
                'lot_size' => null,
                'is_featured' => false,
                'is_approved' => true,
                'amenities' => ['Air Conditioning', 'Heating', 'Elevator', 'Parking', 'High Speed Internet'],
            ],
        ];

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
