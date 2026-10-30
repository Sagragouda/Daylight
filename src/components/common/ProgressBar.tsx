import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  color?: string; // custom gradient or background
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'bg-[#0071e3]',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-[#6e6e73] dark:text-[#98989f]">
          <span>Progress</span>
          <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-[#f0f0f4] dark:bg-white/[0.08] rounded-full overflow-hidden ${heightClasses[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color} shadow-xs`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
