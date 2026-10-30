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
      className={`bg-white rounded-2xl sm:rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] ${
        hoverable
          ? 'transition-all duration-200 hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 hover:border-black/[0.1]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
