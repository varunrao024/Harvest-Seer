import { useState, useEffect, useCallback } from 'react';
import { Crop } from '@/types';
import { apiClient } from '@/lib/api';

interface CropsState {
  crops: Crop[];
  loading: boolean;
  error: string | null;
}

export const useCrops = () => {
  const [state, setState] = useState<CropsState>({
    crops: [],
    loading: false,
    error: null,
  });

  const fetchCrops = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const crops = await apiClient.getCrops();
      
      setState({
        crops,
        loading: false,
        error: null,
      });

      return crops;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch crops';
      
      setState({
        crops: [],
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  const retry = useCallback(() => {
    return fetchCrops();
  }, [fetchCrops]);

  // Auto-fetch crops on mount
  useEffect(() => {
    fetchCrops().catch(console.error);
  }, [fetchCrops]);

  return {
    ...state,
    fetchCrops,
    retry,
  };
};
