import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { getDefaultRouteForRole } from '../utils/postLoginRedirect';

export const GuestGuard: React.FC = () => {
  const { isAuthenticated, isHydrated, user } = useAppSelector(
    (state) => state.auth,
  );

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

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
};
