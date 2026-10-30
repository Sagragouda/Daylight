import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
    'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#0071e3] text-white hover:bg-[#0062c4] shadow-sm hover:shadow-[0_4px_12px_rgba(0,113,227,0.25)]',
    secondary:
      'bg-white text-[#1d1d1f] border border-black/[0.08] hover:bg-[#f5f5f7] shadow-sm',
    ghost:
      'bg-transparent text-[#1d1d1f] hover:bg-black/[0.04]',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
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
