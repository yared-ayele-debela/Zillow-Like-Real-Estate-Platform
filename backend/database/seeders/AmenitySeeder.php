<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $amenities = [
            // Indoor Amenities
            ['name' => 'Air Conditioning', 'category' => 'indoor', 'icon' => 'ac'],
            ['name' => 'Heating', 'category' => 'indoor', 'icon' => 'heating'],
            ['name' => 'Fireplace', 'category' => 'indoor', 'icon' => 'fireplace'],
            ['name' => 'Hardwood Floors', 'category' => 'indoor', 'icon' => 'floor'],
            ['name' => 'Carpet', 'category' => 'indoor', 'icon' => 'carpet'],
            ['name' => 'Walk-in Closet', 'category' => 'indoor', 'icon' => 'closet'],
            ['name' => 'Laundry Room', 'category' => 'indoor', 'icon' => 'laundry'],
            ['name' => 'Dishwasher', 'category' => 'indoor', 'icon' => 'dishwasher'],
            ['name' => 'Microwave', 'category' => 'indoor', 'icon' => 'microwave'],
            ['name' => 'Refrigerator', 'category' => 'indoor', 'icon' => 'fridge'],
            ['name' => 'Garbage Disposal', 'category' => 'indoor', 'icon' => 'disposal'],
            ['name' => 'Granite Countertops', 'category' => 'indoor', 'icon' => 'counter'],
            ['name' => 'Stainless Steel Appliances', 'category' => 'indoor', 'icon' => 'appliances'],
            ['name' => 'Ceiling Fans', 'category' => 'indoor', 'icon' => 'fan'],
            ['name' => 'High Ceilings', 'category' => 'indoor', 'icon' => 'ceiling'],

            // Outdoor Amenities
            ['name' => 'Swimming Pool', 'category' => 'outdoor', 'icon' => 'pool'],
            ['name' => 'Hot Tub', 'category' => 'outdoor', 'icon' => 'hottub'],
            ['name' => 'Patio', 'category' => 'outdoor', 'icon' => 'patio'],
            ['name' => 'Deck', 'category' => 'outdoor', 'icon' => 'deck'],
            ['name' => 'Balcony', 'category' => 'outdoor', 'icon' => 'balcony'],
            ['name' => 'Garden', 'category' => 'outdoor', 'icon' => 'garden'],
            ['name' => 'Yard', 'category' => 'outdoor', 'icon' => 'yard'],
            ['name' => 'Fence', 'category' => 'outdoor', 'icon' => 'fence'],
            ['name' => 'Garage', 'category' => 'outdoor', 'icon' => 'garage'],
            ['name' => 'Parking', 'category' => 'outdoor', 'icon' => 'parking'],
            ['name' => 'RV Parking', 'category' => 'outdoor', 'icon' => 'rv'],
            ['name' => 'Outdoor Kitchen', 'category' => 'outdoor', 'icon' => 'outdoor-kitchen'],
            ['name' => 'Fire Pit', 'category' => 'outdoor', 'icon' => 'firepit'],
            ['name' => 'Playground', 'category' => 'outdoor', 'icon' => 'playground'],

            // Building Amenities
            ['name' => 'Elevator', 'category' => 'building', 'icon' => 'elevator'],
            ['name' => 'Gym/Fitness Center', 'category' => 'building', 'icon' => 'gym'],
            ['name' => 'Security System', 'category' => 'building', 'icon' => 'security'],
            ['name' => 'Alarm System', 'category' => 'building', 'icon' => 'alarm'],
            ['name' => 'Intercom', 'category' => 'building', 'icon' => 'intercom'],
            ['name' => 'Concierge', 'category' => 'building', 'icon' => 'concierge'],
            ['name' => 'Doorman', 'category' => 'building', 'icon' => 'doorman'],
            ['name' => 'Storage', 'category' => 'building', 'icon' => 'storage'],
            ['name' => 'Wheelchair Accessible', 'category' => 'building', 'icon' => 'accessible'],
            ['name' => 'High Speed Internet', 'category' => 'building', 'icon' => 'wifi'],
            ['name' => 'Cable Ready', 'category' => 'building', 'icon' => 'cable'],
        ];

        foreach ($amenities as $amenity) {
            Amenity::create($amenity);
        }
    }
}
