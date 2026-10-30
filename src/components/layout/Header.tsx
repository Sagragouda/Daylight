import React, { useState, useRef, useEffect } from 'react';
import { Plus, SunMedium, Bell, LogOut, Settings as SettingsIcon, ChevronDown, User as UserIcon } from 'lucide-react';
import { getFormattedHeaderDate } from '../../utils/date';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
    <header className="sticky top-0 z-30 bg-[#fbfbfd]/85 backdrop-blur-xl border-b border-black/[0.05] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all">
      {/* Mobile brand mark (visible only on small screens) */}
      <div className="flex items-center gap-3">
        <Link to="/" className="lg:hidden flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <SunMedium className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-[#1d1d1f]">Daylight</span>
        </Link>

        {/* Date on desktop/tablet */}
        <div className="hidden lg:block">
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Task Button */}
        <Button
          onClick={onOpenNewTaskModal}
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          className="shadow-sm font-semibold"
        >
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Notification Bell */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#0071e3] rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Area with Dropdown */}
        <div className="relative pl-2 border-l border-black/[0.08]" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-black/[0.03] transition-colors group focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
            title="User Account"
            aria-expanded={dropdownOpen}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3] font-semibold text-xs select-none shadow-sm">
              {initials}
            </div>

            {/* Display name & email on medium+ screens */}
            <div className="hidden sm:flex flex-col text-left max-w-[120px] lg:max-w-[160px]">
              <span className="text-xs font-semibold text-[#1d1d1f] truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-[#86868b] truncate leading-tight">
                {user?.email || 'Authenticated'}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-[#86868b] group-hover:text-[#1d1d1f] transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Apple-styled Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-black/[0.08] p-2 z-50 animate-scale-in divide-y divide-black/[0.05]">
              {/* User details header */}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-blue-200 border border-[#0071e3]/30 flex items-center justify-center text-[#0071e3] font-bold text-xs shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#86868b] truncate">
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-[#86868b]" />
                  <span>Account & Preferences</span>
                </Link>
                <div className="px-3 py-1.5 text-[10px] text-[#86868b] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>Provider: {user?.app_metadata?.provider || 'Email'}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
