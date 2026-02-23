import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const INSPECTION_HISTORY = [
  {
    id: 1,
    title: 'Xe đạp mountain bike Merida Big Nine',
    seller: 'Phạm Văn K',
    price: '18.500.000 đ',
    condition: 'Tốt',
    inspectionDate: '1 giờ trước',
    status: 'approved',
    notes: 'Bàn đạp thay mới, phanh OK',
  },
  {
    id: 2,
    title: 'Xe đạp fixed gear single speed',
    seller: 'Lê Thị L',
    price: '6.500.000 đ',
    condition: 'Bình thường',
    inspectionDate: '2 giờ trước',
    status: 'approved',
    notes: 'Khung có vết xước nhỏ',
  },
  {
    id: 3,
    title: 'Xe đạp địa hình Trek X-Caliber 8',
    seller: 'Trần Văn M',
    price: '22.000.000 đ',
    condition: 'Tốt',
    inspectionDate: '3 giờ trước',
    status: 'approved',
    notes: 'Hệ thống chuyển số hoạt động trơn',
  },
];

export const InspectionHistoryDetailPage: React.FC = () => {
  const { id } = useParams();
  const item = INSPECTION_HISTORY.find((x) => String(x.id) === String(id));

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
              Người bán: {item.seller}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Giá:{' '}
              <span className="font-semibold text-[#f57224]">{item.price}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Tình trạng: {item.condition}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Thời gian kiểm định: {item.inspectionDate}
            </p>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">
                Ghi chú kiểm định
              </h3>
              <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
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
