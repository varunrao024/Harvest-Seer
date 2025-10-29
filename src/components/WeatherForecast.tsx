'use client';

import { useState } from 'react';
import { CloudIcon, SunIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function WeatherForecast() {
  const [selectedDay, setSelectedDay] = useState(0);

  // Simulated 7-day weather forecast with risk implications
  const forecastData = [
    {
      day: 'Today',
      date: 'Oct 26',
      temp: { high: 32, low: 18 },
      humidity: 65,
      rainfall: 0,
      condition: 'Sunny',
      icon: SunIcon,
      riskImpact: 'High',
      riskChange: '+8%',
      alerts: ['Heat stress warning for crops']
    },
    {
      day: 'Tomorrow',
      date: 'Oct 27',
      temp: { high: 34, low: 20 },
      humidity: 70,
      rainfall: 0,
      condition: 'Partly Cloudy',
      icon: CloudIcon,
      riskImpact: 'High',
      riskChange: '+12%',
      alerts: ['Critical temperature threshold']
    },
    {
      day: 'Day 3',
      date: 'Oct 28',
      temp: { high: 29, low: 16 },
      humidity: 55,
      rainfall: 5,
      condition: 'Light Rain',
      icon: CloudIcon,
      riskImpact: 'Medium',
      riskChange: '-15%',
      alerts: ['Improved soil moisture expected']
    },
    {
      day: 'Day 4',
      date: 'Oct 29',
      temp: { high: 26, low: 14 },
      humidity: 60,
      rainfall: 12,
      condition: 'Moderate Rain',
      icon: CloudIcon,
      riskImpact: 'Low',
      riskChange: '-25%',
      alerts: ['Optimal growing conditions']
    },
    {
      day: 'Day 5',
      date: 'Oct 30',
      temp: { high: 28, low: 16 },
      humidity: 58,
      rainfall: 2,
      condition: 'Sunny',
      icon: SunIcon,
      riskImpact: 'Low',
      riskChange: '-5%',
      alerts: ['Stable conditions']
    },
    {
      day: 'Day 6',
      date: 'Oct 31',
      temp: { high: 30, low: 18 },
      humidity: 62,
      rainfall: 0,
      condition: 'Clear',
      icon: SunIcon,
      riskImpact: 'Medium',
      riskChange: '+10%',
      alerts: ['Monitor soil moisture']
    },
    {
      day: 'Day 7',
      date: 'Nov 1',
      temp: { high: 31, low: 19 },
      humidity: 64,
      rainfall: 0,
      condition: 'Sunny',
      icon: SunIcon,
      riskImpact: 'Medium',
      riskChange: '+8%',
      alerts: ['Consider irrigation']
    }
  ];

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskBg = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'Medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'Low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="card">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-1 flex items-center gap-2">
          <CloudIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Weather Forecast
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          7-day outlook with risk impact
        </p>
      </div>

      {/* Compact Weather Cards */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {forecastData.map((day, index) => {
          const IconComponent = day.icon;
          const isSelected = selectedDay === index;
          return (
            <div
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`p-2 rounded border cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="text-center">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{day.day.slice(0, 3)}</div>
                <IconComponent className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {day.temp.high}°
                </div>
                <div className={`text-xs font-medium ${getRiskColor(day.riskImpact)}`}>
                  {day.riskImpact.slice(0, 1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Selected Day Details */}
      {selectedDay !== null && (
        <div className={`p-2 rounded border ${getRiskBg(forecastData[selectedDay].riskImpact)}`}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-50 mb-1">
                {forecastData[selectedDay].day}
              </div>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>{forecastData[selectedDay].condition}</div>
                <div>{forecastData[selectedDay].temp.high}°/{forecastData[selectedDay].temp.low}°C</div>
                <div>{forecastData[selectedDay].humidity}% humidity</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-50 mb-1">Risk Impact</div>
              <div className="space-y-1">
                <div className={`font-bold ${getRiskColor(forecastData[selectedDay].riskImpact)}`}>
                  {forecastData[selectedDay].riskImpact} ({forecastData[selectedDay].riskChange})
                </div>
                {forecastData[selectedDay].alerts.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    • {forecastData[selectedDay].alerts[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Weekly Summary */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700 text-center">
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {Math.round(forecastData.reduce((sum, day) => sum + day.temp.high, 0) / forecastData.length)}°C
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Avg Temp</div>
        </div>
        
        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded border border-cyan-200 dark:border-cyan-700 text-center">
          <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
            {forecastData.reduce((sum, day) => sum + day.rainfall, 0)}mm
          </div>
          <div className="text-xs text-cyan-700 dark:text-cyan-300">Rainfall</div>
        </div>
        
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700 text-center">
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {forecastData.filter(day => day.riskImpact === 'High').length}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300">High Risk</div>
        </div>
      </div>
      
      {/* Weather Alerts & Recommendations */}
      <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
        <h4 className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">Weather Advisory</h4>
        <ul className="space-y-1 text-xs text-orange-800 dark:text-orange-200">
          <li>• Monitor temperature fluctuations this week</li>
          <li>• Prepare for potential rainfall variations</li>
          <li>• Check irrigation schedule based on forecast</li>
        </ul>
      </div>
    </div>
  );
}
