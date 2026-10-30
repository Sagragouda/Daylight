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
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  let colorClasses =
    'bg-[#f5f5f7] dark:bg-white/[0.08] text-[#515154] dark:text-[#d2d2d7] border border-black/[0.04] dark:border-white/[0.08] font-medium';

  if (priority) {
    switch (priority) {
      case 'high':
        colorClasses =
          'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/50 font-semibold';
        break;
      case 'medium':
        colorClasses =
          'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50 font-semibold';
        break;
      case 'low':
        colorClasses =
          'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-200/70 dark:border-blue-800/50 font-semibold';
        break;
    }
  } else {
    switch (variant) {
      case 'blue':
        colorClasses =
          'bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-800/40 font-semibold';
        break;
      case 'success':
        colorClasses =
          'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40 font-semibold';
        break;
      case 'purple':
        colorClasses =
          'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40 font-semibold';
        break;
      case 'amber':
        colorClasses =
          'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800/40 font-semibold';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-tight select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
