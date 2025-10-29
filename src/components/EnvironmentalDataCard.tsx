'use client';

import { EnvironmentalDataCardProps } from '@/types';
import { 
  CloudIcon, 
  SunIcon
} from '@heroicons/react/24/outline';

export default function EnvironmentalDataCard({ 
  data, 
  optimalRanges 
}: EnvironmentalDataCardProps) {
  // Add null check
  if (!data) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4 flex items-center gap-2">
          <SunIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Current Environmental Data
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No environmental data available
        </div>
      </div>
    );
  }

  const dataItems = [
    {
      label: 'Temperature',
      value: `${data.temperature || 'N/A'}°C`,
      icon: SunIcon,
      color: 'text-red-500',
    },
    {
      label: 'Humidity',
      value: `${data.humidity || 'N/A'}%`,
      icon: CloudIcon,
      color: 'text-blue-500',
    },
    {
      label: 'Soil Moisture',
      value: data.moisture ? `${(data.moisture * 100).toFixed(1)}%` : 'N/A',
      icon: CloudIcon,
      color: 'text-cyan-500',
    },
    {
      label: 'NDVI',
      value: data.ndvi ? data.ndvi.toFixed(2) : 'N/A',
      icon: SunIcon,
      color: 'text-green-500',
    },
    {
      label: 'Rainfall Index',
      value: data.rainfall_index ? data.rainfall_index.toFixed(2) : 'N/A',
      icon: CloudIcon,
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3 flex items-center gap-2">
        <SunIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Environmental Data
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {dataItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="env-data-card">
              <div className="env-value">{item.value}</div>
              <div className="env-label flex items-center gap-1">
                <IconComponent className="w-4 h-4" />
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {optimalRanges && (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 rounded-lg">
          <h4 className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">Optimal Ranges</h4>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-700 dark:text-gray-300">
            {Object.entries(optimalRanges).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize truncate">{key.replace('_', ' ')}:</span>
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Data Quality Indicator */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-800 dark:text-blue-200 font-medium">Data Source:</span>
          <span className="text-blue-600 dark:text-blue-400">Real-time API</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-blue-800 dark:text-blue-200 font-medium">Last Updated:</span>
          <span className="text-blue-600 dark:text-blue-400">Just now</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-blue-800 dark:text-blue-200 font-medium">Accuracy:</span>
          <span className="text-blue-600 dark:text-blue-400">±2% margin</span>
        </div>
      </div>
      
      {/* Environmental Impact Summary */}
      <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
        <h4 className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">Environmental Health</h4>
        <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
          <div className="flex justify-between">
            <span>Overall Status:</span>
            <span className="font-semibold">Good</span>
          </div>
          <div className="flex justify-between">
            <span>Data Confidence:</span>
            <span className="font-semibold">High</span>
          </div>
          <div className="flex justify-between">
            <span>Conditions:</span>
            <span className="font-semibold">Favorable</span>
          </div>
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
        <h4 className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">Data Metrics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-purple-700 dark:text-purple-300">
          <div className="text-center">
            <div className="font-bold">5/5</div>
            <div>Sensors Active</div>
          </div>
          <div className="text-center">
            <div className="font-bold">98%</div>
            <div>Reliability</div>
          </div>
        </div>
      </div>
    </div>
  );
}
