'use client';

import { useState } from 'react';
import { MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function RiskHeatmap() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Simulated district risk data
  const districtData = [
    { name: 'Ludhiana', risk: 72, color: 'bg-red-500', position: 'top-4 left-8' },
    { name: 'Amritsar', risk: 45, color: 'bg-yellow-500', position: 'top-2 left-4' },
    { name: 'Jalandhar', risk: 38, color: 'bg-green-500', position: 'top-6 left-12' },
    { name: 'Patiala', risk: 68, color: 'bg-red-500', position: 'top-8 left-6' },
    { name: 'Bathinda', risk: 55, color: 'bg-yellow-500', position: 'top-12 left-8' },
    { name: 'Mohali', risk: 32, color: 'bg-green-500', position: 'top-4 left-14' },
    { name: 'Hoshiarpur', risk: 41, color: 'bg-yellow-500', position: 'top-6 left-16' },
    { name: 'Kapurthala', risk: 29, color: 'bg-green-500', position: 'top-8 left-10' },
  ];

  const getRiskLevel = (risk: number) => {
    if (risk >= 60) return 'High Risk';
    if (risk >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Regional Risk Heatmap
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Interactive map showing risk levels across different districts
        </p>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg h-64 mb-4 overflow-hidden border-2 border-gray-200 dark:border-gray-600">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700"></div>
        
        {/* District Markers */}
        {districtData.map((district) => (
          <div
            key={district.name}
            className={`absolute ${district.position} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110`}
            onClick={() => setSelectedDistrict(selectedDistrict === district.name ? null : district.name)}
          >
            <div className={`w-4 h-4 ${district.color} rounded-full border-2 border-white shadow-lg animate-pulse`}></div>
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {district.name}: {district.risk}%
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg text-xs">
          <div className="font-semibold mb-1">Risk Levels</div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High (60%+)</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium (40-59%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* District Details */}
      {selectedDistrict && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            {selectedDistrict} District Analysis
          </h4>
          {(() => {
            const district = districtData.find(d => d.name === selectedDistrict);
            if (!district) return null;
            return (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-blue-800 dark:text-blue-200 font-medium">Risk Score:</div>
                  <div className="text-lg font-bold">{district.risk}%</div>
                </div>
                <div>
                  <div className="text-blue-800 dark:text-blue-200 font-medium">Risk Level:</div>
                  <div className={`font-semibold ${
                    district.risk >= 60 ? 'text-red-600' :
                    district.risk >= 40 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getRiskLevel(district.risk)}
                  </div>
                </div>
                <div>
                  <div className="text-blue-800 dark:text-blue-200 font-medium">Primary Factors:</div>
                  <div className="text-xs">Temperature, Soil Moisture</div>
                </div>
                <div>
                  <div className="text-blue-800 dark:text-blue-200 font-medium">Affected Area:</div>
                  <div className="text-xs">~{Math.round(district.risk * 10)} km²</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {districtData.filter(d => d.risk >= 60).length}
          </div>
          <div className="text-xs text-red-700 dark:text-red-300">High Risk Districts</div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {districtData.filter(d => d.risk >= 40 && d.risk < 60).length}
          </div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Medium Risk Districts</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {districtData.filter(d => d.risk < 40).length}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">Low Risk Districts</div>
        </div>
      </div>
    </div>
  );
}
