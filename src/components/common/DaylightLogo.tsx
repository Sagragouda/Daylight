import React from 'react';

interface DaylightLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
}

export const DaylightLogo: React.FC<DaylightLogoProps> = ({
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
    <div className={`relative inline-flex items-center justify-center ${box} ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#FF9500] via-[#FF3B30] to-[#0071E3] blur-md opacity-40 dark:opacity-60 animate-pulse-subtle pointer-events-none" />
      )}
      <svg
        viewBox="0 0 100 100"
        width={px}
        height={px}
        className="relative z-10 w-full h-full drop-shadow-[0_2px_8px_rgba(0,113,227,0.35)] transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main radiant dawn gradient */}
          <linearGradient id="daylightPrimaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA100" />
            <stop offset="30%" stopColor="#FF5252" />
            <stop offset="70%" stopColor="#7928CA" />
            <stop offset="100%" stopColor="#0071E3" />
          </linearGradient>

          {/* Core sunlight gradient */}
          <radialGradient id="daylightCoreGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF3D4" />
            <stop offset="100%" stopColor="#FFB300" />
          </radialGradient>

          {/* Soft 3D specular shine */}
          <linearGradient id="daylightShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="daylightShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Base rounded squircle plate with glossy border */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#daylightPrimaryGradient)"
          filter="url(#daylightShadow)"
        />

        {/* Specular glass reflection */}
        <rect
          x="4"
          y="4"
          width="92"
          height="46"
          rx="26"
          fill="url(#daylightShine)"
          opacity="0.4"
        />

        {/* Radiant geometric aperture petals */}
        {/* Cardinal rays */}
        <path
          d="M 50 18 Q 50 40 50 50 Q 50 40 50 18 Z"
          fill="#FFFFFF"
          opacity="0.25"
        />
        <circle cx="50" cy="50" r="30" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.3" strokeDasharray="3 3" />

        {/* Dynamic sunburst petals */}
        <path
          d="M50 20 L55 38 L72 30 L62 46 L79 53 L61 58 L70 74 L54 66 L50 82 L46 66 L30 74 L39 58 L21 53 L38 46 L28 30 L45 38 Z"
          fill="#FFFFFF"
          opacity="0.2"
        />

        {/* Luminous Core Ring */}
        <circle cx="50" cy="50" r="21" fill="#FFFFFF" opacity="0.15" />
        <circle cx="50" cy="50" r="16" fill="url(#daylightCoreGradient)" filter="url(#daylightShadow)" />

        {/* Central Prism Star */}
        <path
          d="M 50 38 Q 50 46 42 50 Q 50 54 50 62 Q 50 54 58 50 Q 50 46 50 38 Z"
          fill="#FFFFFF"
        />

        {/* Tiny highlight sparkles */}
        <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
