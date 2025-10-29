'use client';

import { useEffect, useRef, useState } from 'react';
import { MapProps, Location } from '@/types';

interface LeafletMapProps extends MapProps {
  onLocationSelect?: (location: Location) => void;
}

export default function LeafletMap({
  center,
  zoom,
  markers = [],
  onLocationSelect,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markerLayersRef = useRef<any[]>([]);

  // Initialize once
  useEffect(() => {
    if (!mapContainer.current) return;

    if (typeof window !== 'undefined' && (window as any).L && !map.current) {
      const L = (window as any).L;

      // Initialize map only once
      map.current = L.map(mapContainer.current).setView(center, zoom);

      // Add OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);

      // Ready flag
      map.current.whenReady(() => setMapLoaded(true));

      // Click to select location
      if (onLocationSelect) {
        map.current.on('click', (e: any) => {
          onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect]);

  // Update view when center/zoom props change without re-creating map
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, mapLoaded]);

  // Add markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (typeof window !== 'undefined' && (window as any).L) {
      const L = (window as any).L;

      // Remove previous custom marker layers only
      markerLayersRef.current.forEach((layer) => {
        try { map.current.removeLayer(layer); } catch {}
      });
      markerLayersRef.current = [];

      // Simple divIcon for reliable rendering without image assets
      const divIcon = (color: string = '#3b82f6') => L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      // Add new markers
      markers.forEach((m) => {
        const markerLayer = L.marker(m.position, { icon: divIcon() }).addTo(map.current);
        if (m.popup) markerLayer.bindPopup(m.popup);
        markerLayersRef.current.push(markerLayer);
      });
    }
  }, [markers, mapLoaded]);

  return <div ref={mapContainer} className="w-full h-full" />;
}

// Ensure Leaflet CSS is available so tiles/markers render correctly
import 'leaflet/dist/leaflet.css';
