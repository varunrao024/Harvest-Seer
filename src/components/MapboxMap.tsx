'use client';

import { useEffect, useRef, useState } from 'react';
import { MapProps, Location } from '@/types';

interface MapboxMapProps extends MapProps {
  onLocationSelect?: (location: Location) => void;
}

export default function MapboxMap({
  center,
  zoom,
  markers = [],
  onLocationSelect,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markerRefs = useRef<any[]>([]);

  // Initialize once
  useEffect(() => {
    if (!mapContainer.current) return;

    if (typeof window !== 'undefined' && (window as any).mapboxgl && !map.current) {
      const mapboxgl = (window as any).mapboxgl;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: center,
        zoom: zoom,
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocate);

      map.current.on('load', () => setMapLoaded(true));

      if (onLocationSelect) {
        map.current.on('click', (e: any) => {
          onLocationSelect({ lat: e.lngLat.lat, lon: e.lngLat.lng });
        });
      }
    }

    return () => {
      if (map.current) {
        // Remove markers
        markerRefs.current.forEach((mk) => { try { mk.remove(); } catch {} });
        markerRefs.current = [];
        map.current.remove();
        map.current = null;
      }
    };
  }, [onLocationSelect]);

  // Update view when center/zoom change
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.easeTo({ center, zoom, duration: 500 });
    }
  }, [center, zoom, mapLoaded]);

  // Add markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      const mapboxgl = (window as any).mapboxgl;

      // Remove previous markers
      markerRefs.current.forEach((mk) => { try { mk.remove(); } catch {} });
      markerRefs.current = [];

      // Add new markers
      markers.forEach((m) => {
        const el = document.createElement('div');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#3b82f6';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.2)';
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(m.position)
          .setPopup(m.popup ? new mapboxgl.Popup().setHTML(m.popup) : undefined)
          .addTo(map.current);
        markerRefs.current.push(marker);
      });
    }
  }, [markers, mapLoaded]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
