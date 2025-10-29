import axios from 'axios';
import { RiskAssessment, Crop, CropInfo, EnvironmentalData, ApiResponse, FarmBoundary } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Get available crops
  async getCrops(): Promise<Crop[]> {
    try {
      const response = await api.get('/crops');
      return response.data.crops || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch crops: ${error.message}`);
    }
  },

  // Get environmental data for a location (with optional polygon for NDVI)
  async getEnvironmentalData(location: string, polygon?: number[][]): Promise<EnvironmentalData> {
    try {
      let response;
      
      // If polygon coordinates are provided, use POST to send them for Ambee NDVI API
      if (polygon && polygon.length >= 3) {
        response = await api.post('/environmental-data', { polygon }, {
          params: { location }
        });
      } else {
        // Otherwise use GET (will use fallback NDVI)
        response = await api.get('/environmental-data', {
          params: { location }
        });
      }
      
      const raw = response.data.data;
      // Normalize naming differences from backend
      const normalized: EnvironmentalData = {
        temperature: raw.temperature,
        humidity: raw.humidity,
        moisture: raw.moisture ?? raw.soil_moisture,
        ndvi: raw.ndvi,
        rainfall_index: raw.rainfall_index,
      };
      return normalized;
    } catch (error: any) {
      throw new Error(`Failed to fetch environmental data: ${error.message}`);
    }
  },

  // Assess crop risk
  async assessRisk(data: {
    location: string;
    crop: string;
    temperature?: number;
    humidity?: number;
    moisture?: number;
    ndvi?: number;
    rainfall?: number;
    boundary?: FarmBoundary;
  }): Promise<RiskAssessment> {
    try {
      const response = await api.post('/assess-risk', data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Risk assessment failed: ${error.message}`);
    }
  },

  // Get crop information
  async getCropInfo(crop: string): Promise<CropInfo> {
    try {
      const response = await api.get(`/crop-info/${crop}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch crop info: ${error.message}`);
    }
  },

  // Get risk formula for a crop
  async getRiskFormula(crop: string): Promise<any> {
    try {
      const response = await api.get(`/risk-formula/${crop}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch risk formula: ${error.message}`);
    }
  },
};

export default apiClient;
