import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReduxProvider } from '../providers/ReduxProvider';
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { GuestGuard } from '../guards/GuestGuard';
import { AuthGuard } from '../guards/AuthGuard';
import { LoginPage } from '../pages/auth/LoginPage';
import { HomePage } from '../pages/HomePage';
import { InspectorLayout } from '../layouts/InspectorLayout';
import { InspectorStatsPage } from '../pages/inspector/InspectorStatsPage';
import { InspectionListPage } from '../pages/inspector/InspectionListPage';
import { InspectionDetailPage } from '../pages/inspector/InspectionDetailPage';
import { InspectionHistoryPage } from '../pages/inspector/InspectionHistoryPage';
import { InspectionHistoryDetailPage } from '../pages/inspector/InspectionHistoryDetailPage';

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
            </Route>

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>

            {/* Admin routes removed (no admin pages present) */}

            {/* Inspector routes */}
            <Route path="/inspector" element={<InspectorLayout />}>
              <Route index element={<InspectionListPage />} />
              <Route path="inspection/:id" element={<InspectionDetailPage />} />
              <Route path="history" element={<InspectionHistoryPage />} />
              <Route
                path="history/:id"
                element={<InspectionHistoryDetailPage />}
              />
              <Route path="dashboard" element={<InspectorStatsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}

export default App;
