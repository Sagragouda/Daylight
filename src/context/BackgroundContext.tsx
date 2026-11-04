import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export type BackgroundCategory = 'all' | 'cosmic' | 'glossy' | 'architecture' | 'nature';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: BackgroundCategory;
  description: string;
  url: string; // Can be a CSS gradient string or high-resolution image URL
  previewGradient: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Cosmic & 3D Glow
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    category: 'cosmic',
    description: 'Deep violet & electric cyan celestial stardust',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-purple-900 via-indigo-950 to-blue-900',
  },
  {
    id: 'starlight-ridge',
    name: 'Starlight Ridge',
    category: 'cosmic',
    description: 'Starry cosmic night sky above snowy mountain peaks',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-slate-950 via-indigo-950 to-slate-900',
  },
  {
    id: 'cyber-aurora',
    name: 'Cyber Aurora',
    category: 'cosmic',
    description: 'Luminous emerald & teal waves in twilight skies',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-emerald-950 via-teal-900 to-indigo-950',
  },

  // Apple Gloss & Silk Mesh
  {
    id: 'glossy-silk',
    name: 'Fluid Silk Mesh',
    category: 'glossy',
    description: 'Silky smooth glass mesh with warm rose & amber reflections',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-rose-500 via-purple-600 to-amber-500',
  },
  {
    id: 'liquid-prism',
    name: 'Liquid Prism',
    category: 'glossy',
    description: '3D refracted spectrum of chromatic caustic glass light',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-blue-600 via-indigo-700 to-pink-500',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Caustics',
    category: 'glossy',
    description: 'Warm coral, gold, and magenta glossy horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-amber-600 via-rose-600 to-indigo-900',
  },

  // Minimal Architecture & Obsidian Glass
  {
    id: 'smoked-obsidian',
    name: 'Smoked Obsidian',
    category: 'architecture',
    description: 'Minimal dark architectural planes with rim highlights',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-zinc-900 via-stone-900 to-zinc-950',
  },
  {
    id: 'studio-concrete',
    name: 'Studio Monolith',
    category: 'architecture',
    description: 'Clean architectural concrete and soft diffused daylight',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-slate-800 via-zinc-800 to-slate-900',
  },

  // Serene Nature & Zen
  {
    id: 'misty-alpine',
    name: 'Misty Alpine',
    category: 'nature',
    description: 'Peaceful dawn fog clinging to mountain summits',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-slate-800 via-sky-950 to-emerald-950',
  },
  {
    id: 'rainy-forest',
    name: 'Rainy Forest',
    category: 'nature',
    description: 'Gentle raindrops falling through emerald cedar branches',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-emerald-950 via-teal-950 to-stone-900',
  },
  {
    id: 'ocean-tide',
    name: 'Pacific Tide',
    category: 'nature',
    description: 'Rhythmic dark blue swells and calming surf textures',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=2560&q=80',
    previewGradient: 'from-cyan-900 via-blue-950 to-slate-950',
  },
];

interface BackgroundContextType {
  currentBgId: string; // 'none' | preset.id | 'custom'
  customBgUrl: string | null;
  dimLevel: number; // 0.6 to 0.95
  blurLevel: number; // 0 to 16
  setBackground: (id: string) => void;
  setCustomImage: (dataOrUrl: string) => void;
  removeCustomImage: () => void;
  setDimLevel: (level: number) => void;
  setBlurLevel: (blur: number) => void;
  activeBackground: BackgroundPreset | null;
  presets: BackgroundPreset[];
}

const BG_STORAGE_KEY = 'focusup_background_id';
const CUSTOM_BG_KEY = 'focusup_custom_bg';
const DIM_STORAGE_KEY = 'focusup_bg_dim';
const BLUR_STORAGE_KEY = 'focusup_bg_blur';

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBgId, setCurrentBgId] = useState<string>(() => {
    try {
      return localStorage.getItem(BG_STORAGE_KEY) || 'none';
    } catch {
      return 'none';
    }
  });

  const [customBgUrl, setCustomBgUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_BG_KEY) || null;
    } catch {
      return null;
    }
  });

  const [dimLevel, setDimLevelState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DIM_STORAGE_KEY);
      return saved ? parseFloat(saved) : 0.82;
    } catch {
      return 0.82;
    }
  });

  const [blurLevel, setBlurLevelState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BLUR_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 4;
    } catch {
      return 4;
    }
  });

  const setBackground = useCallback((id: string) => {
    setCurrentBgId(id);
    try {
      localStorage.setItem(BG_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const setCustomImage = useCallback((dataOrUrl: string) => {
    setCustomBgUrl(dataOrUrl);
    setCurrentBgId('custom');
    try {
      localStorage.setItem(CUSTOM_BG_KEY, dataOrUrl);
      localStorage.setItem(BG_STORAGE_KEY, 'custom');
    } catch {
      // ignore
    }
  }, []);

  const removeCustomImage = useCallback(() => {
    setCustomBgUrl(null);
    if (currentBgId === 'custom') {
      setCurrentBgId('none');
      try {
        localStorage.setItem(BG_STORAGE_KEY, 'none');
      } catch {
        // ignore
      }
    }
    try {
      localStorage.removeItem(CUSTOM_BG_KEY);
    } catch {
      // ignore
    }
  }, [currentBgId]);

  const setDimLevel = useCallback((level: number) => {
    const clamped = Math.max(0.4, Math.min(0.96, level));
    setDimLevelState(clamped);
    try {
      localStorage.setItem(DIM_STORAGE_KEY, clamped.toString());
    } catch {
      // ignore
    }
  }, []);

  const setBlurLevel = useCallback((blur: number) => {
    const clamped = Math.max(0, Math.min(24, blur));
    setBlurLevelState(clamped);
    try {
      localStorage.setItem(BLUR_STORAGE_KEY, clamped.toString());
    } catch {
      // ignore
    }
  }, []);

  const activeBackground = useMemo(() => {
    if (currentBgId === 'none') return null;
    if (currentBgId === 'custom') {
      if (!customBgUrl) return null;
      return {
        id: 'custom',
        name: 'Custom Wallpaper',
        category: 'all',
        description: 'User uploaded image',
        url: customBgUrl,
        previewGradient: 'from-slate-700 via-zinc-800 to-stone-900',
      } as BackgroundPreset;
    }
    return BACKGROUND_PRESETS.find((p) => p.id === currentBgId) || null;
  }, [currentBgId, customBgUrl]);

  return (
    <BackgroundContext.Provider
      value={{
        currentBgId,
        customBgUrl,
        dimLevel,
        blurLevel,
        setBackground,
        setCustomImage,
        removeCustomImage,
        setDimLevel,
        setBlurLevel,
        activeBackground,
        presets: BACKGROUND_PRESETS,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = (): BackgroundContextType => {
  const ctx = useContext(BackgroundContext);
  if (!ctx) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return ctx;
};
