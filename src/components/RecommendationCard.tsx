'use client';

import { RecommendationCardProps } from '@/types';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  LightBulbIcon 
} from '@heroicons/react/24/outline';

export default function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            No Recommendations Needed
          </h3>
          <p className="text-green-600 dark:text-green-300">
            Your crop conditions are optimal! Continue current practices and monitor regularly.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityClass = (priority: string | number, riskLevel?: string) => {
    // If explicit low risk, force green styling even if priority text/number is inconsistent
    if (riskLevel && riskLevel.toLowerCase().includes('low')) {
      return 'border-l-4 border-green-500 bg-green-50 p-4 rounded-lg';
    }

    const priorityStr = typeof priority === 'string' ? priority.toLowerCase() : '';
    const priorityNum = typeof priority === 'number' ? priority : 0;
    
    if (priorityStr === 'high' || priorityNum > 0.7) return 'border-l-4 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg';
    if (priorityStr === 'medium' || priorityNum > 0.4) return 'border-l-4 border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg';
    return 'border-l-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg';
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    if (!riskLevel) return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    const level = riskLevel.toLowerCase();
    if (level.includes('high')) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
    if (level.includes('medium')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
    if (level.includes('low')) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700';
  };

  const getPriorityIcon = (priority: string | number) => {
    const priorityStr = typeof priority === 'string' ? priority.toLowerCase() : '';
    const priorityNum = typeof priority === 'number' ? priority : 0;
    
    if (priorityStr === 'high' || priorityNum > 0.7) return ExclamationTriangleIcon;
    if (priorityStr === 'medium' || priorityNum > 0.4) return InformationCircleIcon;
    return CheckCircleIcon;
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3 flex items-center gap-2">
        <LightBulbIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
        Recommendations
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {recommendations.map((rec, index) => {
          const PriorityIcon = getPriorityIcon(rec.priority);
          const priorityClass = getPriorityClass(rec.priority, rec.risk_level as any);
          const riskLevelColor = getRiskLevelColor(rec.risk_level);
          
          return (
            <div
              key={index}
              className={`recommendation-item ${priorityClass} animate-fade-in`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-50 flex items-center gap-1">
                  <PriorityIcon className="w-4 h-4" />
                  <span className="truncate">{rec.issue}</span>
                </h4>
                {rec.risk_level && (
                  <span className={`px-1 py-0.5 text-xs font-medium rounded-full border ${riskLevelColor} flex-shrink-0`}>
                    {rec.risk_level}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{rec.message || rec.recommendation}</p>
              
              {rec.actions && rec.actions.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-medium text-gray-900 dark:text-gray-50 mb-1">Actions:</h5>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700 dark:text-gray-300">
                    {rec.actions.slice(0, 2).map((action, actionIndex) => (
                      <li key={actionIndex} className="truncate">{action}</li>
                    ))}
                    {rec.actions.length > 2 && (
                      <li className="text-gray-500">+{rec.actions.length - 2} more...</li>
                    )}
                  </ul>
                </div>
              )}
              
              {rec.expected_improvement && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-start gap-1">
                    <InformationCircleIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h6 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-0.5">
                        Expected Improvement
                      </h6>
                      <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2">
                        {rec.expected_improvement}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
