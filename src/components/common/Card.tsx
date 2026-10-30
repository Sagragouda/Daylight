import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white/85 dark:bg-[#14151c]/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-glossy-light dark:shadow-glossy-dark text-[#1d1d1f] dark:text-[#f5f5f7] ${
        hoverable
          ? 'transition-all duration-200 hover:shadow-glossy-light-hover dark:hover:shadow-glossy-dark-hover hover:-translate-y-0.5 hover:border-black/[0.1] dark:hover:border-white/[0.15]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
