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
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  const role = user?.role?.toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());
  if (!role || !normalizedAllowed.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
