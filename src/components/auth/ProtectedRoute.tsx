import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FocusUpLogo } from '../common/FocusUpLogo';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#090a0f] flex flex-col items-center justify-center p-4 transition-colors">
        <div className="relative flex flex-col items-center animate-scale-in">
          <FocusUpLogo size="xl" withGlow />

          <h2 className="mt-5 text-xl font-bold tracking-tight bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] bg-clip-text text-transparent">
            FocusUp
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#86868b] dark:text-[#98989f] tracking-wider uppercase">
            habit tracker & focus
          </p>

          {/* Minimal radiant loading progress bar */}
          <div className="w-28 h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.1] overflow-hidden mt-4">
            <div className="w-full h-full bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#f97316] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
