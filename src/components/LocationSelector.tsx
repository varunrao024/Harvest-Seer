'use client';

import { useState } from 'react';
import { MapPinIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Location } from '@/types';

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  currentLocation?: Location | null;
  disabled?: boolean;
}

export default function LocationSelector({
  onLocationChange,
  currentLocation,
  disabled = false,
}: LocationSelectorProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  
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

  const handleGetLocation = async () => {
    try {
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
    setShowManualInput(false);
    setManualLat('');
    setManualLon('');
  };

  const handleClearLocation = () => {
    clearLocation();
    onLocationChange(null as any);
  };

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

      {/* Info Text */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <GlobeAltIcon className="w-4 h-4 inline mr-1" />
        We'll use your GPS location for accurate environmental data. 
        <strong className="text-gray-900 dark:text-gray-100"> Note:</strong> Requires HTTPS for geolocation.
      </div>
    </div>
  );
}
