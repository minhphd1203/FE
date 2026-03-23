import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import { useSellerSalesStatsQuery } from '../../hooks/seller/useSellerQueries';

export const SellerSalesStatsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useSellerSalesStatsQuery();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-12">
      <Link
        to="/seller"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Về kênh bán
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <BarChart3 className="w-7 h-7 text-[#f57224]" />
        Thống kê bán hàng
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        GET{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">
          /seller/v1/stats/sales
        </code>
      </p>

      {isLoading && <p className="text-gray-500 text-sm">Đang tải…</p>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          Không tải được thống kê.{' '}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void refetch()}
          >
            Thử lại
          </button>
        </div>
      )}

      {data != null && !isLoading && (
        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};
