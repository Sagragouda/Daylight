import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { sound } from '../utils/sound';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { WallpaperSettingsCard } from '../components/settings/WallpaperSettingsCard';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  Database,
  ShieldCheck,
  Check,
  Sparkles,
  RotateCcw,
  User as UserIcon,
  LogOut,
  Mail,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  BellRing,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, signOut, getUserDisplayName, getUserInitials } = useAuth();
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const { browserPermission, requestBrowserPermission } = useNotifications();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [resetDone, setResetDone] = useState(false);

  const displayName = getUserDisplayName();
  const initials = getUserInitials();

  const testAudioChime = () => {
    sound.playTaskComplete();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Reset local storage to original sample data? This will clear custom local habits and notes.')) {
      window.localStorage.removeItem('daylight_habits_v1');
      window.localStorage.removeItem('daylight_notes_v1');
      window.localStorage.removeItem('daylight_planner_v1');
      window.localStorage.removeItem('daylight_timer_sessions');
      setResetDone(true);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  const themeOptions: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'light',
      label: 'Light',
      description: 'Clean bright canvas with crisp contrast',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Deep obsidian surfaces with soft glow',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System',
      description: `Follows device settings (currently ${resolvedTheme})`,
      icon: Laptop,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
          Preferences & Account
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989f] mt-1">
          Customize your appearance, audio feedback, notification center, and profile.
        </p>
      </div>

      {/* Authenticated Account Profile Card */}
      {user && (
        <Card hoverable glowColor="blue" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 dark:from-blue-900/60 dark:to-blue-700/60 border border-[#0071e3]/30 dark:border-blue-400/40 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] font-bold text-base shadow-xs select-none">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  {displayName}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-[#6e6e73] dark:text-[#98989f] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#86868b] dark:text-[#98989f]" />
                  {user.email}
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={handleSignOut}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs text-[#6e6e73] dark:text-[#98989f]">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
              <span>
                <strong>Auth Provider:</strong> {user.app_metadata?.provider || 'Email/Password'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
              <span>
                <strong>Session State:</strong> Verified via Supabase GoTrue
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Appearance Section */}
      <Card hoverable glowColor="purple" className="p-6 space-y-5">
        <div>
          <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
            Appearance
          </h3>
          <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1">
            Choose your preferred theme. System mode automatically aligns with your OS preference.
          </p>
        </div>

        {/* 3D Theme Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setThemeMode(opt.id)}
                className={`relative text-left p-4 rounded-2xl border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 ${
                  isSelected
                    ? 'border-[#0071e3] dark:border-[#2997ff] bg-[#0071e3]/5 dark:bg-[#0071e3]/10 shadow-[0_4px_20px_-2px_rgba(0,113,227,0.18)]'
                    : 'border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] hover:border-black/[0.14] dark:hover:border-white/[0.16] hover:bg-white dark:hover:bg-white/[0.06]'
                }`}
              >
                {/* Visual miniature theme preview */}
                <div
                  className={`w-full h-16 rounded-xl mb-3 p-2.5 flex flex-col justify-between border shadow-inner transition-colors ${
                    opt.id === 'light'
                      ? 'bg-[#fbfbfd] border-black/[0.08]'
                      : opt.id === 'dark'
                      ? 'bg-[#090a0f] border-white/[0.1]'
                      : 'bg-gradient-to-r from-[#fbfbfd] via-gray-200 to-[#090a0f] border-black/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        opt.id === 'dark' ? 'bg-[#2997ff]' : 'bg-[#0071e3]'
                      }`}
                    />
                    <span
                      className={`w-8 h-1.5 rounded-full ${
                        opt.id === 'dark' ? 'bg-white/20' : 'bg-black/15'
                      }`}
                    />
                  </div>
                  <div
                    className={`w-full h-4 rounded-lg flex items-center px-1.5 ${
                      opt.id === 'dark' ? 'bg-white/10' : 'bg-white shadow-xs'
                    }`}
                  >
                    <span
                      className={`w-12 h-1 rounded ${
                        opt.id === 'dark' ? 'bg-white/30' : 'bg-black/20'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected
                          ? 'text-[#0071e3] dark:text-[#2997ff]'
                          : 'text-[#86868b] dark:text-[#98989f]'
                      }`}
                    />
                    <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#0071e3] dark:bg-[#2997ff] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#86868b] dark:text-[#98989f] leading-snug">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Workspace Wallpaper Card */}
      <WallpaperSettingsCard />

      {/* Audio & Feedback */}
      <Card hoverable glowColor="cyan" className="p-6 space-y-5">
        <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
          Sound & Haptics
        </h3>

        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08] gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Task & Timer Chimes
            </p>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5">
              Play gentle Apple-inspired synthesized harmonic notes on task completion and session end.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={testAudioChime}>
              Test Sound
            </Button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 ${
                soundEnabled ? 'bg-[#0071e3]' : 'bg-[#e8e8ed] dark:bg-white/[0.12]'
              }`}
              aria-label="Toggle Sound"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Browser Notifications Permission */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Browser Notifications
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                    : browserPermission === 'denied'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60'
                }`}
              >
                {browserPermission === 'granted'
                  ? 'Enabled'
                  : browserPermission === 'denied'
                  ? 'Blocked in Browser'
                  : 'Not Enabled'}
              </span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5">
              Receive notifications for due dates, overdue tasks, and completed focus sessions.
            </p>
          </div>

          <div>
            {browserPermission === 'granted' ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                Active
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                icon={<BellRing className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />}
                onClick={requestBrowserPermission}
              >
                Enable
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Supabase Architecture Card */}
      <Card hoverable glowColor="aurora" className="p-6 border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-white via-white to-blue-50/40 dark:from-[#14151e] dark:via-[#14151e] dark:to-blue-950/30">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3] text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Supabase Database & Auth
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Connected
                </span>
              </div>
              <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5">
                Authentication, session persistence, and PostgreSQL Tasks table are live.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#515154] dark:text-[#d2d2d7] leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1c1d28] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> Supabase Auth Active
              </span>
              Session tokens are automatically refreshed and safely persisted across browser tabs.
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1c1d28] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" /> PostgreSQL Tasks
              </span>
              User tasks are synchronized directly to PostgreSQL with Row Level Security enforcement.
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card hoverable glowColor="amber" className="p-6">
        <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          Data & Local Storage
        </h3>
        <p className="text-xs text-[#86868b] dark:text-[#98989f] mb-4">
          Habits, notes, notifications, and planner blocks are stored safely in browser storage.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-black/[0.05] dark:border-white/[0.08] gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Reset Local Sample Data
            </p>
            <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-0.5">
              Clear local custom habits and notes to restore initial defaults.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleResetData}
            icon={resetDone ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            className="self-start sm:self-auto"
          >
            {resetDone ? 'Resetting...' : 'Reset Data'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
