'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ModelPerformance() {
  // Training accuracy over epochs
  const trainingData = [
    { epoch: 1, training: 65, validation: 62 },
    { epoch: 5, training: 78, validation: 75 },
    { epoch: 10, training: 85, validation: 82 },
    { epoch: 15, training: 89, validation: 86 },
    { epoch: 20, training: 91, validation: 88 },
    { epoch: 25, training: 92, validation: 89 },
    { epoch: 30, training: 93, validation: 90 },
  ];

  // Feature importance
  const featureImportance = [
    { feature: 'Soil Moisture', importance: 28 },
    { feature: 'Temperature', importance: 25 },
    { feature: 'NDVI', importance: 20 },
    { feature: 'Humidity', importance: 15 },
    { feature: 'Rainfall', importance: 12 },
  ];

  // Model comparison
  const modelComparison = [
    { model: 'Random Forest', accuracy: 92.4, precision: 91.2, recall: 89.8, f1: 90.5 },
    { model: 'SVM', accuracy: 87.3, precision: 85.9, recall: 84.2, f1: 85.0 },
    { model: 'Neural Network', accuracy: 89.1, precision: 88.3, recall: 87.5, f1: 87.9 },
    { model: 'Decision Tree', accuracy: 82.6, precision: 81.4, recall: 80.1, f1: 80.7 },
  ];

  // Prediction confidence distribution
  const confidenceData = [
    { range: '90-100%', count: 156 },
    { range: '80-90%', count: 98 },
    { range: '70-80%', count: 45 },
    { range: '60-70%', count: 21 },
    { range: '<60%', count: 8 },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-6">
        🎯 Model Performance & Validation
      </h3>

      <div className="space-y-8">
        {/* Training Progress */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Training & Validation Accuracy
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="epoch" 
                  label={{ value: 'Training Epochs', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-gray-700 dark:text-gray-300"
                />
                <YAxis 
                  label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
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
                  dataKey="training" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Training Accuracy"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="validation" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Validation Accuracy"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Model converged after 30 epochs with minimal overfitting (gap: 2.4%)
          </p>
        </div>

        {/* Feature Importance */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Feature Importance Analysis
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  type="number"
                  label={{ value: 'Importance (%)', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-gray-700 dark:text-gray-300"
                />
                <YAxis 
                  type="category" 
                  dataKey="feature"
                  width={100}
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
                <Bar dataKey="importance" fill="#8b5cf6" name="Importance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Determined using Gini importance from Random Forest model
          </p>
        </div>

        {/* Model Comparison */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Algorithm Comparison
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Precision
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Recall
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    F1-Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {modelComparison.map((model, idx) => (
                  <tr key={model.model} className={idx === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {model.model}
                      {idx === 0 && <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Selected</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {model.accuracy}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {model.precision}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {model.recall}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300">
                      {model.f1}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Random Forest selected for best balance of accuracy and interpretability
          </p>
        </div>

        {/* Prediction Confidence */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Prediction Confidence Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="range"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-gray-700 dark:text-gray-300"
                  label={{ value: 'Confidence Range', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-gray-700 dark:text-gray-300"
                  label={{ value: 'Number of Predictions', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            75% of predictions have confidence ≥ 80%, indicating high model reliability
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5000+</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">Training Samples</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">12</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">Crop Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">100</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">Decision Trees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">98.2%</div>
            <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">Cross-Val Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
