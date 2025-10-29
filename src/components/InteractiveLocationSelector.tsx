'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, GlobeAltIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Location, FarmBoundary } from '@/types';
import 'leaflet/dist/leaflet.css';

interface InteractiveLocationSelectorProps {
  onLocationChange: (location: Location) => void;
  onBoundaryChange?: (boundary: FarmBoundary | null) => void;
  currentLocation?: Location | null;
  disabled?: boolean;
}

export default function InteractiveLocationSelector({
  onLocationChange,
  onBoundaryChange,
  currentLocation,
  disabled = false,
}: InteractiveLocationSelectorProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // India center
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const polygon = useRef<any>(null);
  const drawingModeRef = useRef(drawingMode);
  const boundaryPointsRef = useRef(boundaryPoints);
  
  const {
    loading,
    success,
    error,
    location,
    getCurrentLocation,
    setManualLocation,
    clearLocation,
    retry,
  } = useGeolocation();

  // Keep refs in sync
  useEffect(() => {
    drawingModeRef.current = drawingMode;
  }, [drawingMode]);

  useEffect(() => {
    boundaryPointsRef.current = boundaryPoints;
  }, [boundaryPoints]);

  // Initialize Leaflet map once per showMap open
  useEffect(() => {
    if (!mapContainer.current || !showMap) return;

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).L && !map.current) {
        const L = (window as any).L;

        const mkIcon = () => L.divIcon({
          className: 'boundary-pin',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        // Initialize Leaflet map
        map.current = L.map(mapContainer.current).setView(mapCenter, 10);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map.current);

        // If we have a current location, center on it and add marker
        if (currentLocation) {
          const locationCenter: [number, number] = [currentLocation.lat, currentLocation.lon];
          map.current.setView(locationCenter, 15);
          const marker = L.marker([currentLocation.lat, currentLocation.lon], { icon: mkIcon() })
            .addTo(map.current)
            .bindPopup(`Current Location<br/>Lat: ${currentLocation.lat.toFixed(6)}<br/>Lon: ${currentLocation.lon.toFixed(6)}`)
            .openPopup();
          (marker as any).isBoundaryMarker = false;
          markers.current.push(marker);
        }

        // Handle map clicks for boundary drawing
        map.current.on('click', (e: any) => {
          // Use refs to get current values (not closure values)
          if (drawingModeRef.current && boundaryPointsRef.current.length < 4) {
            const newPoint: Location = { lat: e.latlng.lat, lon: e.latlng.lng };
            const updatedPoints = [...boundaryPointsRef.current, newPoint];
            setBoundaryPoints(updatedPoints);

            // Add numbered marker
            const marker = L.marker([newPoint.lat, newPoint.lon], { icon: mkIcon() })
              .addTo(map.current)
              .bindPopup(`Point ${updatedPoints.length}`)
              .openPopup();
            (marker as any).isBoundaryMarker = true;

            // Add number label
            const numberIcon = L.divIcon({
              className: 'boundary-point-number',
              html: `<div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">${updatedPoints.length}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            const numberMarker = L.marker([newPoint.lat, newPoint.lon], { icon: numberIcon }).addTo(map.current);
            (numberMarker as any).isBoundaryMarker = true;

            markers.current.push(marker);
            markers.current.push(numberMarker);

            // Draw lines between points
            if (updatedPoints.length > 1) {
              const lineCoords = updatedPoints.map(p => [p.lat, p.lon]);
              L.polyline(lineCoords, { color: '#007bff', weight: 2 }).addTo(map.current);
            }

            // Auto-close polygon when 4 points are selected
            if (updatedPoints.length === 4) {
              const polygonCoords = [...updatedPoints, updatedPoints[0]];
              const polygonLatLngs = polygonCoords.map(p => [p.lat, p.lon]);

              polygon.current = L.polygon(polygonLatLngs, { color: '#28a745', weight: 2, fillColor: '#28a745', fillOpacity: 0.3 }).addTo(map.current);
              setDrawingMode(false);

              const geoJsonPolygon: FarmBoundary = {
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    ...updatedPoints.map(p => [p.lon, p.lat]),
                    [updatedPoints[0].lon, updatedPoints[0].lat]
                  ]]
                },
                center: {
                  lat: updatedPoints.reduce((sum, p) => sum + p.lat, 0) / updatedPoints.length,
                  lon: updatedPoints.reduce((sum, p) => sum + p.lon, 0) / updatedPoints.length
                }
              };
              onBoundaryChange?.(geoJsonPolygon);
            }
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showMap]);

  // Update map center when location changes
  useEffect(() => {
    if (currentLocation && map.current) {
      const newCenter: [number, number] = [currentLocation.lat, currentLocation.lon];
      setMapCenter(newCenter);
      map.current.setView(newCenter, 15);
      
      // Clear existing markers except boundary markers
      markers.current.forEach(marker => {
        if (!marker.isBoundaryMarker) {
          map.current.removeLayer(marker);
        }
      });
      markers.current = markers.current.filter(marker => marker.isBoundaryMarker);
      
      // Add new marker for current location
      if (typeof window !== 'undefined' && (window as any).L) {
        const L = (window as any).L;
        const mkIcon = L.divIcon({
          className: 'boundary-pin',
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.2);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([currentLocation.lat, currentLocation.lon], { icon: mkIcon })
          .addTo(map.current)
          .bindPopup(`Current Location<br/>Lat: ${currentLocation.lat.toFixed(6)}<br/>Lon: ${currentLocation.lon.toFixed(6)}`)
          .openPopup();
        (marker as any).isBoundaryMarker = false;
        markers.current.push(marker);
      }
    }
  }, [currentLocation]);

  const handleGetLocation = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (!isSecure) {
        alert('Geolocation requires HTTPS or localhost. Please use HTTPS or try the manual coordinate entry option.');
        return;
      }
      
      const location = await getCurrentLocation();
      onLocationChange(location);
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    
    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid coordinates.');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90.');
      return;
    }
    
    if (lon < -180 || lon > 180) {
      alert('Longitude must be between -180 and 180.');
      return;
    }
    
    const location = setManualLocation(lat, lon);
    onLocationChange(location);
    
    // Update map center if map is visible
    if (showMap && map.current) {
      const newCenter: [number, number] = [lat, lon];
      setMapCenter(newCenter);
      map.current.setView(newCenter, 15);
      
      // Clear existing markers except boundary markers
      markers.current.forEach(marker => {
        if (!marker.isBoundaryMarker) {
          map.current.removeLayer(marker);
        }
      });
      markers.current = markers.current.filter(marker => marker.isBoundaryMarker);
      
      // Add new marker for current location
      if (typeof window !== 'undefined' && (window as any).L) {
        const L = (window as any).L;
        const marker = L.marker([lat, lon])
          .addTo(map.current)
          .bindPopup(`Manual Location<br/>Lat: ${lat.toFixed(6)}<br/>Lon: ${lon.toFixed(6)}`)
          .openPopup();
        marker.isBoundaryMarker = false;
        markers.current.push(marker);
      }
    }
    
    setShowManualInput(false);
    setManualLat('');
    setManualLon('');
  };

  const handleClearLocation = () => {
    clearLocation();
    onLocationChange(null as any);
  };

  const startDrawingBoundary = () => {
    if (boundaryPoints.length > 0) {
      resetBoundary();
    }
    setDrawingMode(true);
  };

  const resetBoundary = () => {
    setBoundaryPoints([]);
    setDrawingMode(false);
    
    // Clear map elements
    if (map.current) {
      markers.current.forEach(marker => map.current.removeLayer(marker));
      markers.current = [];
      
      if (polygon.current) {
        map.current.removeLayer(polygon.current);
        polygon.current = null;
      }
      
      // Clear all polylines
      map.current.eachLayer((layer: any) => {
        if (layer instanceof (window as any).L.Polyline) {
          map.current.removeLayer(layer);
        }
      });
    }
    
    onBoundaryChange?.(null);
  };

  const isBoundaryComplete = boundaryPoints.length === 4;

  return (
    <div className="space-y-4">
      {/* Location Button */}
      <button
        onClick={handleGetLocation}
        disabled={disabled || loading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="loading-spinner w-4 h-4" />
            <span>Getting Location...</span>
          </>
        ) : (
          <>
            <MapPinIcon className="w-5 h-5" />
            <span>Get My Location</span>
          </>
        )}
      </button>

      {/* Success State */}
      {success && location && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <MapPinIcon className="w-5 h-5" />
            <span className="font-medium">Location Found!</span>
            <button
              onClick={handleClearLocation}
              className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-green-700 dark:text-green-300 font-mono">
            Lat: {location.lat.toFixed(6)}, Lon: {location.lon.toFixed(6)}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <XMarkIcon className="w-5 h-5" />
            <span className="font-medium">Location Error</span>
          </div>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          <button
            onClick={retry}
            className="mt-2 btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Manual Input Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline transition-colors"
        >
          {showManualInput ? 'Cancel' : 'Enter coordinates manually'}
        </button>
      </div>

      {/* Manual Input */}
      {showManualInput && (
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 rounded-lg space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-50">Manual Location Entry</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Latitude
              </label>
              <input
                type="number"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="e.g., 28.6139"
                step="0.000001"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                Longitude
              </label>
              <input
                type="number"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                placeholder="e.g., 77.2090"
                step="0.000001"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleManualLocation}
              className="btn-primary flex-1"
            >
              Use These Coordinates
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Map Toggle */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Select a Polygon on Map
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Draw your farm boundary for more accurate analysis
            </p>
          </div>
          
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
          >
            <MapPinIcon className="w-4 h-4" />
            {showMap ? 'Hide Map' : 'Open Map'}
          </button>
        </div>
        
        {currentLocation && (
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Current Location:</span> {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      {showMap && (
        <div className="space-y-4">
          <div className="h-80 border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '320px' }} />
          </div>
          
          {/* Boundary Drawing Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-50">Farm Boundary Selection</h4>
              {boundaryPoints.length > 0 && (
                <button
                  onClick={resetBoundary}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Reset Boundary
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={startDrawingBoundary}
                disabled={drawingMode || isBoundaryComplete}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PencilIcon className="w-4 h-4" />
                {drawingMode ? 'Click 4 points on map' : 'Draw Farm Boundary'}
              </button>
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Boundary Points:</strong> {boundaryPoints.length}/4
              </div>
            </div>
            
            {drawingMode && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Drawing Mode Active:</strong> Click on the map to place boundary points. 
                  You need exactly 4 points to complete the farm boundary.
                </div>
              </div>
            )}
            
            {isBoundaryComplete && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <strong>✓ Farm boundary complete!</strong> The polygon has been drawn and is ready for risk analysis.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Text */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <GlobeAltIcon className="w-4 h-4 inline mr-1" />
        We'll use your GPS location for accurate environmental data. 
        <strong className="text-gray-900 dark:text-gray-100"> Note:</strong> Requires HTTPS for geolocation.
      </div>
    </div>
  );
}
