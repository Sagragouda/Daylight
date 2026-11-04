import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useBackground, BackgroundCategory } from '../../context/BackgroundContext';
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sliders,
  Trash2,
  Check,
} from 'lucide-react';

export const WallpaperSettingsCard: React.FC = () => {
  const {
    currentBgId,
    customBgUrl,
    dimLevel,
    blurLevel,
    setBackground,
    setCustomImage,
    removeCustomImage,
    setDimLevel,
    setBlurLevel,
    presets,
  } = useBackground();

  const [selectedBgCategory, setSelectedBgCategory] = useState<BackgroundCategory>('all');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setUploadError('Image size exceeds 6MB. Please choose a smaller photo.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setUploadError(null);
    setCustomImage(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const filteredBgPresets = useMemo(() => {
    if (selectedBgCategory === 'all') return presets;
    return presets.filter((p) => p.category === selectedBgCategory);
  }, [presets, selectedBgCategory]);

  return (
    <Card id="wallpaper-section" hoverable glowColor="rose" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-black/[0.05] dark:border-white/[0.08]">
        <div>
          <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            Workspace Wallpaper & Glossy Backgrounds
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1">
            Choose a unique glossy wallpaper to radiate beneath your workspace cards, or upload your own photo.
          </p>
        </div>

        {currentBgId !== 'none' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setBackground('none')}
            className="text-xs shrink-0 self-start sm:self-auto"
          >
            Clear Wallpaper
          </Button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'all', label: 'All Styles' },
            { id: 'cosmic', label: 'Cosmic 3D' },
            { id: 'glossy', label: 'Glossy Mesh' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'nature', label: 'Serene Nature' },
          ] as { id: BackgroundCategory; label: string }[]
        ).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedBgCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
              selectedBgCategory === cat.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#98989f] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Wallpapers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Default / None Option */}
        <button
          onClick={() => setBackground('none')}
          className={`relative p-3 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
            currentBgId === 'none'
              ? 'border-rose-500 dark:border-rose-400 bg-rose-500/10 shadow-[0_4px_16px_rgba(244,63,94,0.18)]'
              : 'border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:border-black/[0.16] dark:hover:border-white/[0.16]'
          }`}
        >
          <div className="w-full h-20 rounded-xl mb-2.5 bg-[#fbfbfd] dark:bg-[#090a0f] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center relative overflow-hidden shadow-inner">
            <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#98989f]">
              Solid Canvas
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                None (Default)
              </p>
              <p className="text-[10px] text-[#86868b] dark:text-[#98989f]">
                Clean minimal canvas
              </p>
            </div>
            {currentBgId === 'none' && (
              <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>
        </button>

        {/* Preset Wallpaper Cards */}
        {filteredBgPresets.map((preset) => {
          const isSelected = currentBgId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setBackground(preset.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-rose-500 dark:border-rose-400 bg-rose-500/10 shadow-[0_4px_16px_rgba(244,63,94,0.18)]'
                  : 'border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:border-black/[0.16] dark:hover:border-white/[0.16]'
              }`}
            >
              {/* Visual Thumbnail */}
              <div className="w-full h-20 rounded-xl mb-2.5 relative overflow-hidden shadow-inner bg-slate-900 border border-white/10 group-hover:scale-[1.02] transition-transform">
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-[#86868b] dark:text-[#98989f] truncate">
                    {preset.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Image Upload & URL Section */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-rose-500" />
            Add Custom Wallpaper
          </span>
          {customBgUrl && (
            <button
              onClick={removeCustomImage}
              className="text-[11px] font-medium text-rose-500 hover:underline flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Remove Custom Image
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* File Upload Button */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-black/[0.15] dark:border-white/[0.15] bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] cursor-pointer transition-colors text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            <Upload className="w-4 h-4 text-rose-500" />
            <span>Upload from device</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Custom URL Form */}
          <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="url"
                placeholder="Paste direct image link..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-white/[0.05] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="shrink-0 text-xs py-2">
              Apply
            </Button>
          </form>
        </div>

        {uploadError && (
          <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>
        )}

        {customBgUrl && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
            <img
              src={customBgUrl}
              alt="Custom Wallpaper Preview"
              className="w-12 h-12 rounded-lg object-cover border border-white/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Custom Image Active
              </p>
              <p className="text-[10px] text-[#86868b] dark:text-[#98989f] truncate">
                Saved to your personal workspace preferences
              </p>
            </div>
            <button
              onClick={() => setBackground('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentBgId === 'custom'
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              {currentBgId === 'custom' ? 'Selected' : 'Use This'}
            </button>
          </div>
        )}
      </div>

      {/* Gloss & Overlay Atmosphere Controls */}
      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <h4 className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Glass Tint & Legibility Controls
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dimming / Glass Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#86868b] dark:text-[#98989f] mb-1.5 font-medium">
              <span>Glass Tint Overlay</span>
              <span className="font-mono">{Math.round(dimLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={dimLevel}
              onChange={(e) => setDimLevel(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
              aria-label="Glass Tint Overlay"
            />
            <p className="text-[10px] text-[#86868b] mt-1">
              Higher opacity guarantees high contrast for task cards and text.
            </p>
          </div>

          {/* Background Blur Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#86868b] dark:text-[#98989f] mb-1.5 font-medium">
              <span>Background Blur</span>
              <span className="font-mono">{blurLevel}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={blurLevel}
              onChange={(e) => setBlurLevel(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
              aria-label="Background Blur"
            />
            <p className="text-[10px] text-[#86868b] mt-1">
              Softens busy photographic details behind your dashboard widgets.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
