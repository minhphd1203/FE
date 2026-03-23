import React from 'react';
import {
  Users,
  Bike,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { AdminBike, AdminUser } from '../../apis/adminApi';
import {
  useAdminBikesQuery,
  useAdminUsersQuery,
} from '../../hooks/admin/useAdminQueries';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Đã duyệt
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Chờ duyệt
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <ShoppingCart className="w-3 h-3" />
          Bị từ chối
        </span>
      );
    default:
      return null;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'seller':
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          Người bán
        </span>
      );
    case 'customer':
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Khách hàng
        </span>
      );
    case 'admin':
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Admin
        </span>
      );
    case 'inspector':
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Kiểm duyệt viên
        </span>
      );
    default:
      return null;
  }
};

export const AdminDashboardPage: React.FC = () => {
  const {
    data: bikes = [],
    isLoading: bikesLoading,
    error: bikesError,
  } = useAdminBikesQuery();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsersQuery();

  const statData = [
    {
      label: 'Tổng người dùng',
      value: users.length.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Tin đăng',
      value: bikes.length.toLocaleString(),
      change: '+0%',
      trend: 'up',
      icon: Bike,
      color: 'bg-green-500',
    },
    {
      label: 'Doanh thu (tạm ẩn)',
      value: '---',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-[#f57224]',
    },
    {
      label: 'Lượt truy cập',
      value: '---',
      change: '-0%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const recentListings = bikes.slice(0, 5);
  const recentUsers = users.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động của Chợ Xe Đạp</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Tin đăng gần đây
            </h2>
            <a
              href="/admin/listings"
              className="text-sm font-medium text-[#f57224] hover:underline"
            >
              Xem tất cả
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {bikesLoading ? (
              <div className="p-6 text-center text-gray-500">Đang tải...</div>
            ) : bikesError ? (
              <div className="p-6 text-center text-red-600">
                Không tải được dữ liệu xe
              </div>
            ) : recentListings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có tin đăng nào
              </div>
            ) : (
              recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {listing.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {listing.seller?.name || 'Không xác định'} •{' '}
                      {new Date(listing.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm font-semibold text-[#f57224] whitespace-nowrap">
                      {listing.price?.toLocaleString('vi-VN')} đ
                    </span>
                    {getStatusBadge(listing.status || 'pending')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Người dùng mới
            </h2>
            <a
              href="/admin/users"
              className="text-sm font-medium text-[#f57224] hover:underline"
            >
              Xem tất cả
            </a>
          </div>
          <div className="divide-y divide-gray-100">
            {usersLoading ? (
              <div className="p-6 text-center text-gray-500">Đang tải...</div>
            ) : usersError ? (
              <div className="p-6 text-center text-red-600">
                Không tải được dữ liệu người dùng
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Chưa có người dùng nào
              </div>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
