import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { getInspectionHistory } from '../../apis/inspectorApi';

const INSPECTION_HISTORY = [
  {
    id: 1,
    title: 'Xe đạp mountain bike Merida Big Nine',
    seller: 'Phạm Văn K',
    price: '18.500.000 đ',
    condition: 'Tốt',
    inspectionDate: '1 giờ trước',
    status: 'approved',
  },
  {
    id: 2,
    title: 'Xe đạp fixed gear single speed',
    seller: 'Lê Thị L',
    price: '6.500.000 đ',
    condition: 'Bình thường',
    inspectionDate: '2 giờ trước',
    status: 'approved',
  },
  {
    id: 3,
    title: 'Xe đạp địa hình Trek X-Caliber 8',
    seller: 'Trần Văn M',
    price: '22.000.000 đ',
    condition: 'Tốt',
    inspectionDate: '3 giờ trước',
    status: 'approved',
  },
  {
    id: 4,
    title: 'Xe đạp đua carbon Specialized Tarmac',
    seller: 'Hoàng Thị N',
    price: '55.000.000 đ',
    condition: 'Tuyệt vời',
    inspectionDate: '5 giờ trước',
    status: 'approved',
  },
  {
    id: 5,
    title: 'Xe đạp BMX Pro tricks',
    seller: 'Nguyễn Văn O',
    price: '4.500.000 đ',
    condition: 'Bình thường',
    inspectionDate: '6 giờ trước',
    status: 'approved',
  },
  {
    id: 6,
    title: 'Xe đạp đua Trek Domane SL',
    seller: 'Nguyễn Thị P',
    price: '28.000.000 đ',
    condition: 'Tốt',
    inspectionDate: '1 ngày trước',
    status: 'approved',
  },
  {
    id: 7,
    title: 'Xe đạp gấp Dahon Speed Pro',
    seller: 'Võ Văn Q',
    price: '12.500.000 đ',
    condition: 'Bình thường',
    inspectionDate: '1 ngày trước',
    status: 'approved',
  },
  {
    id: 8,
    title: 'Xe đạp điện Giant Quick E+ 30',
    seller: 'Đinh Thị R',
    price: '25.000.000 đ',
    condition: 'Tốt',
    inspectionDate: '2 ngày trước',
    status: 'approved',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Đã kiểm
        </span>
      );
    default:
      return null;
  }
};

export const InspectionHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInspectionHistory()
      .then((res) => setHistory(res.data || []))
      .catch(() => setError('Không thể tải lịch sử kiểm định'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải lịch sử kiểm định...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử kiểm định</h1>
        <p className="text-gray-500 mt-1">
          Danh sách các xe đã hoàn thành kiểm định chất lượng
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
          <option value="">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>

      {/* Lịch sử kiểm định */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {history.map((item) => {
          const inspection = item.inspection || {};
          return (
            <Link
              key={inspection.id}
              to={`/inspector/history/${inspection.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.bikeTitle || '-'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Người bán:{' '}
                  <span className="font-medium">{item.sellerName || '-'}</span>
                </p>
                <div className="grid grid-cols-2 gap-4 my-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Giá
                    </p>
                    <p className="text-lg font-bold text-[#f57224] mt-1">
                      {inspection.price ? inspection.price + ' đ' : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Tình trạng
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {inspection.condition || '-'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Thời gian kiểm định:{' '}
                  {inspection.completedAt
                    ? new Date(inspection.completedAt).toLocaleString()
                    : '-'}
                </p>
                {getStatusBadge(inspection.status)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
