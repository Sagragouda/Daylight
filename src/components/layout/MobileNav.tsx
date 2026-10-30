import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
  Timer,
  Menu,
  X,
  Calendar,
  FileText,
  TrendingUp,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  dotColor: string;
}

export const MobileNav: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pendingTasksCount } = useTasks();

  const primaryItems: NavItemConfig[] = [
    {
      name: 'Overview',
      path: '/',
      icon: LayoutDashboard,
      activeColor: 'text-[#0071e3] dark:text-[#2997ff]',
      activeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      activeBorder: 'border-blue-500/30 dark:border-blue-400/40',
      dotColor: 'bg-[#0071e3] dark:bg-[#2997ff]',
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: CheckCircle2,
      badge: pendingTasksCount,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      activeBorder: 'border-emerald-500/30 dark:border-emerald-400/40',
      dotColor: 'bg-emerald-500',
    },
    {
      name: 'Habits',
      path: '/habits',
      icon: Flame,
      activeColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      activeBorder: 'border-amber-500/30 dark:border-amber-400/40',
      dotColor: 'bg-amber-500',
    },
    {
      name: 'Focus',
      path: '/focus',
      icon: Timer,
      activeColor: 'text-violet-600 dark:text-violet-400',
      activeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
      activeBorder: 'border-violet-500/30 dark:border-violet-400/40',
      dotColor: 'bg-violet-500',
    },
  ];

  const secondaryItems = [
    {
      name: 'Planner',
      path: '/planner',
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      name: 'Notes',
      path: '/notes',
      icon: FileText,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800/50',
    },
  ];

  return (
    <>
      {/* Slide-out Drawer for "More" sections */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/45 dark:bg-black/75 backdrop-blur-md transition-opacity duration-200"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white/95 dark:bg-[#12131d]/95 backdrop-blur-2xl rounded-t-3xl p-6 shadow-2xl border-t border-black/[0.08] dark:border-white/[0.12] z-10 overflow-y-auto animate-slide-up text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
                <span className="font-bold text-lg text-[#1d1d1f] dark:text-[#f5f5f7]">
                  All Workspace Spaces
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868b] dark:text-[#98989f] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Navigation Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[...primaryItems, ...secondaryItems].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-semibold transition-all active:scale-[0.98] ${
                        isActive
                          ? 'bg-blue-500/10 dark:bg-blue-500/20 border-[#0071e3]/40 dark:border-[#2997ff]/40 text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                          : 'bg-[#fbfbfd] dark:bg-[#1a1c26] border-black/[0.04] dark:border-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#f5f5f7] dark:hover:bg-[#202330]'
                      }`
                    }
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-white/[0.08] shadow-xs">
                      <Icon className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                    </div>
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868b] dark:text-[#98989f]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                Cloud Synced & Protected
              </span>
              <span className="font-semibold">Daylight Flow</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modern Colorful Bubble Dock for Mobile */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 max-w-md mx-auto z-40 transition-all duration-200"
      >
        <div className="glossy-glass-card rounded-full p-1.5 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_48px_-6px_rgba(0,0,0,0.7)] flex items-center justify-between backdrop-blur-2xl">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 relative select-none active:scale-90 ${
                    isActive
                      ? `${item.activeBg} ${item.activeColor} ${item.activeBorder} border shadow-xs scale-105`
                      : 'text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#12131d] shadow-sm animate-pulse-subtle">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold' : ''}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} mt-0.5 animate-scale-in`} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* More Drawer Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full text-[#86868b] dark:text-[#98989f] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-all duration-200 active:scale-90 border border-transparent"
            aria-label="Open more navigation options"
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
