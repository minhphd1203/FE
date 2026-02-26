import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isDev = import.meta.env.MODE === 'development';

  // In development, allow accessing protected routes for preview
  if (!isAuthenticated && !isDev) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
