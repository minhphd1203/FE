import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export const GuestGuard: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
