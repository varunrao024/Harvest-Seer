'use client';

import { useState } from 'react';
import { CpuChipIcon, LightBulbIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AIExplainer() {
  const [activeScenario, setActiveScenario] = useState('current');

  // Feature importance data
  const featureImportance = [
    { feature: 'Temperature', importance: 0.35, contribution: '+28%' },
    { feature: 'Soil Moisture', importance: 0.28, contribution: '-12%' },
    { feature: 'NDVI', importance: 0.22, contribution: '-8%' },
    { feature: 'Humidity', importance: 0.15, contribution: '+6%' },
  ];

  // Decision path visualization
  const decisionPath = [
    { step: 1, condition: 'Temperature > 30°C', result: 'Risk +25%', confidence: 0.92 },
    { step: 2, condition: 'Soil Moisture < 0.4', result: 'Risk +20%', confidence: 0.88 },
    { step: 3, condition: 'NDVI < 0.6', result: 'Risk +15%', confidence: 0.85 },
    { step: 4, condition: 'Humidity > 60%', result: 'Risk +8%', confidence: 0.82 },
  ];

  // What-if scenarios
  const scenarios = {
    current: {
      name: 'Current Conditions',
      temperature: 32,
      moisture: 0.35,
      ndvi: 0.52,
      humidity: 65,
      riskScore: 72,
      confidence: 0.89
    },
    optimized: {
      name: 'With Irrigation',
      temperature: 32,
      moisture: 0.65,
      ndvi: 0.52,
      humidity: 65,
      riskScore: 45,
      confidence: 0.91
    },
    worstCase: {
      name: 'Heat Wave Scenario',
      temperature: 38,
      moisture: 0.25,
      ndvi: 0.45,
      humidity: 70,
      riskScore: 89,
      confidence: 0.94
    }
  };

  const currentScenario = scenarios[activeScenario as keyof typeof scenarios];

  // SHAP-like values (simplified)
  const shapValues = [
    { factor: 'Temperature', value: 0.18, color: '#ef4444' },
    { factor: 'Soil Moisture', value: -0.08, color: '#10b981' },
    { factor: 'NDVI', value: -0.05, color: '#10b981' },
    { factor: 'Humidity', value: 0.03, color: '#ef4444' },
    { factor: 'Base Risk', value: 0.42, color: '#6b7280' },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="card">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 mb-1 flex items-center gap-2">
          <CpuChipIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          AI Model Explainability
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          How AI makes risk predictions
        </p>
      </div>

      {/* Model Confidence */}
      <div className="mb-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded border border-indigo-200 dark:border-indigo-700">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">Confidence</h4>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round(currentScenario.confidence * 100)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${currentScenario.confidence * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Feature Importance - Compact */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-50 mb-2">Feature Importance</h4>
        <div className="h-40 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImportance} layout="horizontal" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" stroke="transparent" />
              <XAxis 
                type="number"
                domain={[0, 0.4]}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <YAxis 
                type="category"
                dataKey="feature"
                width={70}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
              />
              <Tooltip 
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#ffffff' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Bar 
                dataKey="importance" 
                fill="#8b5cf6"
                radius={[0, 2, 2, 0]}
                label={{ position: 'right', fontSize: 10, fill: '#6b7280' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Feature Contributions - Compact */}
        <div className="grid grid-cols-2 gap-1">
          {featureImportance.map((item, index) => (
            <div key={index} className="p-1 bg-gray-50 dark:bg-gray-800 rounded text-center">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.feature}</div>
              <div className={`text-sm font-bold ${
                item.contribution.startsWith('+') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {item.contribution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Scenarios - Compact */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-50 mb-2">Scenarios</h4>
        
        {/* Scenario Selector */}
        <div className="flex space-x-1 mb-2">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setActiveScenario(key)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                activeScenario === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {scenario.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Scenario Results */}
        <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded border border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {currentScenario.riskScore}%
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">Risk Score</div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {currentScenario.name}
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights - Compact */}
      <div>
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-50 mb-2">Key Insights</h4>
        <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-1">
            <span className="text-red-500">•</span>
            <span>Temperature is primary risk driver</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-green-500">•</span>
            <span>Soil moisture significantly affects risk</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-blue-500">•</span>
            <span>NDVI indicates vegetation stress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
