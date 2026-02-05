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
    title: 'Xe dap dia hinh Giant Talon 3 size M',
    seller: 'Nguyen Van A',
    price: 8500000,
    category: 'Xe dap dia hinh',
    status: 'active' as const,
    views: 234,
    image:
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100&h=100&fit=crop',
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    title: 'Xe dap dua Pinarello F12 carbon',
    seller: 'Tran Thi B',
    price: 45000000,
    category: 'Xe dap dua',
    status: 'pending' as const,
    views: 0,
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100&h=100&fit=crop',
    createdAt: '2024-06-20',
  },
  {
    id: '3',
    title: 'Xe dap dien Nijia Pro 2024',
    seller: 'Le Van C',
    price: 12000000,
    category: 'Xe dap dien',
    status: 'active' as const,
    views: 567,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    createdAt: '2024-06-18',
  },
  {
    id: '4',
    title: 'Xe dap gap Brompton M6L',
    seller: 'Pham Thi D',
    price: 35000000,
    category: 'Xe dap gap',
    status: 'sold' as const,
    views: 890,
    image:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop',
    createdAt: '2024-06-10',
  },
  {
    id: '5',
    title: 'Bo phu kien xe dap the thao',
    seller: 'Hoang Van E',
    price: 1200000,
    category: 'Phu kien',
    status: 'rejected' as const,
    views: 45,
    image:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100&h=100&fit=crop',
    createdAt: '2024-06-22',
  },
  {
    id: '6',
    title: 'Xe dap tre em 16 inch mau hong',
    seller: 'Vu Thi F',
    price: 2500000,
    category: 'Xe dap tre em',
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
          Dang hien
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          <Clock className="w-3 h-3" />
          Cho duyet
        </span>
      );
    case 'sold':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <ShoppingCart className="w-3 h-3" />
          Da ban
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Tu choi
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
          <h1 className="text-2xl font-bold text-gray-900">Quan ly tin dang</h1>
          <p className="text-gray-500 mt-1">
            Duyet va quan ly cac tin dang tren he thong
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium rounded-lg">
            <Clock className="w-5 h-5" />
            {pendingCount} tin dang cho duyet
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
              placeholder="Tim kiem theo tieu de, nguoi ban..."
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
              <option value="all">Tat ca danh muc</option>
              <option value="Xe dap dia hinh">Xe dap dia hinh</option>
              <option value="Xe dap dua">Xe dap dua</option>
              <option value="Xe dap dien">Xe dap dien</option>
              <option value="Xe dap gap">Xe dap gap</option>
              <option value="Xe dap tre em">Xe dap tre em</option>
              <option value="Phu kien">Phu kien</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
          >
            <option value="all">Tat ca trang thai</option>
            <option value="active">Dang hien</option>
            <option value="pending">Cho duyet</option>
            <option value="sold">Da ban</option>
            <option value="rejected">Tu choi</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="bg-[#f57224]/10 border border-[#f57224]/20 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-[#f57224]">
            Da chon {selectedListings.length} tin dang
          </span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600">
              Duyet tat ca
            </button>
            <button className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">
              Tu choi tat ca
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
                  Tin dang
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nguoi ban
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Gia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Danh muc
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trang thai
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Luot xem
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tac
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
                                Xem chi tiet
                              </button>
                              {listing.status === 'pending' && (
                                <>
                                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                                    <CheckCircle className="w-4 h-4" />
                                    Duyet tin
                                  </button>
                                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <XCircle className="w-4 h-4" />
                                    Tu choi
                                  </button>
                                </>
                              )}
                              {listing.status === 'active' && (
                                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">
                                  <XCircle className="w-4 h-4" />
                                  An tin
                                </button>
                              )}
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                                Xoa tin
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
            Hien thi 1-{filteredListings.length} trong tong so{' '}
            {MOCK_LISTINGS.length} tin dang
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
