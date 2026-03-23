import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export const GuestGuard: React.FC = () => {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
