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
      className={`bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] ${
        hoverable
          ? 'transition-all duration-200 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
