import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { sound } from '../utils/sound';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, signOut, getUserDisplayName, getUserInitials } = useAuth();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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
    if (window.confirm('Reset local storage to original sample data?')) {
      window.localStorage.clear();
      setResetDone(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
          Preferences & Account
        </h1>
        <p className="text-sm text-[#6e6e73] mt-1">
          Manage your authenticated profile, audio feedback, and system configuration.
        </p>
      </div>

      {/* Authenticated Account Profile Card */}
      {user && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.05]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3] font-bold text-base shadow-xs select-none">
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
                  {displayName}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-[#6e6e73] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#86868b]" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs text-[#6e6e73]">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0071e3]" />
              <span>
                <strong>Auth Provider:</strong> {user.app_metadata?.provider || 'Email/Password'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0071e3]" />
              <span>
                <strong>Session State:</strong> Verified via Supabase GoTrue
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Audio & Feedback */}
      <Card className="p-6 space-y-5">
        <h3 className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#0071e3]" />
          Sound & Haptics
        </h3>

        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">Task & Timer Chimes</p>
            <p className="text-xs text-[#86868b] mt-0.5">
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
                soundEnabled ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
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

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">Browser Notifications</p>
            <p className="text-xs text-[#86868b] mt-0.5">
              Receive subtle system notifications when a 25-minute Pomodoro timer completes.
            </p>
          </div>
          <button
            onClick={() => {
              if (!notificationsEnabled && 'Notification' in window) {
                Notification.requestPermission().then((res) => {
                  setNotificationsEnabled(res === 'granted');
                });
              } else {
                setNotificationsEnabled(!notificationsEnabled);
              }
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 shrink-0 ${
              notificationsEnabled ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
            }`}
            aria-label="Toggle Browser Notifications"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Supabase Architecture Card */}
      <Card className="p-6 border-blue-200/60 bg-gradient-to-br from-white via-white to-blue-50/40">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#1d1d1f]">
                  Supabase Database & Auth
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Connected
                </span>
              </div>
              <p className="text-xs text-[#86868b] mt-0.5">
                Authentication, session persistence, and PostgreSQL Tasks table are live.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#515154] leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#0071e3]" /> Supabase Auth Active
              </span>
              Session tokens are automatically refreshed and safely persisted across browser tabs.
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-[#0071e3]" /> PostgreSQL Tasks
              </span>
              User tasks are synchronized directly to PostgreSQL with Row Level Security enforcement.
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="font-semibold text-base text-[#1d1d1f] mb-1">
          Data & Local Storage
        </h3>
        <p className="text-xs text-[#86868b] mb-4">
          Habits, notes, and planner blocks are stored safely in browser storage.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-black/[0.05] gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">Reset Local Sample Data</p>
            <p className="text-xs text-[#86868b] mt-0.5">
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
