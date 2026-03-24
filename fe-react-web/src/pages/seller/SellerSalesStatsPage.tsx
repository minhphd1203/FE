import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Activity,
  Wallet,
  Bike,
} from 'lucide-react';
import { useSellerSalesStatsQuery } from '../../hooks/seller/useSellerQueries';

export const SellerSalesStatsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useSellerSalesStatsQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-12 font-sans">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#f57224] transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Về kênh bán
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl text-[#f57224]">
              <BarChart3 className="w-6 h-6" />
            </div>
            Thống kê bán hàng
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Tổng hợp doanh thu và số lượng đơn hàng đã giao dịch thành công.
          </p>
        </div>
        {data && !isLoading && (
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
            <Activity className="w-4 h-4" /> Dữ liệu được cập nhật thời gian
            thực
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
          <div className="w-10 h-10 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">
            Đang tổng hợp dữ liệu thống kê...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-6 flex flex-col items-center text-center">
          <p className="mb-3 font-medium">
            Không thể tải dữ liệu thống kê do lỗi kết nối.
          </p>
          <button
            type="button"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-sm"
            onClick={() => void refetch()}
          >
            Thử lại ngay
          </button>
        </div>
      )}

      {data != null && !isLoading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 absolute-grid">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-orange-500 to-[#f57224] rounded-2xl p-6 text-white shadow-md shadow-orange-500/20 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 transition-transform duration-500">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <p className="text-orange-100 font-semibold mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Tổng doanh thu
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {formatCurrency(data.data?.totalRevenue || 0)}
                </h3>
                <p className="text-sm text-orange-100/80">Tất cả thời gian</p>
              </div>
            </div>

            {/* Current Month Revenue */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-500 font-semibold text-sm mb-1">
                Doanh thu tháng này
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.data?.currentMonthRevenue || 0)}
              </h3>
            </div>

            {/* Total Sales */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-500 font-semibold text-sm mb-1">
                Tổng xe đã bán
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {data.data?.totalSales || 0}{' '}
                <span className="text-base text-gray-500 font-medium">
                  chiếc
                </span>
              </h3>
            </div>

            {/* Current Month Sales */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-purple-200 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                  <Bike className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-500 font-semibold text-sm mb-1">
                Bán trong tháng này
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {data.data?.currentMonthSales || 0}{' '}
                <span className="text-base text-gray-500 font-medium">
                  chiếc
                </span>
              </h3>
            </div>
          </div>

          {/* RECENT TRANSACTIONS TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Giao dịch gần đây (10 đơn mới nhất)
              </h2>
              <Link
                to="/seller/quan-ly-don"
                className="text-sm font-semibold text-[#f57224] hover:underline"
              >
                Xem tất cả đơn hàng
              </Link>
            </div>

            {!data.data?.recentTransactions ||
            data.data.recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <p>Chưa có giao dịch thành công nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="px-6 py-4">Mã giao dịch</th>
                      <th className="px-6 py-4">Sản phẩm (Mã Xe)</th>
                      <th className="px-6 py-4">Ngày hoàn tất</th>
                      <th className="px-6 py-4 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.data.recentTransactions.map((tx: any) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            to={`/seller/quan-ly-don/${tx.id}`}
                            className="font-mono text-sm text-[#f57224] font-medium hover:underline"
                          >
                            #{tx.id.substring(0, 8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/seller/tin-dang/${tx.bikeId}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#f57224] hover:underline flex items-center gap-2"
                          >
                            <Bike className="w-4 h-4 text-gray-400" />
                            Chi tiết xe
                          </Link>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {tx.bikeId.substring(0, 12)}...
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                            +{formatCurrency(tx.amount || 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
