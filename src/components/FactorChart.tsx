'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FactorChartProps } from '@/types';

export default function FactorChart({ factorRisks, weights }: FactorChartProps) {
  // Handle undefined/null values
  if (!factorRisks || !weights) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Factor Analysis</h3>
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No risk data available. Please analyze risk first.
        </div>
      </div>
    );
  }

  const data = Object.entries(factorRisks).map(([factor, risk]) => ({
    factor: factor.charAt(0).toUpperCase() + factor.slice(1),
    risk: Math.round((risk || 0) * 100),
    weight: Math.round((weights[factor] || 0) * 100),
  }));

  const getBarColor = (risk: number) => {
    if (risk < 30) return '#22c55e'; // Green for low risk
    if (risk < 60) return '#f59e0b'; // Yellow for medium risk
    return '#ef4444'; // Red for high risk
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">Factor Analysis</h3>
      
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" stroke="transparent" />
            <XAxis 
              dataKey="factor" 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-700 dark:text-gray-300"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'currentColor' }}
              className="text-gray-700 dark:text-gray-300"
              label={{ value: 'Risk %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '12px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Bar dataKey="risk" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex justify-center gap-4 text-xs text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span>Low (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
          <span>Medium (30-60%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
          <span>High (&gt;60%)</span>
        </div>
      </div>
      
      {/* Factor Details - Horizontal Layout */}
      <div className="mt-3">
        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-50 mb-2">Details:</h4>
        <div className="grid grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600 rounded text-xs">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.factor}</span>
              <div className="flex items-center gap-1">
                <span className={`px-1 py-0.5 rounded ${
                  item.risk < 30 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                  item.risk < 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  {item.risk}%
                </span>
                <span className="text-gray-600 dark:text-gray-400">W:{item.weight}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
