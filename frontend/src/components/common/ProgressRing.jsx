import React from 'react';

export const ProgressRing = ({
  percentage = 0,
  size = 64,
  strokeWidth = 6,
  strokeColor = '#10b981',
  trackColor = '#e2e8f0',
  showText = true,
  textColor = 'text-slate-800',
  textSize = 'text-xs font-bold',
}) => {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {showText && (
        <span className={`absolute ${textColor} ${textSize}`}>
          {Math.round(safePercentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressRing;
