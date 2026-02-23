import React from 'react';
import { Link } from 'react-router-dom';
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

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Người bán
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Giá
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tình trạng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thời gian kiểm định
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {INSPECTION_HISTORY.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.seller}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#f57224]">
                    {item.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.condition}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.inspectionDate}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/inspector/history/${item.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
