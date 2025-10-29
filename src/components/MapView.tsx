'use client';

import { useEffect, useRef, useState } from 'react';
import { Location, MapProps } from '@/types';

// Dynamic import for Mapbox GL to avoid SSR issues
const MapboxMap = dynamic(() => import('./MapboxMap'), { ssr: false });
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface MapViewProps extends MapProps {
  mapProvider?: 'mapbox' | 'leaflet';
  onLocationSelect?: (location: Location) => void;
  showControls?: boolean;
}

export default function MapView({
  center,
  zoom,
  markers = [],
  onLocationSelect,
  mapProvider = 'mapbox',
  showControls = true,
}: MapViewProps) {
  const [mapProviderState, setMapProviderState] = useState(mapProvider);

  const handleLocationSelect = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Provider Toggle */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <div className="flex gap-1">
            <button
              onClick={() => setMapProviderState('mapbox')}
              className={`px-3 py-1 text-sm rounded ${
                mapProviderState === 'mapbox'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Mapbox
            </button>
            <button
              onClick={() => setMapProviderState('leaflet')}
              className={`px-3 py-1 text-sm rounded ${
                mapProviderState === 'leaflet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Leaflet
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="w-full h-full rounded-lg overflow-hidden">
        {mapProviderState === 'mapbox' ? (
          <MapboxMap
            center={center}
            zoom={zoom}
            markers={markers}
            onLocationSelect={handleLocationSelect}
          />
        ) : (
          <LeafletMap
            center={center}
            zoom={zoom}
            markers={markers}
            onLocationSelect={handleLocationSelect}
          />
        )}
      </div>
    </div>
  );
}

// Dynamic imports
import dynamic from 'next/dynamic';
