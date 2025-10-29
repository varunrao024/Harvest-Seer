'use client';

import { useState, useEffect } from 'react';
import InteractiveLocationSelector from '@/components/InteractiveLocationSelector';
import CropSelector from '@/components/CropSelector';
import RiskGauge from '@/components/RiskGauge';
import EnvironmentalDataCard from '@/components/EnvironmentalDataCard';
import RecommendationCard from '@/components/RecommendationCard';
import FactorChart from '@/components/FactorChart';
import DarkModeToggle from '@/components/DarkModeToggle';
import FormulaValidation from '@/components/FormulaValidation';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import WeatherForecast from '@/components/WeatherForecast';
import { useRiskAssessment } from '@/hooks/useRiskAssessment';
import { Location, RiskAssessment, FarmBoundary } from '@/types';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import { 
  MapPinIcon, 
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [farmBoundary, setFarmBoundary] = useState<FarmBoundary | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: assessment, loading, error, assessRisk } = useRiskAssessment();

  const location = farmBoundary?.center || selectedLocation;

  const handleLocationChange = (newLocation: Location) => {
    setSelectedLocation(newLocation);
    setFarmBoundary(null);
  };

  const handleBoundaryChange = (boundary: FarmBoundary | null) => {
    setFarmBoundary(boundary);
    setSelectedLocation(null);
  };

  const handleAssessRisk = async () => {
    if (!location) {
      alert('Please select a location first');
      return;
    }
    
    if (!selectedCrop) {
      alert('Please select a crop type');
      return;
    }
    
    if (!confirmed) {
      alert('Please confirm your selections before analyzing');
      return;
    }

    await assessRisk(location, selectedCrop);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-600 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Harvest Seer Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 transition-colors duration-300">
                  Harvest Seer
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-300 hidden sm:block">
                Agricultural Risk Analysis
              </div>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-700 ease-in-out ${
            assessment ? 'grid grid-cols-1 xl:grid-cols-3 gap-4' : 'flex justify-center'
          }`}>
          
          {/* Input Section */}
          <div className={`transition-all duration-700 ease-in-out ${
            assessment ? 'xl:col-span-1' : 'w-full max-w-2xl'
          }`}>
            <div className="space-y-4">
              {/* Location Selection */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Location & Crop Selection
                </h2>
                
                <div className="space-y-4">
                  <InteractiveLocationSelector
                    onLocationChange={handleLocationChange}
                    onBoundaryChange={handleBoundaryChange}
                    currentLocation={selectedLocation}
                    disabled={loading}
                  />
                  
                  {farmBoundary && farmBoundary.center && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            Farm boundary detected! Using center point for analysis.
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                            Lat: {farmBoundary.center.lat.toFixed(4)}, Lon: {farmBoundary.center.lon.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CropSelector
                    selectedCrop={selectedCrop}
                    onCropChange={setSelectedCrop}
                    disabled={loading}
                  />
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="confirmSelections"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="confirmSelections" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        ✓ I confirm the above location and crop selections
                      </label>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 ml-6">
                      Real-time environmental data will be fetched based on your selected location
                    </p>
                  </div>
                  
                  <button
                    onClick={handleAssessRisk}
                    disabled={loading || !location}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner w-4 h-4"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ChartBarIcon className="w-5 h-5" />
                        Analyze Risk
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Environmental Data Display */}
              {assessment && (
                <EnvironmentalDataCard
                  data={assessment.current_values}
                  optimalRanges={assessment.optimal_ranges}
                />
              )}
            </div>
          </div>
          
          {/* Results Section */}
          {assessment && (
            <div className="xl:col-span-2">
              {/* Compact Header */}
              <div className="card bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-700 mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  📊 Risk Analysis Results
                </h2>
              </div>

              {/* First Row: Risk Gauge - Full Width */}
              <div className="mb-4">
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                    Risk Assessment
                  </h3>
                  <div className="flex items-center justify-center">
                    <RiskGauge
                      score={Math.round(assessment.risk_score * 100)}
                      level={assessment.risk_level}
                      size="md"
                    />
                    <div className="ml-8">
                      <h4 className={`text-3xl font-bold ${
                        assessment.risk_level === 'Low Risk' ? 'text-green-600' :
                        assessment.risk_level === 'Medium Risk' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {Math.round(assessment.risk_score * 100)}%
                      </h4>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                        {assessment.risk_level}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row: Environmental Data - Full Width */}
              <div className="mb-4">
                {assessment.environmental_data && (
                  <EnvironmentalDataCard 
                    data={assessment.environmental_data}
                    optimalRanges={assessment.optimal_ranges}
                  />
                )}
              </div>

              {/* Third Row: Factor Analysis - Full Width */}
              <div className="mb-4">
                <FactorChart
                  factorRisks={assessment.factor_risks}
                  weights={assessment.formula_weights}
                />
              </div>

              {/* Fourth Row: Recommendations - Full Width */}
              <div className="mb-4">
                <RecommendationCard recommendations={assessment.recommendations} />
              </div>

              {/* Fifth Row: Advanced Analytics & Weather Side-by-Side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                <AdvancedAnalytics />
                <WeatherForecast />
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="xl:col-span-2">
              <div className="card">
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Assessment Failed
                  </h3>
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={handleAssessRisk}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        
        {/* Full Width Components - Matching main content width */}
        {assessment && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Formula Validation - Full Width */}
            <div>
              <FormulaValidation />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

