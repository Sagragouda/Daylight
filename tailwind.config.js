/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          'blue-hover': '#0062c4',
          'blue-light': '#e8f2ff',
          gray: {
            50: '#fbfbfd',
            100: '#f5f5f7',
            200: '#e8e8ed',
            300: '#d2d2d7',
            400: '#86868b',
            500: '#6e6e73',
            600: '#515154',
            700: '#333336',
            800: '#1d1d1f',
            900: '#151516',
          },
          canvas: '#fbfbfd',
          card: '#ffffff',
          tag: '#f0f0f4',
          accent: '#0071e3',
          success: '#34c759',
          warning: '#ff9500',
          danger: '#ff3b30',
          purple: '#af52de',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'Inter',
          'sans-serif',
        ],
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'apple-card': '0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'apple-float': '0 20px 48px -8px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
        // Glossy 3D specular rim reflections
        'glossy-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 4px 16px -2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'glossy-light-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 1), 0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
        'glossy-dark': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), 0 8px 28px -4px rgba(0, 0, 0, 0.45)',
        'glossy-dark-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 16px 40px -6px rgba(0, 0, 0, 0.65)',
        'glossy-btn-primary': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.35), 0 4px 14px rgba(0, 113, 227, 0.35)',
        'glossy-btn-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 6px 18px rgba(0, 113, 227, 0.45)',
      },
      borderRadius: {
        'apple-sm': '10px',
        'apple-md': '14px',
        'apple-lg': '20px',
        'apple-xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
