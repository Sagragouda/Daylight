import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SunMedium, Play, Pause, LogOut, ShieldCheck } from 'lucide-react';
import { navigationItems } from './navigationItems';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';
import { useAuth } from '../../context/AuthContext';

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
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white/85 backdrop-blur-xl border-r border-black/[0.06] select-none p-4 justify-between z-20">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,113,227,0.3)] transition-transform duration-200 hover:scale-105">
            <SunMedium className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-[#1d1d1f] flex items-center gap-1.5">
              Daylight
              <span className="text-[10px] font-semibold tracking-normal text-[#0071e3] bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                v1.0
              </span>
            </span>
            <p className="text-[11px] text-[#86868b] leading-tight">Mindful productivity</p>
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
                      ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold shadow-xs'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.03]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] transition-transform duration-150 group-hover:scale-110 ${
                          isActive ? 'text-[#0071e3]' : 'text-[#86868b]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {/* Dynamic Task Count Badge */}
                    {item.id === 'tasks' && pendingTasksCount > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#0071e3] text-white shadow-xs'
                            : 'bg-[#f0f0f4] text-[#6e6e73]'
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
      <div className="space-y-3 pt-4 border-t border-black/[0.06]">
        {/* Quick Pomodoro Widget */}
        <div className="bg-[#f5f5f7] rounded-2xl p-3 border border-black/[0.04] transition-all hover:border-black/[0.08]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">
              {mode === 'pomodoro' ? 'Focus Session' : 'Rest Break'}
            </span>
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs border border-black/[0.06] text-[#0071e3] hover:bg-blue-50 transition-transform active:scale-95"
              title={isRunning ? 'Pause Timer' : 'Start Timer'}
              aria-label={isRunning ? 'Pause Timer' : 'Start Timer'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold tracking-tight text-[#1d1d1f]">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium text-[#86868b]">
              {isRunning ? 'Running' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Authenticated User Profile Pill */}
        {user ? (
          <div className="p-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3] font-bold text-xs shrink-0 select-none shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1d1d1f] truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#86868b] truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-xl text-[#86868b] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/70 border border-blue-100/60 text-[#0071e3]">
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
