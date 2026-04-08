import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export const AuthGuard: React.FC = () => {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const isDev = import.meta.env.MODE === 'development';

  // Show loading indicator while hydrating
  if (!isHydrated) {
    return (
      <div
        className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400 text-sm"
        aria-busy="true"
      >
        Đang tải phiên đăng nhập…
      </div>
    );
  }

  // In development, allow accessing protected routes for preview
  if (!isAuthenticated && !isDev) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
