import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
