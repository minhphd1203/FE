import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

interface RoleGuardProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  redirectTo = '/',
}) => {
  const { isAuthenticated, user, isHydrated } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

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

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  const role = user?.role?.toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (!role || !normalizedAllowed.includes(role)) {
    const fallback =
      role === 'admin'
        ? '/admin'
        : role === 'inspector'
          ? '/inspector'
          : redirectTo;
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};
