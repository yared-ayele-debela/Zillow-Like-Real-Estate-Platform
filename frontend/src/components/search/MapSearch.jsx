import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../../services/api';
import PropertyCard from '../property/PropertyCard';

const MapSearch = ({ properties = [], onPropertyClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Handle map move/zoom to update bounds
    map.current.on('moveend', () => {
      if (map.current) {
        const bounds = map.current.getBounds();
        updateBoundsFilter(bounds);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers for properties
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = property.is_featured ? '#fbbf24' : '#3b82f6';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([property.longitude, property.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${property.title}</h3>
                <p class="text-xs text-gray-600">$${Number(property.price).toLocaleString()}</p>
              </div>
            `)
          )
          .addTo(map.current);

        el.addEventListener('click', () => {
          setSelectedProperty(property);
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        });

        markers.current.push(marker);
      }
    });

    // Fit map to show all properties
    if (properties.length > 0 && properties.some((p) => p.latitude && p.longitude)) {
      const coordinates = properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => [p.longitude, p.latitude]);

      if (coordinates.length > 0) {
        const bounds = coordinates.reduce(
          (bounds, coord) => {
            return bounds.extend(coord);
          },
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }
  }, [properties, mapLoaded, onPropertyClick]);

  const updateBoundsFilter = (bounds) => {
    const params = new URLSearchParams(searchParams);
    params.set('bounds', JSON.stringify({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }));
    setSearchParams(params);
  };

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">
          Mapbox token not configured. Please add REACT_APP_MAPBOX_TOKEN to your .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-96 rounded-lg" />
      
      {/* Selected Property Card Overlay */}
      {selectedProperty && (
        <div className="absolute top-4 left-4 z-10 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <PropertyCard property={selectedProperty} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSearch;
