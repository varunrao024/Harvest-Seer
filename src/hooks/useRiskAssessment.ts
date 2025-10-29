import { useState, useCallback } from 'react';
import { RiskAssessment, Location, Crop, FarmBoundary } from '@/types';
import { apiClient } from '@/lib/api';

interface RiskAssessmentState {
  loading: boolean;
  data: RiskAssessment | null;
  error: string | null;
}

export const useRiskAssessment = () => {
  const [state, setState] = useState<RiskAssessmentState>({
    loading: false,
    data: null,
    error: null,
  });

  const assessRisk = useCallback(async (
    location: Location,
    crop: string,
    manualData?: Partial<any>,
    boundary?: FarmBoundary
  ): Promise<RiskAssessment> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const locationString = `${location.lat},${location.lon}`;
      
      const requestData = {
        location: locationString,
        crop,
        ...(manualData && Object.keys(manualData).length > 0 ? {
          temperature: manualData.temperature,
          humidity: manualData.humidity,
          moisture: manualData.moisture,
          ndvi: manualData.ndvi,
          rainfall: manualData.rainfall_index,
        } : {}),
        ...(boundary ? { boundary } : {}),
      };

      const result = await apiClient.assessRisk(requestData);
      
      setState({
        loading: false,
        data: result,
        error: null,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to assess risk';
      
      setState({
        loading: false,
        data: null,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  const clearAssessment = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    assessRisk,
    clearAssessment,
  };
};
