import React from 'react';
import { Priority } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'priority' | 'success' | 'blue' | 'purple' | 'amber';
  priority?: Priority;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  priority,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  let colorClasses = 'bg-[#f5f5f7] text-[#515154] border border-black/[0.04]';

  if (priority) {
    switch (priority) {
      case 'high':
        colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200/60 font-medium';
        break;
      case 'medium':
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200/60 font-medium';
        break;
      case 'low':
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200/60 font-medium';
        break;
    }
  } else {
    switch (variant) {
      case 'blue':
        colorClasses = 'bg-blue-50 text-[#0071e3] border border-blue-100 font-medium';
        break;
      case 'success':
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium';
        break;
      case 'purple':
        colorClasses = 'bg-purple-50 text-purple-700 border border-purple-100 font-medium';
        break;
      case 'amber':
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-100 font-medium';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-tight ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
