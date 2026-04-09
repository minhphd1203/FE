import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import type { AdminBike, GetBikesParams } from '../../apis/adminApi';
import { adminApi } from '../../apis/adminApi';
import { queryKeys } from '../../hooks/query-keys';
import {
  useAdminApproveBikeMutation,
  useAdminBikesQuery,
  useAdminDeleteBikeMutation,
  useAdminRejectBikeMutation,
} from '../../hooks/admin/useAdminQueries';
import { AdminListingDetailModal } from './AdminListingDetailModal';
import { getBikeImage, handleBikeImageError } from '../../utils/bikeImage';
import { translateBikeStatus } from '../../utils/translations';

const LIMIT = 20;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

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
    case 'hidden':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
          Đã ẩn
        </span>
      );
    case 'reserved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          Đã đặt cọc
        </span>
      );
    case 'sold':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Đã bán
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {translateBikeStatus(status)}
        </span>
      );
  }
};

type StatusFilter = GetBikesParams['status'] | 'all';
type SortFilter = GetBikesParams['sort'] | '';

export const AdminListingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortFilter>('');
  const [page, setPage] = useState(1);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailBike, setDetailBike] = useState<AdminBike | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const apiParams: GetBikesParams = {
    search: searchTerm || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus,
    sort: sort || undefined,
    page,
    limit: LIMIT,
  };

  const {
    data: result,
    isLoading: loading,
    error: queryError,
  } = useAdminBikesQuery(apiParams);

  const listings = result?.items ?? [];
  const meta = result?.meta ?? { page: 1, limit: LIMIT, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const approveMut = useAdminApproveBikeMutation();
  const rejectMut = useAdminRejectBikeMutation();
  const deleteMut = useAdminDeleteBikeMutation();

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không tải được danh sách xe'
        : null;

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

  const pendingCount = listings.filter((l) => l.status === 'pending').length;

  const toggleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map((l) => l.id));
    }
  };

  const toggleSelectListing = (id: string) => {
    setSelectedListings((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id],
    );
  };

  const startIdx = (meta.page - 1) * meta.limit + 1;
  const endIdx = Math.min(meta.page * meta.limit, meta.total);

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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đang hiển</option>
              <option value="rejected">Từ chối</option>
              <option value="hidden">Đã ẩn</option>
              <option value="reserved">Đã đặt cọc</option>
              <option value="sold">Đã bán</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortFilter);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
            </select>
          </div>
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
                  queryKey: ['admin', 'bikes'],
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
                  queryKey: ['admin', 'bikes'],
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
                        selectedListings.length === listings.length &&
                        listings.length > 0
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
                {listings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Không tìm thấy tin đăng nào
                    </td>
                  </tr>
                ) : (
                  listings.map((bike) => {
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
                                  src={getBikeImage(img)}
                                  onError={handleBikeImageError}
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
                              <button
                                type="button"
                                onClick={() => setDetailBike(bike)}
                                className="text-left text-sm font-medium text-gray-900 truncate max-w-[200px] hover:text-[#f57224] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f57224]/30 rounded"
                              >
                                {bike.title}
                              </button>
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
                            {bike.category?.name ?? 'Chưa phân loại'}
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
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDetailBike(bike);
                                        setOpenActionMenu(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                    >
                                      <Eye className="w-4 h-4 shrink-0" />
                                      Xem chi tiết (popup)
                                    </button>
                                    {bike.status === 'approved' && (
                                      <a
                                        href={`/tin-dang/${bike.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <ExternalLink className="w-4 h-4 shrink-0" />
                                        Mở trang chợ (tab mới)
                                      </a>
                                    )}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {startIdx}–{endIdx} trong tổng số {meta.total} tin đăng
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push('gap');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'gap' ? (
                    <span key={`gap-${idx}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        item === page
                          ? 'bg-[#f57224] text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminListingDetailModal
        open={detailBike !== null}
        onOpenChange={(open) => {
          if (!open) setDetailBike(null);
        }}
        bike={detailBike}
      />
    </div>
  );
};
