import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

interface RoleBasedGuardProps {
  allowedRoles: Array<'admin' | 'inspector' | 'customer' | 'seller'>;
}

export const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  allowedRoles,
}) => {
  const { user, isAuthenticated, isHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const isDev = import.meta.env.MODE === 'development';

  // Show loading indicator while hydrating
  if (!isHydrated && !isDev) {
    return (
      <div
        className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400 text-sm"
        aria-busy="true"
      >
        Đang tải phiên đăng nhập…
      </div>
    );
  }

  // In development, allow bypassing role/auth checks for UI preview
  if (!isAuthenticated && !isDev) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role) && !isDev) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
