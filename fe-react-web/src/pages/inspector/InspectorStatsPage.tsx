import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import {
  useInspectorDashboardQuery,
  useInspectorSearchBikesQuery,
} from '../../hooks/inspector/useInspectorQueries';

export const InspectorStatsPage: React.FC = () => {
  useInspectorSearchBikesQuery({
    brand: '',
    model: '',
    page: 1,
    limit: 5,
  });

  const {
    data: counts = { inspected: 0, pending: 0 },
    isLoading: loading,
    error: queryError,
  } = useInspectorDashboardQuery();

  if (loading) return <div>Đang tải thống kê...</div>;
  if (queryError)
    return <div className="text-red-500">Không thể tải thống kê kiểm định</div>;

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
