import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

interface RoleBasedGuardProps {
  allowedRoles: Array<'admin' | 'inspector' | 'customer' | 'seller'>;
}

export const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isDev = import.meta.env.MODE === 'development';

  // In development, allow bypassing role/auth checks for UI preview
  if (!isAuthenticated && !isDev) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role) && !isDev) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
