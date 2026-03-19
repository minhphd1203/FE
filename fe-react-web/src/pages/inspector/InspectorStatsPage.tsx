import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import {
  getInspectorDashboard,
  fetchBikesForInspector,
} from '../../apis/inspectorApi';

export const InspectorStatsPage: React.FC = () => {
  const [counts, setCounts] = useState({ inspected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ví dụ: Gọi API search bikes khi mount (có thể xóa hoặc thay đổi logic tuỳ ý)
  useEffect(() => {
    // Gọi thử API search bikes với params mẫu
    fetchBikesForInspector({ brand: '', model: '', page: 1, limit: 5 })
      .then((data) => {
        // Xử lý dữ liệu nếu cần
        // console.log('Bikes:', data);
      })
      .catch((err) => {
        // console.log('Lỗi fetch bikes:', err);
      });
  }, []);

  useEffect(() => {
    getInspectorDashboard()
      .then((res) =>
        setCounts({
          inspected: res.data?.inspected || 0,
          pending: res.data?.pending || 0,
        }),
      )
      .catch(() => setError('Không thể tải thống kê kiểm định'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bảng thống kê kiểm định
        </h1>
        <p className="text-gray-500 mt-1">
          Tổng quan số lượng đã kiểm định và đang chờ kiểm định
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/inspector/history" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã kiểm định</p>
                <p className="text-2xl font-bold text-gray-900">
                  {counts.inspected}
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/inspector" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đang chờ kiểm định</p>
                <p className="text-2xl font-bold text-gray-900">
                  {counts.pending}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
