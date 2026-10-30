import React from 'react';

export interface FloworaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
}

export const FloworaLogo: React.FC<FloworaLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = false,
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', px: 24 },
    sm: { box: 'w-8 h-8', px: 32 },
    md: { box: 'w-9 h-9', px: 36 },
    lg: { box: 'w-12 h-12', px: 48 },
    xl: { box: 'w-20 h-20', px: 80 },
  };

  const { box, px } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${box} ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#0071E3] via-[#8B5CF6] to-[#10B981] blur-md opacity-40 dark:opacity-60 animate-pulse-subtle pointer-events-none" />
      )}
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        className="relative z-10 w-full h-full drop-shadow-[0_2px_10px_rgba(0,113,227,0.35)] transition-transform duration-300 hover:scale-105 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Flowora Primary Radiant Gradient (Flow + Bloom) */}
          <linearGradient id="floworaPlateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071E3" />
            <stop offset="40%" stopColor="#5E5CE6" />
            <stop offset="75%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Focus Flow Petal (Azure Blue to Cyan) */}
          <linearGradient id="floworaFocusPetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
          </linearGradient>

          {/* Growth Petal (Mint to Emerald) */}
          <linearGradient id="floworaGrowthPetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.7" />
          </linearGradient>

          {/* Energy Aura Petal (Rose to Amber) */}
          <linearGradient id="floworaEnergyPetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.75" />
          </linearGradient>

          {/* Specular glass reflection */}
          <linearGradient id="floworaGlossShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Core Luminous Sunburst */}
          <radialGradient id="floworaCoreLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
          </radialGradient>

          <filter id="floworaPlateShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0071E3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Squircle Plate */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#floworaPlateGradient)"
          filter="url(#floworaPlateShadow)"
        />

        {/* Specular 3D Reflection */}
        <rect
          x="4"
          y="4"
          width="92"
          height="46"
          rx="26"
          fill="url(#floworaGlossShine)"
          opacity="0.35"
        />

        {/* Subtle Ambient Orbital Flow Rings */}
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity="0.25"
          strokeDasharray="3 4"
        />
        <circle
          cx="50"
          cy="50"
          r="23"
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Flowora Triple Infinity Bloom Petals */}
        {/* Petal 1: Top Right Flow (Growth & Momentum) */}
        <path
          d="M 50 50 C 50 30, 68 22, 76 34 C 84 46, 68 62, 50 50 Z"
          fill="url(#floworaGrowthPetal)"
          opacity="0.85"
        />

        {/* Petal 2: Left Flow (Focus & Deep Work) */}
        <path
          d="M 50 50 C 32 38, 20 54, 26 66 C 32 78, 52 68, 50 50 Z"
          fill="url(#floworaFocusPetal)"
          opacity="0.9"
        />

        {/* Petal 3: Bottom Right Flow (Energy & Mindful Rest) */}
        <path
          d="M 50 50 C 66 52, 72 70, 60 80 C 48 88, 40 68, 50 50 Z"
          fill="url(#floworaEnergyPetal)"
          opacity="0.85"
        />

        {/* Central Luminous Focus Core */}
        <circle cx="50" cy="50" r="14" fill="url(#floworaCoreLight)" />
        <circle cx="50" cy="50" r="8" fill="#FFFFFF" />

        {/* Central Prism Clarity Star */}
        <path
          d="M 50 42 Q 50 48 44 50 Q 50 52 50 58 Q 50 52 56 50 Q 50 48 50 42 Z"
          fill="#0071E3"
        />

        {/* Radiant Sparkle */}
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
