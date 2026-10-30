import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs min-h-[34px] px-3 py-1.5 gap-1.5',
    md: 'text-sm min-h-[40px] px-4 py-2 gap-2',
    lg: 'text-base min-h-[46px] px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#0071e3] text-white hover:bg-[#0062c4] shadow-glossy-btn-primary hover:shadow-glossy-btn-hover active:shadow-sm',
    secondary:
      'bg-white/90 dark:bg-[#1e1f2b]/90 text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.1] hover:bg-[#f5f5f7] dark:hover:bg-[#282a38] shadow-xs dark:shadow-sm hover:border-black/[0.14] dark:hover:border-white/[0.18]',
    ghost:
      'bg-transparent text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
    danger:
      'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/40 active:bg-rose-200',
    gradient:
      'bg-gradient-to-r from-[#0071e3] via-[#5e5ce6] to-[#af52de] text-white hover:brightness-105 shadow-[0_4px_16px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_22px_rgba(94,92,230,0.45)] border border-white/20 active:shadow-sm',
    glass:
      'bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white/90 dark:hover:bg-white/[0.14] shadow-xs hover:border-black/[0.14] dark:hover:border-white/[0.2]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
