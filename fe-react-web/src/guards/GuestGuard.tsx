import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { getDefaultRouteForRole } from '../utils/postLoginRedirect';

export const GuestGuard: React.FC = () => {
  const { isAuthenticated, isHydrated, user } = useAppSelector(
    (state) => state.auth,
  );

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
};
