import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Play, Pause, LogOut, ShieldCheck } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';
import { useAuth } from '../../context/AuthContext';
import { FocusUpLogo } from '../common/FocusUpLogo';

export const Sidebar: React.FC = () => {
  const { pendingTasksCount } = useTasks();
  const { formattedTime, isRunning, startTimer, pauseTimer, mode } = useTimer();
  const { user, signOut, getUserDisplayName, getUserInitials } = useAuth();
  const navigate = useNavigate();

  const displayName = getUserDisplayName();
  const initials = getUserInitials();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white/85 dark:bg-[#0e0f15]/85 backdrop-blur-xl border-r border-black/[0.06] dark:border-white/[0.08] select-none p-4 justify-between z-20 transition-colors duration-200">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <FocusUpLogo size="md" withGlow />
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent flex items-center gap-1.5">
              FocusUp
              <span className="text-[10px] font-bold tracking-normal text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-800/40">
                v1.0
              </span>
            </span>
            <p className="text-[11px] font-medium text-[#86868b] dark:text-[#98989f] leading-tight">
              habit tracker & focus
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#0071e3]/10 dark:bg-[#0071e3]/20 text-[#0071e3] dark:text-[#2997ff] font-semibold shadow-xs'
                      : 'text-[#6e6e73] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] transition-transform duration-150 group-hover:scale-110 ${
                          isActive
                            ? 'text-[#0071e3] dark:text-[#2997ff]'
                            : 'text-[#86868b] dark:text-[#98989f]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {/* Dynamic Task Count Badge */}
                    {item.id === 'tasks' && pendingTasksCount > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#0071e3] dark:bg-[#0071e3] text-white shadow-xs'
                            : 'bg-[#f0f0f4] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#d2d2d7]'
                        }`}
                      >
                        {pendingTasksCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Widgets */}
      <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        {/* Quick Pomodoro Widget */}
        <div className="bg-[#f5f5f7] dark:bg-[#14151e] rounded-2xl p-3 border border-black/[0.04] dark:border-white/[0.08] shadow-xs transition-all hover:border-black/[0.08] dark:hover:border-white/[0.14]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b] dark:text-[#98989f]">
              {mode === 'pomodoro' ? 'Focus Session' : 'Rest Break'}
            </span>
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-[#202230] shadow-xs border border-black/[0.06] dark:border-white/[0.1] text-[#0071e3] dark:text-[#2997ff] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-transform active:scale-95"
              title={isRunning ? 'Pause Timer' : 'Start Timer'}
              aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium text-[#86868b] dark:text-[#98989f]">
              {isRunning ? 'Running' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Authenticated User Profile Pill */}
        {user ? (
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#14151e] border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 dark:from-blue-900/60 dark:to-blue-700/60 border border-[#0071e3]/30 dark:border-blue-400/40 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] font-bold text-xs shrink-0 select-none shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#86868b] dark:text-[#98989f] truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-xl text-[#86868b] dark:text-[#98989f] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/60 dark:border-blue-900/40 text-[#0071e3] dark:text-[#2997ff]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">
              Supabase Auth Connected
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
