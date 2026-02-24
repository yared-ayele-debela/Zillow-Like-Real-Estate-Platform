<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Property;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $italianLocations = collect([
            ['state' => 'Lazio', 'city' => 'Roma'],
            ['state' => 'Lombardia', 'city' => 'Milano'],
            ['state' => 'Campania', 'city' => 'Napoli'],
            ['state' => 'Piemonte', 'city' => 'Torino'],
            ['state' => 'Sicilia', 'city' => 'Palermo'],
            ['state' => 'Sicilia', 'city' => 'Catania'],
            ['state' => 'Toscana', 'city' => 'Firenze'],
            ['state' => 'Emilia-Romagna', 'city' => 'Bologna'],
            ['state' => 'Veneto', 'city' => 'Venezia'],
            ['state' => 'Veneto', 'city' => 'Verona'],
            ['state' => 'Liguria', 'city' => 'Genova'],
            ['state' => 'Puglia', 'city' => 'Bari'],
            ['state' => 'Calabria', 'city' => 'Reggio Calabria'],
            ['state' => 'Sardegna', 'city' => 'Cagliari'],
            ['state' => 'Marche', 'city' => 'Ancona'],
            ['state' => 'Abruzzo', 'city' => 'Pescara'],
            ['state' => 'Umbria', 'city' => 'Perugia'],
            ['state' => 'Friuli-Venezia Giulia', 'city' => 'Trieste'],
            ['state' => 'Trentino-Alto Adige', 'city' => 'Trento'],
            ['state' => 'Valle d Aosta', 'city' => 'Aosta'],
        ]);

        foreach ($italianLocations->values() as $index => $location) {
            Location::updateOrCreate(
                [
                    'state' => trim((string) $location['state']),
                    'city' => trim((string) $location['city']),
                ],
                [
                    'is_active' => true,
                    'sort_order' => $index,
                ]
            );
        }

        // Keep any existing property-derived locations as inactive so Italy stays the default set.
        $propertyLocations = Property::query()
            ->select('state', 'city')
            ->whereNotNull('state')
            ->whereNotNull('city')
            ->distinct()
            ->get();

        foreach ($propertyLocations as $location) {
            $state = trim((string) $location->state);
            $city = trim((string) $location->city);

            if ($state === '' || $city === '') {
                continue;
            }

            Location::firstOrCreate(
                ['state' => $state, 'city' => $city],
                ['is_active' => false, 'sort_order' => 9999]
            );
        }
    }
}
