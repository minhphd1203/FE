import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReduxProvider } from '../providers/ReduxProvider';
import { ReactQueryProvider } from '../providers/ReactQueryProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { GuestGuard } from '../guards/GuestGuard';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { CategoryPage } from '../pages/CategoryPage';
import { PostListingPage } from '../pages/PostListingPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { MainLayout } from '../layouts/MainLayout';
import { InspectorLayout } from '../layouts/InspectorLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminListingsPage,
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
  SettingsPage as UserSettingsPage,
  HelpPage,
  UserAccountPage,
} from '../pages/user';
import { AllListingsPage } from '../pages/AllListingsPage';
import { InspectorStatsPage } from '../pages/inspector/InspectorStatsPage';
import { InspectionListPage } from '../pages/inspector/InspectionListPage';
import { InspectionDetailPage } from '../pages/inspector/InspectionDetailPage';
import { InspectionHistoryPage } from '../pages/inspector/InspectionHistoryPage';
import { InspectionHistoryDetailPage } from '../pages/inspector/InspectionHistoryDetailPage';

const NotFoundPage: React.FC = () => (
  <div className="py-16 flex flex-col items-center gap-4 text-center">
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
      Trang này hiện chưa được hỗ trợ
    </h1>
    <p className="text-gray-500 max-w-md">
      Đường dẫn bạn truy cập chưa có nội dung hoặc tính năng đang trong quá
      trình phát triển. Vui lòng quay lại trang chủ hoặc chọn mục khác.
    </p>
    <a
      href="/"
      className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#f57224] text-white text-sm font-semibold hover:bg-[#e0651a] transition-colors"
    >
      Về trang chủ
    </a>
  </div>
);

export function App() {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes with main marketplace layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="dang-tin" element={<PostListingPage />} />
              <Route path="thanh-toan" element={<CheckoutPage />} />
              <Route
                path="thanh-toan/thanh-cong"
                element={<PaymentSuccessPage />}
              />
              <Route path="danh-muc/:slug" element={<CategoryPage />} />
              <Route path="tat-ca-tin-dang" element={<AllListingsPage />} />

              {/* User / account utility pages */}
              <Route path="tin-dang-da-luu" element={<SavedListingsPage />} />
              <Route path="tim-kiem-da-luu" element={<SavedSearchesPage />} />
              <Route path="lich-su-xem-tin" element={<ViewHistoryPage />} />
              <Route path="danh-gia-tu-toi" element={<MyReviewsPage />} />
              <Route
                path="lich-su-giao-dich"
                element={<TransactionHistoryPage />}
              />
              <Route path="uu-dai" element={<OffersPage />} />
              <Route path="uu-dai-cua-toi" element={<MyOffersPage />} />
              <Route path="cai-dat" element={<UserSettingsPage />} />
              <Route path="tro-giup" element={<HelpPage />} />
              <Route path="tai-khoan" element={<UserAccountPage />} />

              {/* Fallback cho các đường dẫn public chưa có trang riêng */}
              <Route path="*" element={<NotFoundPage />} />
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

            {/* Admin routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="listings" element={<AdminListingsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            {/* Inspector routes */}
            <Route element={<RoleGuard allowedRoles={['inspector']} />}>
              <Route path="/inspector" element={<InspectorLayout />}>
                <Route index element={<InspectionListPage />} />
                <Route
                  path="inspection/:id"
                  element={<InspectionDetailPage />}
                />
                <Route path="history" element={<InspectionHistoryPage />} />
                <Route
                  path="history/:id"
                  element={<InspectionHistoryDetailPage />}
                />
                <Route path="dashboard" element={<InspectorStatsPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}

export default App;
