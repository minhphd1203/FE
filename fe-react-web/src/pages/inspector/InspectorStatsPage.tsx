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
    data: counts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      passed: 0,
      failed: 0,
    },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/inspector/history" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {counts.completed}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Đã kiểm định hoàn tất
            </p>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                Đạt: {counts.passed}
              </span>
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                Không đạt: {counts.failed}
              </span>
            </div>
          </div>
        </Link>

        <Link to="/inspector" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-yellow-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {counts.pending}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Đang chờ kiểm định mới
            </p>
            <p className="text-xs text-gray-400 mt-2">Cần xử lý ngay</p>
          </div>
        </Link>

        <Link to="/inspector" className="block">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {counts.inProgress}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Đang trong quá trình kiểm định
            </p>
            <p className="text-xs text-gray-400 mt-2">Bản nháp chưa hoàn tất</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
