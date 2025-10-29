'use client';

import { RiskGaugeProps } from '@/types';

export default function RiskGauge({ score, level, size = 'md' }: RiskGaugeProps) {
  const sizeClasses = {
    sm: 'w-32 h-16',
    md: 'w-48 h-24',
    lg: 'w-64 h-32',
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low Risk':
        return '#22c55e';
      case 'Medium Risk':
        return '#f59e0b';
      case 'High Risk':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const calculateArcLength = (score: number) => {
    // Arc radius is 80, circumference = 2πr, half circle = πr
    const radius = 80;
    const halfCircumference = Math.PI * radius; // ~251
    return (score / 100) * halfCircumference;
  };

  const scoreToAngle = (score: number) => {
    // Map 0-100% to 0-180 degrees (0-π radians)
    // But need to start from left (180°) and go to right (0°)
    return Math.PI - (score / 100) * Math.PI;
  };

  const arcLength = calculateArcLength(score);
  const angle = scoreToAngle(score);
  const color = getRiskColor(level);

  const halfCircumference = Math.PI * 80;

  return (
    <div className={`risk-gauge ${sizeClasses[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Background arc */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="currentColor"
          className="text-gray-300 dark:text-gray-600"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Risk arc - filled to exact percentage */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${halfCircumference}`}
          strokeDashoffset="0"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        
        {/* Needle */}
        <line
          x1="100"
          y1="90"
          x2={100 + 65 * Math.cos(angle)}
          y2={90 - 65 * Math.sin(angle)}
          stroke="currentColor"
          className="text-gray-700 dark:text-gray-300"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: 'all 0.5s ease' }}
        />
        
        {/* Center dot */}
        <circle cx="100" cy="90" r="6" fill="currentColor" className="text-gray-700 dark:text-gray-300" />
        
        {/* Score text */}
        <text 
          x="100" 
          y="70" 
          textAnchor="middle" 
          fontSize="32" 
          fontWeight="bold" 
          fill={color}
          style={{ transition: 'fill 0.3s ease' }}
        >
          {Math.round(score)}%
        </text>
      </svg>
    </div>
  );
}
