import React from 'react';
import {
  Users,
  Bike,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  useAdminDashboardQuery,
  useAdminBikesQuery,
  useAdminUsersQuery,
} from '../../hooks/admin/useAdminQueries';

const fmtVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n,
  );
const fmtNum = (n: number) => n.toLocaleString('vi-VN');

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
          <XCircle className="w-3 h-3" />
          Từ chối
        </span>
      );
    case 'sold':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Đã bán
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
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

const revenueTooltipFormatter = (value: number) => fmtVND(value);

export const AdminDashboardPage: React.FC = () => {
  const { data: dashboard, isLoading: dashLoading } = useAdminDashboardQuery();

  const {
    data: bikesData,
    isLoading: bikesLoading,
    error: bikesError,
  } = useAdminBikesQuery({ limit: 5 });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminUsersQuery({ limit: 4 });

  const recentListings = bikesData?.items ?? [];
  const recentUsers = usersData?.items ?? [];

  const d = dashboard;

  const statCards = [
    {
      label: 'Tổng người dùng',
      value: d ? fmtNum(d.users.total) : '—',
      sub: d
        ? `${d.users.buyers} buyer · ${d.users.sellers} seller · ${d.users.inspectors} inspector`
        : '',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Tin đăng',
      value: d ? fmtNum(d.bikes.total) : '—',
      sub: d
        ? `${d.bikes.pending} chờ duyệt · ${d.bikes.approved} đang hiển`
        : '',
      icon: Bike,
      color: 'bg-green-500',
    },
    {
      label: 'Tổng doanh thu',
      value: d ? fmtVND(d.transactions.totalRevenue) : '—',
      sub: d ? `Phí hệ thống: ${fmtVND(d.transactions.totalSystemFees)}` : '',
      icon: DollarSign,
      color: 'bg-[#f57224]',
    },
    {
      label: 'Giao dịch',
      value: d ? fmtNum(d.transactions.total) : '—',
      sub: d
        ? `${d.transactions.completed} hoàn thành · ${d.transactions.pending} chờ xử lý`
        : '',
      icon: ClipboardList,
      color: 'bg-indigo-500',
    },
    {
      label: 'Báo cáo',
      value: d ? fmtNum(d.reports.total) : '—',
      sub: d ? `${d.reports.pending} chờ xử lý` : '',
      icon: AlertTriangle,
      color: 'bg-amber-500',
    },
    {
      label: 'Kiểm định',
      value: d ? fmtNum(d.inspections.total) : '—',
      sub: d
        ? `${d.inspections.passed} đạt · ${d.inspections.failed} không đạt`
        : '',
      icon: ShieldCheck,
      color: 'bg-teal-500',
    },
  ];

  const chartData = (d?.monthlyRevenue ?? []).map((m) => ({
    month: m.month,
    'Doanh thu': m.revenue,
    'Phí HT': m.fees,
    'Số GD': m.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động của Chợ Xe Đạp</p>
      </div>

      {/* Stats Grid */}
      {dashLoading ? (
        <div className="text-center py-8 text-gray-500">
          Đang tải thống kê...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
                {stat.sub && (
                  <p className="text-xs text-gray-400 mt-3">{stat.sub}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Doanh thu theo tháng
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                yAxisId="left"
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(0)}M`
                    : v.toLocaleString()
                }
              />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={revenueTooltipFormatter} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Doanh thu"
                fill="#f57224"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="Phí HT"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Content Grid — recent listings + recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {new Date(listing.createdAt).toLocaleString('vi-VN')}
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
