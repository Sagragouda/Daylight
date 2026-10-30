import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Flame,
  Calendar,
  Sparkles,
  Trash2,
  BellRing,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification } from '../../context/NotificationContext';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    requestBrowserPermission,
    browserPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close popover on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    navigate(item.actionPath);
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'overdue_task':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'high_priority_task':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'due_today_task':
        return <Calendar className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />;
      case 'habit_reminder':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'focus_completed':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
        title="Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#161722] animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-[#161722]/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.6)] border border-black/[0.08] dark:border-white/[0.1] z-50 animate-scale-in overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#0071e3] dark:text-[#2997ff] border border-blue-100 dark:border-blue-800/40">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-medium text-[#0071e3] dark:text-[#2997ff] hover:underline px-2 py-1 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.05] flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                aria-label="Close notification center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser Notification Opt-in Prompt */}
          {browserPermission === 'default' && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <BellRing className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                  Enable system chime alerts?
                </span>
              </div>
              <button
                onClick={requestBrowserPermission}
                className="px-2.5 py-1 rounded-lg bg-[#0071e3] text-white font-semibold text-[11px] hover:bg-[#0062c4] transition-colors shrink-0 shadow-xs"
              >
                Allow
              </button>
            </div>
          )}

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04] dark:divide-white/[0.04] p-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center mx-auto text-[#86868b] mb-2.5">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  All caught up!
                </p>
                <p className="text-xs text-[#86868b] dark:text-[#98989f] mt-1 max-w-[220px] mx-auto">
                  No pending deadlines, overdue items, or habit alerts right now.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    item.read
                      ? 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] opacity-80'
                      : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 font-medium'
                  }`}
                >
                  {/* Icon badge */}
                  <div className="w-8 h-8 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#6e6e73] dark:text-[#98989f] line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Dismiss Single Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(item.id);
                    }}
                    className="absolute right-2.5 top-2.5 w-6 h-6 flex items-center justify-center rounded-md text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Dismiss notification"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-xs text-[#86868b] bg-black/[0.01] dark:bg-white/[0.02]">
              <span className="text-[11px] px-2 text-[#86868b]">
                {notifications.length} item{notifications.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAll}
                className="px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
