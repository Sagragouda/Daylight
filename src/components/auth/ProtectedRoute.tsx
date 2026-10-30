import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SunMedium } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            {/* Soft radiant ambient glow */}
            <div className="absolute w-28 h-28 bg-[#0071e3]/20 rounded-full blur-2xl animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,113,227,0.35)] animate-bounce">
              <SunMedium className="w-8 h-8" />
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold tracking-tight text-[#1d1d1f]">
            Daylight
          </p>
          <p className="mt-1 text-xs text-[#86868b]">
            Restoring your mindful session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
