import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapSearch = ({
  properties = [],
  onPropertyClick,
  onAreaFilterChange,
  enableBoundsFilter = false,
  heightClass = 'h-full',
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersLayer = useRef(null);
  const cityLayer = useRef(null);
  const selectedAreaGeometry = useRef(null);
  const selectedAreaName = useRef('');
  const latestPropertiesRef = useRef(properties);
  const areaFilterCallbackRef = useRef(onAreaFilterChange);
  const [searchParams, setSearchParams] = useSearchParams();
  const [mapLoaded, setMapLoaded] = useState(false);

  const geoapifyKey = process.env.REACT_APP_GEOAPIFY_API_KEY
    || process.env.REACT_APP_MAP_API_KEY
    || 'cc7118dc990b4948a202b6eebea7935c';

  useEffect(() => {
    latestPropertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    areaFilterCallbackRef.current = onAreaFilterChange;
  }, [onAreaFilterChange]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
    }).setView([39.8283, -98.5795], 4);

    const tileUrl = geoapifyKey
      ? `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution: geoapifyKey
        ? '&copy; OpenStreetMap contributors | Tiles by Geoapify'
        : '&copy; OpenStreetMap contributors',
    }).addTo(map.current);

    markersLayer.current = L.featureGroup().addTo(map.current);
    cityLayer.current = L.featureGroup().addTo(map.current);

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Leaflet may render before load event; ensure map is marked ready.
    setTimeout(() => setMapLoaded(true), 0);

    if (enableBoundsFilter) {
      // Optional map bounds syncing for server-side map filtering.
      map.current.on('moveend', () => {
        if (!map.current) return;
        const bounds = map.current.getBounds();
        updateBoundsFilter(bounds);
      });
    }

    // Click map to detect and highlight city boundary, then filter markers/list by that boundary.
    map.current.on('click', async (event) => {
      if (!geoapifyKey || !cityLayer.current) return;

      const { lat, lng } = event.latlng;
      cityLayer.current.clearLayers();

      const clickMarker = L.circleMarker([lat, lng], {
        radius: 6,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.9,
        weight: 1.5,
      }).addTo(cityLayer.current);

      try {
        const url = `https://api.geoapify.com/v1/boundaries/part-of?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&boundaries=administrative&geometry=geometry_1000&apiKey=${encodeURIComponent(geoapifyKey)}`;
        const response = await fetch(url, { method: 'GET', redirect: 'follow' });
        const result = await response.json();
        const feature = pickCityFeature(result?.features || []);

        if (!feature) {
          selectedAreaGeometry.current = null;
          selectedAreaName.current = '';
          if (areaFilterCallbackRef.current) areaFilterCallbackRef.current(null);
          return;
        }

        selectedAreaGeometry.current = feature.geometry || null;
        selectedAreaName.current =
          feature.properties?.city
          || feature.properties?.name
          || feature.properties?.formatted
          || 'Selected area';

        const areaGeoJson = L.geoJSON(feature, {
          style: {
            color: '#2563eb',
            weight: 2,
            fillColor: '#60a5fa',
            fillOpacity: 0.2,
          },
          pointToLayer: (_f, latlng) => L.circleMarker(latlng, {
            radius: 8,
            color: '#2563eb',
            fillColor: '#60a5fa',
            fillOpacity: 0.9,
            weight: 1.5,
          }),
        }).addTo(cityLayer.current);

        // Keep click marker visible.
        clickMarker.addTo(cityLayer.current);

        if (areaGeoJson.getLayers().length > 0) {
          map.current.fitBounds(areaGeoJson.getBounds(), { padding: [20, 20] });
        }

        if (areaFilterCallbackRef.current) {
          const filtered = filterPropertiesByGeometry(
            latestPropertiesRef.current,
            selectedAreaGeometry.current,
          );
          areaFilterCallbackRef.current({
            areaName: selectedAreaName.current,
            propertyIds: filtered.map((p) => p.id),
          });
        }
      } catch (error) {
        selectedAreaGeometry.current = null;
        selectedAreaName.current = '';
        if (areaFilterCallbackRef.current) areaFilterCallbackRef.current(null);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [geoapifyKey, enableBoundsFilter]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !markersLayer.current) return;

    markersLayer.current.clearLayers();

    const activeProperties = selectedAreaGeometry.current
      ? filterPropertiesByGeometry(properties, selectedAreaGeometry.current)
      : properties;

    // Add markers for properties
    activeProperties.forEach((property) => {
      const lat = Number(property.latitude);
      const lon = Number(property.longitude);

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const priceText = property.formatted_price || `$${Number(property.price || 0).toLocaleString()}`;
        const marker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: '',
            html: `
              <div style="
                padding:4px 8px;
                border-radius:9999px;
                background:#B91C1C;
                color:#fff;
                font-size:11px;
                font-weight:700;
                border:2px solid #fff;
                box-shadow:0 2px 8px rgba(0,0,0,0.35);
                white-space:nowrap;
              ">
                ${priceText}
              </div>
            `,
            iconSize: [80, 24],
            iconAnchor: [40, 12],
          }),
        }).addTo(markersLayer.current);

        marker.bindPopup(`
          <div class="p-2">
            <h3 style="font-weight:600;font-size:13px;margin:0 0 4px 0;">${property.title}</h3>
            <p style="font-size:12px;color:#4b5563;margin:0;">$${Number(property.price || 0).toLocaleString()}</p>
          </div>
        `);

        marker.on('click', () => {
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        });
      }
    });

    // Fit map to show all properties
    if (activeProperties.length > 0 && activeProperties.some((p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)))) {
      const coordinates = activeProperties
        .filter((p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)))
        .map((p) => [Number(p.latitude), Number(p.longitude)]);

      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates);
        map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [properties, mapLoaded, onPropertyClick]);

  const pickCityFeature = (features) => {
    if (!Array.isArray(features) || !features.length) return null;
    const explicitCity = features.find((feature) => feature?.properties?.city);
    if (explicitCity) return explicitCity;

    const match = features.find((feature) => {
      const props = feature.properties || {};
      const typeText = String(
        props.result_type || props.place_type || props.boundary_type || ''
      ).toLowerCase();
      return (
        typeText.includes('city')
        || typeText.includes('municipality')
        || typeText.includes('town')
        || typeText.includes('district')
        || typeText.includes('suburb')
        || typeText.includes('postcode')
      );
    });
    return match || features[0];
  };

  const isPointInRing = (point, ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      const intersect =
        yi > point[1] !== yj > point[1]
        && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi + Number.EPSILON) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const isPointInPolygon = (point, polygonCoordinates) => {
    if (!polygonCoordinates || !polygonCoordinates.length) return false;
    if (!isPointInRing(point, polygonCoordinates[0])) return false;
    for (let i = 1; i < polygonCoordinates.length; i += 1) {
      if (isPointInRing(point, polygonCoordinates[i])) return false;
    }
    return true;
  };

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterPropertiesByGeometry = (props, geometry) => {
    if (!geometry || !geometry.type) return props;

    if (geometry.type === 'Polygon') {
      return props.filter((p) => {
        const lat = Number(p.latitude);
        const lon = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lon)
          && isPointInPolygon([lon, lat], geometry.coordinates);
      });
    }

    if (geometry.type === 'MultiPolygon') {
      return props.filter((p) => {
        const lat = Number(p.latitude);
        const lon = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lon)
          && geometry.coordinates.some((poly) => isPointInPolygon([lon, lat], poly));
      });
    }

    if (geometry.type === 'Point') {
      const center = geometry.coordinates;
      return props.filter((p) => {
        const lat = Number(p.latitude);
        const lon = Number(p.longitude);
        return Number.isFinite(lat) && Number.isFinite(lon)
          && haversineKm(center[1], center[0], lat, lon) <= 8;
      });
    }

    return props;
  };

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

  return (
    <div className="relative">
      <div ref={mapContainer} className={`w-full rounded-lg ${heightClass}`} />
    </div>
  );
};

export default MapSearch;
