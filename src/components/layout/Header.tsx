import React, { useState, useRef, useEffect } from 'react';
import { Plus, SunMedium, LogOut, Settings as SettingsIcon, ChevronDown, User as UserIcon } from 'lucide-react';
import { getFormattedHeaderDate } from '../../utils/date';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onOpenNewTaskModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTaskModal }) => {
  const formattedDate = getFormattedHeaderDate();
  const { user, signOut, getUserDisplayName, getUserInitials } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = getUserDisplayName();
  const initials = getUserInitials();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fbfbfd]/85 dark:bg-[#0e0f15]/85 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors duration-200">
      {/* Mobile brand mark (visible only on small screens) */}
      <div className="flex items-center gap-3">
        <Link to="/" className="lg:hidden flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <SunMedium className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Daylight
          </span>
        </Link>

        {/* Date on desktop/tablet */}
        <div className="hidden lg:block">
          <p className="text-xs font-semibold text-[#86868b] dark:text-[#98989f] uppercase tracking-wider">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick New Task Button */}
        <Button
          onClick={onOpenNewTaskModal}
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold mr-1"
        >
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Quick Theme Selector */}
        <ThemeToggle />

        {/* Functional Notification Center Popover */}
        <NotificationCenter />

        {/* User Profile Area with Dropdown */}
        <div className="relative pl-1 sm:pl-2 border-l border-black/[0.08] dark:border-white/[0.08]" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors group focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            title="User Account"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 dark:from-blue-900/60 dark:to-blue-700/60 border border-[#0071e3]/30 dark:border-blue-400/40 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] font-semibold text-xs select-none shadow-sm">
              {initials}
            </div>

            {/* Display name & email on medium+ screens */}
            <div className="hidden sm:flex flex-col text-left max-w-[120px] lg:max-w-[160px]">
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-[#86868b] dark:text-[#98989f] truncate leading-tight">
                {user?.email || 'Authenticated'}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-[#86868b] dark:text-[#98989f] group-hover:text-[#1d1d1f] dark:group-hover:text-[#f5f5f7] transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Apple-styled Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-[#161722]/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.65)] border border-black/[0.08] dark:border-white/[0.1] p-2 z-50 animate-scale-in divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {/* User details header */}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 dark:from-blue-900/60 dark:to-blue-700/60 border border-[#0071e3]/30 dark:border-blue-400/40 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] font-bold text-xs shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#86868b] dark:text-[#98989f] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-[#86868b] dark:text-[#98989f]" />
                  <span>Account & Preferences</span>
                </Link>
                <div className="px-3 py-1.5 text-[10px] text-[#86868b] dark:text-[#98989f] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
                  <span>Provider: {user?.app_metadata?.provider || 'Email'}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
