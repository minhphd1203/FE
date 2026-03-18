import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Upload, CheckCircle } from 'lucide-react';
import { getPendingBikes } from '../../apis/inspectorApi';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Chờ kiểm định
        </span>
      );
    case 'inspecting':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Eye className="w-3 h-3" />
          Đang kiểm định
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Đã kiểm định
        </span>
      );
    default:
      return null;
  }
};

export const InspectionListPage: React.FC = () => {
  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPendingBikes()
      .then((res) => setBikes(res.data || []))
      .catch((err) => setError('Không thể tải danh sách xe chờ kiểm định'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải danh sách xe...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Danh sách kiểm định
        </h1>
        <p className="text-gray-500 mt-1">
          Danh sách các xe cần kiểm định chất lượng trước khi được đăng bán
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, người bán..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
          />
        </div>
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ kiểm định</option>
          <option value="inspecting">Đang kiểm định</option>
          <option value="completed">Đã kiểm định</option>
        </select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bikes.map((vehicle) => (
          <Link
            key={vehicle.id}
            to={`/inspector/inspection/${vehicle.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Vehicle Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {vehicle.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Người bán:{' '}
                    <span className="font-medium">
                      {vehicle.sellerName || vehicle.seller || '-'}
                    </span>
                  </p>
                </div>
                {getStatusBadge(vehicle.status)}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Giá
                  </p>
                  <p className="text-lg font-bold text-[#f57224] mt-1">
                    {vehicle.price ? vehicle.price + ' đ' : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Tình trạng
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {vehicle.condition || '-'}
                  </p>
                </div>
              </div>

              {/* Submission Time */}
              <p className="text-xs text-gray-500">
                Gửi từ {vehicle.submittedDate || '-'}
              </p>

              {/* Action Button */}
              <button className="w-full mt-4 bg-[#f57224] hover:bg-[#e06818] text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Kiểm định ngay
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
