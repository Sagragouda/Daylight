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
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const MobileNav: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pendingTasksCount } = useTasks();

  const primaryItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckCircle2, badge: pendingTasksCount },
    { name: 'Habits', path: '/habits', icon: Flame },
    { name: 'Focus', path: '/focus', icon: Timer },
  ];

  const secondaryItems = [
    { name: 'Planner', path: '/planner', icon: Calendar },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Insights', path: '/insights', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Slide-out Drawer for "More" sections */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl p-6 shadow-2xl border-t border-black/[0.08] z-10 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-4">
              <span className="font-semibold text-lg text-[#1d1d1f]">All Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#86868b] hover:bg-[#f5f5f7] transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[...primaryItems, ...secondaryItems].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] font-semibold'
                          : 'bg-[#fbfbfd] border-black/[0.04] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-[#0071e3]" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#86868b]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
                Supabase Auth & Tasks Active
              </span>
              <span className="font-medium">Daylight v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Dock for Mobile */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-black/[0.06] px-2 py-1.5 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-[#0071e3] font-semibold'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className="w-5 h-5 stroke-[2]" />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#0071e3] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] mt-1 tracking-tight leading-none">{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 w-3.5 h-0.5 rounded-full bg-[#0071e3]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] transition-all`}
            aria-label="Open more navigation options"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] mt-1 tracking-tight leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
