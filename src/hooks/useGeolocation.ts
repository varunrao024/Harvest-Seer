import { useState, useCallback } from 'react';
import { Location, GeolocationState } from '@/types';

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    success: false,
    error: null,
    location: null,
  });

  const getCurrentLocation = useCallback(async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser.';
        setState(prev => ({ ...prev, error, loading: false }));
        reject(new Error(error));
        return;
      }

      // Check if we're on HTTPS (required for geolocation)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        const error = 'Geolocation requires HTTPS or localhost. Please use HTTPS or try manual coordinate entry.';
        setState(prev => ({ ...prev, error, loading: false }));
        reject(new Error(error));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const opts = { ...defaultOptions, ...options };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setState({
            loading: false,
            success: true,
            error: null,
            location,
          });

          resolve(location);
        },
        (error) => {
          let errorMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }

          setState({
            loading: false,
            success: false,
            error: errorMessage,
            location: null,
          });

          reject(new Error(errorMessage));
        },
        opts
      );
    });
  }, [options]);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    const location: Location = { lat, lon };
    
    setState({
      loading: false,
      success: true,
      error: null,
      location,
    });

    return location;
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      loading: false,
      success: false,
      error: null,
      location: null,
    });
  }, []);

  const retry = useCallback(() => {
    return getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    ...state,
    getCurrentLocation,
    setManualLocation,
    clearLocation,
    retry,
  };
};
