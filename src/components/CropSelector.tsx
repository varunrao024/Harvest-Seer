'use client';

import { CropSelectorProps } from '@/types';
import { useCrops } from '@/hooks/useCrops';
import { ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function CropSelector({
  selectedCrop,
  onCropChange,
  disabled = false,
}: CropSelectorProps) {
  const { crops, loading, error, retry } = useCrops();

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-medium">Failed to load crops</span>
          </div>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
          <button
            onClick={retry}
            className="mt-2 btn-secondary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
        Crop Type
      </label>
      
      <div className="relative">
        <select
          value={selectedCrop}
          onChange={(e) => onCropChange(e.target.value)}
          disabled={disabled || loading}
          className="input-field appearance-none pr-10"
        >
          <option value="">
            {loading ? 'Loading crops...' : 'Select a crop...'}
          </option>
          {crops.map((crop) => (
            <option key={crop.name} value={crop.name}>
              {crop.display_name}
            </option>
          ))}
        </select>
        
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="loading-spinner w-4 h-4" />
          <span>Loading crops...</span>
        </div>
      )}
      
      {selectedCrop && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-200">
            <strong>Selected:</strong> {crops.find(c => c.name === selectedCrop)?.display_name}
          </div>
        </div>
      )}
    </div>
  );
}
