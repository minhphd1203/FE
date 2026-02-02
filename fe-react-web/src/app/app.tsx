import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReduxProvider } from '../providers/ReduxProvider';
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { GuestGuard } from '../guards/GuestGuard';
import { AuthGuard } from '../guards/AuthGuard';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/HomePage';

export function App() {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Guest routes */}
            <Route element={<GuestGuard />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}

export default App;
