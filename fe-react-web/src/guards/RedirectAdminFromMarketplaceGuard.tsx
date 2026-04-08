import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

/**
 * Tài khoản admin chỉ dùng khu vực /admin — không vào layout chợ (buyer) qua /.
 * Route /seller đã có RoleGuard; route /inspector đã có RoleGuard.
 */
export const RedirectAdminFromMarketplaceGuard: React.FC = () => {
  const { isAuthenticated, user, isHydrated } = useAppSelector(
    (state) => state.auth,
  );

  // Show loading indicator while hydrating
  if (!isHydrated) {
    return (
      <div
        className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400 text-sm"
        aria-busy="true"
      >
        Đang tải phiên đăng nhập…
      </div>
    );
  }

  if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
