import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReduxProvider } from '../providers/ReduxProvider';
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { GuestGuard } from '../guards/GuestGuard';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleBasedGuard } from '../guards/RoleBasedGuard';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { CategoryPage } from '../pages/CategoryPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { MainLayout } from '../layouts/MainLayout';
import { PostListingPage } from '../pages/PostListingPage';
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminListingsPage,
  AdminReportsPage,
  AdminSettingsPage,
} from '../pages/admin';
import {
  SavedListingsPage,
  SavedSearchesPage,
  ViewHistoryPage,
  MyReviewsPage,
  TransactionHistoryPage,
  OffersPage,
  MyOffersPage,
  SettingsPage,
  HelpPage,
} from '../pages/user/index';

export function App() {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/danh-muc/:slug" element={<CategoryPage />} />
              <Route path="/dang-tin" element={<PostListingPage />} />

              {/* User Utilities & Account Pages */}
              <Route path="/tin-dang-da-luu" element={<SavedListingsPage />} />
              <Route path="/tim-kiem-da-luu" element={<SavedSearchesPage />} />
              <Route path="/lich-su-xem-tin" element={<ViewHistoryPage />} />
              <Route path="/danh-gia-tu-toi" element={<MyReviewsPage />} />
              <Route
                path="/lich-su-giao-dich"
                element={<TransactionHistoryPage />}
              />
              <Route path="/uu-dai" element={<OffersPage />} />
              <Route path="/uu-dai-cua-toi" element={<MyOffersPage />} />
              <Route path="/cai-dat" element={<SettingsPage />} />
              <Route path="/tro-giup" element={<HelpPage />} />
            </Route>

            {/* Guest routes */}
            <Route element={<GuestGuard />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>

            {/* Admin routes - TODO: Uncomment RoleBasedGuard for production */}
            {/* <Route element={<RoleBasedGuard allowedRoles={['admin', 'inspector']} />}> */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="listings" element={<AdminListingsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            {/* </Route> */}
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}

export default App;
