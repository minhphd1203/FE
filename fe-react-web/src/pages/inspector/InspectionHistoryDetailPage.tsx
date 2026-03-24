import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  useInspectorHistoryDetailQuery,
  useInspectorSellerProfileQuery,
} from '../../hooks/inspector/useInspectorQueries';
import { formatInspectorPrice } from '../../utils/inspectorBikeDetail';
import { formatDateTimeVi } from '../../utils/formatDisplayDate';

export const InspectionHistoryDetailPage: React.FC = () => {
  const { id } = useParams();
  const {
    data: item,
    isLoading: loading,
    error: queryError,
  } = useInspectorHistoryDetailQuery(id);

  // Parse the nested API response
  const nestedData = item as
    | { bike?: any; inspection?: any; inspector?: any }
    | undefined;
  const bike = nestedData?.bike;
  const inspection = nestedData?.inspection;

  const sellerProfileQ = useInspectorSellerProfileQuery(bike?.sellerId ?? null);

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

  const sellerName = sellerProfileQ.data?.name || bike?.sellerId || '-';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chi tiết kiểm định</h1>
        <p className="text-gray-500 mt-1">
          Xem thông tin kiểm định đã hoàn thành
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap md:flex-nowrap">
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {bike?.title || 'Chưa cập nhật tên xe'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-mono">{bike?.id}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Người bán</p>
                <p className="font-medium text-gray-900">{sellerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giá</p>
                <p className="font-semibold text-[#f57224]">
                  {bike?.price ? formatInspectorPrice(bike.price) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tình trạng tạo đơn</p>
                <p className="font-medium text-gray-900">
                  {bike?.condition || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian kiểm định</p>
                <p className="font-medium text-gray-900">
                  {inspection?.createdAt
                    ? formatDateTimeVi(inspection.createdAt)
                    : '-'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">
                Kết quả đánh giá chi tiết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tình trạng chung</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {inspection?.overallCondition || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Khung xe</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {inspection?.frameCondition || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bánh xe</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {inspection?.wheelCondition || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hệ thống phanh</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {inspection?.brakeCondition || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Truyền động</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {inspection?.drivetrainCondition || '-'}
                  </p>
                </div>
              </div>
            </div>

            {inspection?.inspectionNote && (
              <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="text-sm font-medium text-orange-800 mb-1">
                  Ghi chú kiểm định
                </h3>
                <p className="text-sm text-orange-900">
                  {inspection.inspectionNote}
                </p>
              </div>
            )}

            {inspection?.recommendation && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Khuyến nghị
                </h3>
                <p className="text-sm text-blue-900">
                  {inspection.recommendation}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-56 shrink-0 flex flex-col gap-4">
            {inspection?.status === 'passed' ? (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                <CheckCircle className="w-5 h-5" /> XE ĐẠT TIÊU CHUẨN
              </div>
            ) : inspection?.status === 'failed' ? (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-100 text-red-700 text-sm font-bold border border-red-200">
                <XCircle className="w-5 h-5" /> XE KHÔNG ĐẠT
              </div>
            ) : (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold border border-gray-200">
                KHÔNG RÕ
              </div>
            )}

            <Link
              to="/inspector/history"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionHistoryDetailPage;
