import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useInspectorHistoryDetailQuery } from '../../hooks/inspector/useInspectorQueries';

export const InspectionHistoryDetailPage: React.FC = () => {
  const { id } = useParams();
  const {
    data: item,
    isLoading: loading,
    error: queryError,
  } = useInspectorHistoryDetailQuery(id);

  if (loading) return <div>Đang tải chi tiết kiểm định...</div>;
  if (queryError)
    return <div className="text-red-500">Không thể tải chi tiết kiểm định</div>;
  if (!item) {
    return (
      <div>
        <h1 className="text-xl font-bold">Bản ghi không tồn tại</h1>
        <p className="mt-2 text-gray-500">Không tìm thấy kiểm định này.</p>
        <Link
          to="/inspector/history"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Quay lại lịch sử
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết kiểm định</h1>
        <p className="text-gray-500 mt-1">
          Xem thông tin kiểm định đã hoàn thành
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {item.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Người bán: {item.sellerName || item.seller || '-'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Giá:{' '}
              <span className="font-semibold text-[#f57224]">
                {item.price ? item.price + ' đ' : '-'}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Tình trạng: {item.condition || '-'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Thời gian kiểm định: {item.inspectionDate || '-'}
            </p>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Ghi chú kiểm định
              </h3>
              <p className="text-sm text-gray-600 mt-2">{item.notes || '-'}</p>
            </div>
          </div>
          <div className="w-48">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Đã kiểm
            </div>
            <div className="mt-4">
              <Link
                to="/inspector/history"
                className="inline-block px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionHistoryDetailPage;
