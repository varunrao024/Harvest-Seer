export interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: number;
}

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface FarmBoundary {
  geometry: PolygonGeometry;
  center?: Location;
}

export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  moisture: number;
  ndvi: number;
  rainfall_index: number;
}

export interface RiskAssessment {
  success: boolean;
  location: string;
  crop: string;
  risk_score: number;
  risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk';
  formula_weights: Record<string, number>;
  current_values: EnvironmentalData;
  environmental_data?: EnvironmentalData; // Optional environmental data
  factor_risks: Record<string, number>;
  weakest_factor: string;
  recommendations: Recommendation[];
  optimal_ranges: Record<string, string>;
  comparison: Record<string, any>;
}

export interface Recommendation {
  issue: string;
  recommendation: string;
  message?: string;
  priority: number | string;
  risk_level: 'Low' | 'Medium' | 'High';
  actions?: string[];
  expected_improvement?: string;
}

export interface Crop {
  name: string;
  category: string;
  display_name: string;
}

export interface CropInfo {
  crop: string;
  data: {
    category: string;
    optimal_temp: number;
    temp_tolerance: number;
    optimal_moisture: number;
    moisture_tolerance: number;
    optimal_humidity: number;
    humidity_tolerance: number;
    optimal_ndvi: number;
    ndvi_tolerance: number;
    optimal_rainfall: number;
    rainfall_tolerance: number;
  };
  optimal_ranges: Record<string, string>;
}

export interface GeolocationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  location: Location | null;
}

export interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  onLocationSelect?: (location: Location) => void;
}

export interface RiskGaugeProps {
  score: number;
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface EnvironmentalDataCardProps {
  data?: EnvironmentalData;
  optimalRanges?: Record<string, string>;
}

export interface RecommendationCardProps {
  recommendations: Recommendation[];
}

export interface FactorChartProps {
  factorRisks: Record<string, number>;
  weights: Record<string, number>;
}

export interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  currentLocation?: Location | null;
  disabled?: boolean;
}

export interface CropSelectorProps {
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  disabled?: boolean;
}

export interface RiskAssessmentFormProps {
  onSubmit: (data: { location: Location; crop: string; manualData?: Partial<EnvironmentalData> }) => void;
  loading?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
