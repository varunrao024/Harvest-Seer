'use client';

import { useState, useEffect } from 'react';
import { SignalIcon, CloudIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function RealTimeDataStream() {
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newDataPoint = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        source: ['Weather API', 'Sentinel-2', 'Ground Sensors'][Math.floor(Math.random() * 3)],
        metric: ['Temperature', 'NDVI', 'Soil Moisture', 'Humidity'][Math.floor(Math.random() * 4)],
        value: (Math.random() * 100).toFixed(1),
        status: 'received',
      };

      setDataPoints((prev) => [newDataPoint, ...prev].slice(0, 8));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getSourceIcon = (source: string) => {
    if (source.includes('Weather')) return <CloudIcon className="w-4 h-4" />;
    if (source.includes('Sentinel')) return <GlobeAltIcon className="w-4 h-4" />;
    return <SignalIcon className="w-4 h-4" />;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          Real-Time Data Stream
        </h3>
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-sm px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {dataPoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            {isLive ? 'Waiting for data...' : 'Paused'}
          </div>
        ) : (
          dataPoints.map((point) => (
            <div
              key={point.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 animate-fade-in"
            >
              <div className="text-green-600 dark:text-green-400">
                {getSourceIcon(point.source)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {point.metric}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {point.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {point.source}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    {point.value}
                  </span>
                </div>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ OK
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dataPoints.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Recent Updates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              3
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Data Sources</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              99.8%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
