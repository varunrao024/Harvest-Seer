'use client';

import { useState } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('trends');

  // Simulated trend data
  const trendData = [
    { month: 'Jan', risk: 45, yield: 3.2, temperature: 18 },
    { month: 'Feb', risk: 52, yield: 3.0, temperature: 22 },
    { month: 'Mar', risk: 68, yield: 2.8, temperature: 28 },
    { month: 'Apr', risk: 75, yield: 2.5, temperature: 32 },
    { month: 'May', risk: 82, yield: 2.2, temperature: 36 },
    { month: 'Jun', risk: 71, yield: 2.6, temperature: 34 },
    { month: 'Jul', risk: 58, yield: 2.9, temperature: 30 },
    { month: 'Aug', risk: 49, yield: 3.1, temperature: 28 },
  ];

  // Correlation data
  const correlationData = [
    { temperature: 18, yield: 3.2, risk: 45 },
    { temperature: 22, yield: 3.0, risk: 52 },
    { temperature: 28, yield: 2.8, risk: 68 },
    { temperature: 32, yield: 2.5, risk: 75 },
    { temperature: 36, yield: 2.2, risk: 82 },
    { temperature: 34, yield: 2.6, risk: 71 },
    { temperature: 30, yield: 2.9, risk: 58 },
    { temperature: 28, yield: 3.1, risk: 49 },
  ];

  // Prediction data
  const predictionData = [
    { day: 'Day 1', predicted: 72, confidence: 95 },
    { day: 'Day 2', predicted: 74, confidence: 92 },
    { day: 'Day 3', predicted: 69, confidence: 88 },
    { day: 'Day 4', predicted: 71, confidence: 85 },
    { day: 'Day 5', predicted: 76, confidence: 82 },
    { day: 'Day 6', predicted: 73, confidence: 79 },
    { day: 'Day 7', predicted: 70, confidence: 76 },
  ];

  const tabs = [
    { id: 'trends', label: 'Trend Analysis', icon: ArrowTrendingUpIcon },
    { id: 'correlation', label: 'Correlations', icon: ChartBarIcon },
    { id: 'prediction', label: 'Forecasting', icon: ArrowTrendingDownIcon },
  ];

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Advanced Analytics Dashboard
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Statistical analysis and predictive modeling
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Risk & Yield Trends Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Risk Score (%)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Yield (t/ha)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-200">Peak Risk Period</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">April-May</div>
              <div className="text-sm text-red-700 dark:text-red-300">82% max risk observed</div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingDownIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-200">Optimal Period</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">Jan-Feb</div>
              <div className="text-sm text-green-700 dark:text-green-300">3.2 t/ha peak yield</div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-800 dark:text-blue-200">Correlation</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">-0.89</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Risk vs Yield (strong negative)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Temperature vs Yield Correlation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="temperature" 
                    name="Temperature (°C)"
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <YAxis 
                    dataKey="yield" 
                    name="Yield (t/ha)"
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Scatter 
                    data={correlationData} 
                    fill="#8b5cf6"
                    name="Data Points"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correlation Matrix */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Correlation Matrix</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center font-medium">Factor</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center font-medium">Risk</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center font-medium">Yield</div>
              
              <div className="p-3 bg-white dark:bg-gray-700 rounded text-center">Temperature</div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded text-center text-red-600 dark:text-red-400 font-bold">+0.92</div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded text-center text-red-600 dark:text-red-400 font-bold">-0.89</div>
              
              <div className="p-3 bg-white dark:bg-gray-700 rounded text-center">Soil Moisture</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded text-center text-green-600 dark:text-green-400 font-bold">-0.76</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded text-center text-green-600 dark:text-green-400 font-bold">+0.82</div>
              
              <div className="p-3 bg-white dark:bg-gray-700 rounded text-center">NDVI</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded text-center text-green-600 dark:text-green-400 font-bold">-0.85</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded text-center text-green-600 dark:text-green-400 font-bold">+0.91</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prediction' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">7-Day Risk Forecast</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--tooltip-bg)', 
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="predicted" 
                    fill="#f59e0b"
                    name="Predicted Risk (%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prediction Confidence */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Model Confidence</h4>
            <div className="space-y-3">
              {predictionData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">{item.day}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm font-medium text-right">{item.confidence}%</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
