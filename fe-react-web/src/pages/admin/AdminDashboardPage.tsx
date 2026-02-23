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

// Mock data cho dashboard
const STATS = [
  {
    label: 'Tổng người dùng',
    value: '2,543',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    label: 'Tin đăng hoạt động',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: Bike,
    color: 'bg-green-500',
  },
  {
    label: 'Doanh thu tháng',
    value: '45.2M',
    change: '+23.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-[#f57224]',
  },
  {
    label: 'Lượt truy cập',
    value: '12,847',
    change: '-3.2%',
    trend: 'down',
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
];

const RECENT_LISTINGS = [
  {
    id: 1,
    title: 'Xe đạp địa hình Giant Talon 3',
    seller: 'Nguyễn Văn A',
    price: '8.500.000 đ',
    status: 'active',
    date: '2 giờ trước',
  },
  {
    id: 2,
    title: 'Xe đạp đua Pinarello F12',
    seller: 'Trần Thị B',
    price: '45.000.000 đ',
    status: 'pending',
    date: '3 giờ trước',
  },
  {
    id: 3,
    title: 'Xe đạp điện Nijia Pro',
    seller: 'Lê Văn C',
    price: '12.000.000 đ',
    status: 'active',
    date: '5 giờ trước',
  },
  {
    id: 4,
    title: 'Xe đạp gấp Brompton',
    seller: 'Phạm Thị D',
    price: '35.000.000 đ',
    status: 'sold',
    date: '6 giờ trước',
  },
  {
    id: 5,
    title: 'Bộ phụ kiện xe đạp thể thao',
    seller: 'Hoàng Văn E',
    price: '1.200.000 đ',
    status: 'active',
    date: '8 giờ trước',
  },
];

const RECENT_USERS = [
  {
    id: 1,
    name: 'Nguyễn Minh Tuấn',
    email: 'tuan.nm@email.com',
    role: 'seller',
    date: '1 giờ trước',
  },
  {
    id: 2,
    name: 'Trần Thu Hà',
    email: 'ha.tt@email.com',
    role: 'customer',
    date: '2 giờ trước',
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    email: 'nam.lh@email.com',
    role: 'seller',
    date: '4 giờ trước',
  },
  {
    id: 4,
    name: 'Phạm Thị Lan',
    email: 'lan.pt@email.com',
    role: 'customer',
    date: '5 giờ trước',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Hoạt động
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Chờ duyệt
        </span>
      );
    case 'sold':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <ShoppingCart className="w-3 h-3" />
          Đã bán
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động của Chợ Xe Đạp</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
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
            {RECENT_LISTINGS.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {listing.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {listing.seller} • {listing.date}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold text-[#f57224] whitespace-nowrap">
                    {listing.price}
                  </span>
                  {getStatusBadge(listing.status)}
                </div>
              </div>
            ))}
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
            {RECENT_USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(user.role)}
                  <span className="text-xs text-gray-400">{user.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a
            href="/admin/listings?status=pending"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#f57224] hover:bg-orange-50 transition-colors"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Duyệt tin đăng
            </span>
            <span className="text-xs text-gray-500">12 tin chờ duyệt</span>
          </a>
          <a
            href="/admin/users"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#f57224] hover:bg-orange-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Quản lý user
            </span>
            <span className="text-xs text-gray-500">2,543 người dùng</span>
          </a>
          <a
            href="/admin/reports"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#f57224] hover:bg-orange-50 transition-colors"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Báo cáo vi phạm
            </span>
            <span className="text-xs text-gray-500">5 báo cáo mới</span>
          </a>
          <a
            href="/admin/settings"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#f57224] hover:bg-orange-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Xem thống kê
            </span>
            <span className="text-xs text-gray-500">Chi tiết analytics</span>
          </a>
        </div>
      </div>
    </div>
  );
};
