import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Image,
} from 'lucide-react';
import type { AdminBike } from '../../apis/adminApi';
import { adminApi } from '../../apis/adminApi';
import { queryKeys } from '../../hooks/query-keys';
import {
  useAdminApproveBikeMutation,
  useAdminBikesQuery,
  useAdminDeleteBikeMutation,
  useAdminRejectBikeMutation,
} from '../../hooks/admin/useAdminQueries';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' d';
};

/** BE: pending, approved, rejected. Map approved -> Đang hiển */
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
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
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Từ chối
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};

export const AdminListingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    data: listings = [],
    isLoading: loading,
    error: queryError,
  } = useAdminBikesQuery();
  const approveMut = useAdminApproveBikeMutation();
  const rejectMut = useAdminRejectBikeMutation();
  const deleteMut = useAdminDeleteBikeMutation();

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không tải được danh sách xe'
        : null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleApprove = async (bikeId: string) => {
    setActionLoading(bikeId);
    try {
      await approveMut.mutateAsync(bikeId);
    } finally {
      setActionLoading(null);
      setOpenActionMenu(null);
    }
  };

  const handleReject = async (bikeId: string) => {
    setActionLoading(bikeId);
    try {
      await rejectMut.mutateAsync({ bikeId });
    } finally {
      setActionLoading(null);
      setOpenActionMenu(null);
    }
  };

  const handleDelete = async (bikeId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin đăng này?')) return;
    setActionLoading(bikeId);
    try {
      await deleteMut.mutateAsync(bikeId);
    } finally {
      setActionLoading(null);
      setOpenActionMenu(null);
    }
  };

  const filteredListings = listings.filter((b) => {
    const matchSearch =
      !searchTerm ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === 'all' ||
      (b.category?.name ?? '').toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const pendingCount = listings.filter((l) => l.status === 'pending').length;

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
              {[
                ...new Set(
                  listings.map((b) => b.category?.name).filter(Boolean),
                ),
              ].map((name) => (
                <option key={name} value={name!}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as typeof filterStatus)
            }
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Đang hiển</option>
            <option value="pending">Chờ duyệt</option>
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
            <button
              onClick={async () => {
                const pending = selectedListings.filter((id) =>
                  listings.find((b) => b.id === id && b.status === 'pending'),
                );
                for (const id of pending) {
                  await adminApi.approveBike(id);
                }
                setSelectedListings([]);
                void queryClient.invalidateQueries({
                  queryKey: queryKeys.admin.bikes(),
                });
              }}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600"
            >
              Duyệt tất cả
            </button>
            <button
              onClick={async () => {
                const pending = selectedListings.filter((id) =>
                  listings.find((b) => b.id === id && b.status === 'pending'),
                );
                for (const id of pending) {
                  await adminApi.rejectBike(id);
                }
                setSelectedListings([]);
                void queryClient.invalidateQueries({
                  queryKey: queryKeys.admin.bikes(),
                });
              }}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600"
            >
              Từ chối tất cả
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải...</div>
        ) : (
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Ngày đăng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((bike) => {
                  const img =
                    Array.isArray(bike.images) && bike.images[0]
                      ? bike.images[0]
                      : null;
                  const isBusy = actionLoading === bike.id;
                  return (
                    <tr
                      key={bike.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedListings.includes(bike.id)}
                          onChange={() => toggleSelectListing(bike.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#f57224] focus:ring-[#f57224]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {img ? (
                              <img
                                src={img}
                                alt={bike.title}
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
                              {bike.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {bike.brand} {bike.model}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {bike.seller?.name ?? bike.seller?.email ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#f57224]">
                        {formatPrice(bike.price)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {bike.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(bike.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                        {new Date(bike.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenActionMenu(
                                openActionMenu === bike.id ? null : bike.id,
                              )
                            }
                            disabled={isBusy}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>

                          {openActionMenu === bike.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() =>
                                  !isBusy && setOpenActionMenu(null)
                                }
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                  <a
                                    href={`/xe-dap/${bike.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Xem chi tiết
                                  </a>
                                  {bike.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(bike.id)}
                                        disabled={isBusy}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 disabled:opacity-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Duyệt tin
                                      </button>
                                      <button
                                        onClick={() => handleReject(bike.id)}
                                        disabled={isBusy}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Từ chối
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDelete(bike.id)}
                                    disabled={isBusy}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị 1-{filteredListings.length} trong tổng số {listings.length}{' '}
            tin đăng
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
