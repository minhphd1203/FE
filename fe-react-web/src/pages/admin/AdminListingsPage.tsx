import React, { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingCart,
  Image,
} from 'lucide-react';

// Mock data
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Xe đạp địa hình Giant Talon 3 size M',
    seller: 'Nguyễn Văn A',
    price: 8_500_000,
    category: 'Xe đạp địa hình',
    status: 'active' as const,
    views: 234,
    image:
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100&h=100&fit=crop',
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    title: 'Xe đua Pinarello F12 carbon',
    seller: 'Trần Thị B',
    price: 45_000_000,
    category: 'Xe đua',
    status: 'pending' as const,
    views: 0,
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100&h=100&fit=crop',
    createdAt: '2024-06-20',
  },
  {
    id: '3',
    title: 'Xe đạp điện Nijia Pro 2024',
    seller: 'Lê Văn C',
    price: 12_000_000,
    category: 'Xe đạp điện',
    status: 'active' as const,
    views: 567,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    createdAt: '2024-06-18',
  },
  {
    id: '4',
    title: 'Xe đạp gấp Brompton M6L',
    seller: 'Phạm Thị D',
    price: 35_000_000,
    category: 'Xe đạp gấp',
    status: 'sold' as const,
    views: 890,
    image:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop',
    createdAt: '2024-06-10',
  },
  {
    id: '5',
    title: 'Bộ phụ kiện xe đạp thể thao',
    seller: 'Hoàng Văn E',
    price: 1_200_000,
    category: 'Phụ kiện',
    status: 'rejected' as const,
    views: 45,
    image:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100&h=100&fit=crop',
    createdAt: '2024-06-22',
  },
  {
    id: '6',
    title: 'Xe đạp trẻ em 16 inch màu hồng',
    seller: 'Vũ Thị F',
    price: 2_500_000,
    category: 'Xe đạp trẻ em',
    status: 'pending' as const,
    views: 0,
    image:
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=100&h=100&fit=crop',
    createdAt: '2024-06-23',
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' d';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Đang hiển
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Chờ duyệt
        </span>
      );
    case 'sold':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <ShoppingCart className="w-3 h-3" />
          Đã bán
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Từ chối
        </span>
      );
    default:
      return null;
  }
};

export const AdminListingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const filteredListings = MOCK_LISTINGS.filter((listing) => {
    const matchSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === 'all' || listing.category === filterCategory;
    const matchStatus =
      filterStatus === 'all' || listing.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const pendingCount = MOCK_LISTINGS.filter(
    (l) => l.status === 'pending',
  ).length;

  const toggleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map((l) => l.id));
    }
  };

  const toggleSelectListing = (id: string) => {
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin đăng</h1>
          <p className="text-gray-500 mt-1">
            Duyệt và quản lý các tin đăng trên hệ thống
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium rounded-lg">
            <Clock className="w-5 h-5" />
            {pendingCount} tin đăng chờ duyệt
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, người bán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Xe đạp địa hình">Xe đạp địa hình</option>
              <option value="Xe đua">Xe đua</option>
              <option value="Xe đạp điện">Xe đạp điện</option>
              <option value="Xe đạp gấp">Xe đạp gấp</option>
              <option value="Xe đạp trẻ em">Xe đạp trẻ em</option>
              <option value="Phụ kiện">Phụ kiện</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiển</option>
            <option value="pending">Chờ duyệt</option>
            <option value="sold">Đã bán</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="bg-[#f57224]/10 border border-[#f57224]/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-[#f57224]">
            Đã chọn {selectedListings.length} tin đăng
          </span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600">
              Duyệt tất cả
            </button>
            <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
              Từ chối tất cả
            </button>
          </div>
        </div>
      )}

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedListings.length === filteredListings.length &&
                      filteredListings.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#f57224] focus:ring-[#f57224]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tin đăng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={() => toggleSelectListing(listing.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#f57224] focus:ring-[#f57224]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {listing.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString(
                            'vi-VN',
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {listing.seller}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#f57224]">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {listing.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(listing.status)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {listing.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenActionMenu(
                            openActionMenu === listing.id ? null : listing.id,
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {openActionMenu === listing.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenActionMenu(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                              {listing.status === 'pending' && (
                                <>
                                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                    <CheckCircle className="w-4 h-4" />
                                    Duyệt tin
                                  </button>
                                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <XCircle className="w-4 h-4" />
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {listing.status === 'active' && (
                                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                                  <XCircle className="w-4 h-4" />
                                  Ẩn tin
                                </button>
                              )}
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                                Xóa tin
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị 1-{filteredListings.length} trong tổng số{' '}
            {MOCK_LISTINGS.length} tin đăng
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-[#f57224] text-white text-sm font-medium rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
