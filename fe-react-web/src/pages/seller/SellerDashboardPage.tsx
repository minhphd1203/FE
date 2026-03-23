import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bike,
  Receipt,
  Star,
  Search,
  Handshake,
  MessageCircle,
  BarChart3,
  ShoppingBag,
} from 'lucide-react';
import {
  useSellerDashboardQuery,
  useSellerMyBikesQuery,
  useSellerToggleBikeVisibilityMutation,
  useSellerResubmitBikeMutation,
} from '../../hooks/seller/useSellerQueries';
import { resolveBikeMediaUrl } from '../../apis/sellerApi';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
}> = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

type SellerLocationState = {
  postListingSuccess?: boolean;
  postMessage?: string;
  newBikeId?: string;
};

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postState = location.state as SellerLocationState | null;

  const { data, isLoading, error, refetch, isFetching } =
    useSellerDashboardQuery();

  const [listPage, setListPage] = useState(1);
  const [listLimit] = useState(10);
  const [listStatus, setListStatus] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [listSortBy, setListSortBy] = useState('createdAt');
  const [listSortOrder, setListSortOrder] = useState<'asc' | 'desc'>('desc');

  const listQueryParams = useMemo(
    () => ({
      page: listPage,
      limit: listLimit,
      sortBy: listSortBy,
      sortOrder: listSortOrder,
      ...(listStatus ? { status: listStatus } : {}),
      ...(listSearch.trim() ? { search: listSearch.trim() } : {}),
    }),
    [listPage, listLimit, listSortBy, listSortOrder, listStatus, listSearch],
  );

  const bikesListQ = useSellerMyBikesQuery(listQueryParams);
  const visibilityMut = useSellerToggleBikeVisibilityMutation();
  const resubmitMut = useSellerResubmitBikeMutation();

  const sellerActionErrorMessage = (
    err: unknown,
    fallbackMsg: string,
  ): string => {
    const ax = err as {
      response?: { data?: { message?: string; error?: string } };
    };
    const d = ax.response?.data;
    return (
      (typeof d?.message === 'string' && d.message) ||
      (typeof d?.error === 'string' && d.error) ||
      fallbackMsg
    );
  };

  if (isLoading && !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">
        Đang tải tổng quan kênh bán...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          Không tải được dashboard.{' '}
          <button
            type="button"
            className="underline font-medium"
            onClick={() => void refetch()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { bikes, transactions, reputation } = data!;

  const dismissPostSuccess = () => {
    navigate(location.pathname, { replace: true, state: {} });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {postState?.postListingSuccess && (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          role="status"
        >
          <div className="space-y-1">
            <p className="font-semibold">Đã nhận tin đăng</p>
            <p>
              Tin đang <strong>chờ kiểm định</strong>, sau đó vào hàng chờ{' '}
              <strong>duyệt của admin</strong> mới hiển thị lên chợ. Thanh toán
              chỉ diễn ra khi có người mua xe.
            </p>
            {postState.postMessage && (
              <p className="text-emerald-900/90 text-xs">
                {postState.postMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismissPostSuccess}
            className="shrink-0 text-sm font-medium text-emerald-900 underline hover:no-underline"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tổng quan kênh bán
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Số liệu từ{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              GET /seller/v1/dashboard
            </code>
          </p>
        </div>
        {isFetching && !isLoading && (
          <div className="flex justify-end sm:items-center">
            <span className="text-xs text-gray-400">Đang cập nhật...</span>
          </div>
        )}
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Quản lý nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <Link
            to="/seller/tra-gia"
            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 hover:border-[#f57224]/40 hover:bg-orange-50/50"
          >
            <Handshake className="w-4 h-4 text-[#f57224] shrink-0" />
            Trả giá
          </Link>
          <Link
            to="/seller/don-hang"
            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 hover:border-[#f57224]/40 hover:bg-orange-50/50"
          >
            <ShoppingBag className="w-4 h-4 text-[#f57224] shrink-0" />
            Đơn hàng
          </Link>
          <Link
            to="/seller/tin-nhan"
            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 hover:border-[#f57224]/40 hover:bg-orange-50/50"
          >
            <MessageCircle className="w-4 h-4 text-[#f57224] shrink-0" />
            Tin nhắn
          </Link>
          <Link
            to="/seller/danh-gia"
            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 hover:border-[#f57224]/40 hover:bg-orange-50/50"
          >
            <Star className="w-4 h-4 text-amber-500 shrink-0" />
            Đánh giá
          </Link>
          <Link
            to="/seller/thong-ke"
            className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-gray-800 hover:border-[#f57224]/40 hover:bg-orange-50/50"
          >
            <BarChart3 className="w-4 h-4 text-[#f57224] shrink-0" />
            Thống kê
          </Link>
        </div>
      </section>

      {/* Tin đăng */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bike className="w-5 h-5 text-[#f57224]" />
          Tin đăng
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Tổng tin" value={bikes.total} />
          <StatCard label="Chờ duyệt" value={bikes.pending} />
          <StatCard label="Đã duyệt" value={bikes.approved} />
          <StatCard label="Từ chối" value={bikes.rejected} />
          <StatCard label="Đang ẩn" value={bikes.hidden} />
          <StatCard label="Đã bán" value={bikes.sold} />
        </div>
      </section>

      {/* Giao dịch */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#f57224]" />
          Giao dịch
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Tổng GD" value={transactions.total} />
          <StatCard label="Chờ xử lý" value={transactions.pending} />
          <StatCard label="Đã duyệt" value={transactions.approved} />
          <StatCard label="Hoàn thành" value={transactions.completed} />
          <StatCard label="Đã hủy" value={transactions.cancelled} />
          <StatCard
            label="Doanh thu"
            value={`${transactions.totalRevenue.toLocaleString('vi-VN')} đ`}
          />
        </div>
      </section>

      {/* Uy tín */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#f57224]" />
          Uy tín
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <StatCard label="Tổng đánh giá" value={reputation.totalReviews} />
          <StatCard
            label="Điểm trung bình"
            value={
              reputation.averageRating > 0
                ? reputation.averageRating.toFixed(1)
                : '—'
            }
            sub="/ 5"
          />
        </div>
      </section>

      {/* Danh sách tin — GET /seller/v1/bikes */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tin đăng của tôi
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              <code className="bg-gray-100 px-1 rounded">
                GET /seller/v1/bikes
              </code>{' '}
              — lọc theo Swagger (status, search, sortBy, sortOrder, page,
              limit)
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-wrap gap-3 items-stretch lg:items-end bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
              value={listStatus}
              onChange={(e) => {
                setListStatus(e.target.value);
                setListPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="hidden">hidden</option>
              <option value="sold">sold</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tìm (title, brand, model)
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Nhập từ khóa…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setListPage(1);
                }}
              />
            </div>
          </div>
          <div className="w-full sm:w-auto min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              sortBy
            </label>
            <select
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
              value={listSortBy}
              onChange={(e) => {
                setListSortBy(e.target.value);
                setListPage(1);
              }}
            >
              <option value="createdAt">createdAt</option>
              <option value="updatedAt">updatedAt</option>
              <option value="price">price</option>
              <option value="title">title</option>
            </select>
          </div>
          <div className="w-full sm:w-auto min-w-[120px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              sortOrder
            </label>
            <select
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
              value={listSortOrder}
              onChange={(e) => {
                setListSortOrder(e.target.value as 'asc' | 'desc');
                setListPage(1);
              }}
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setListPage(1)}
            className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            Tìm / Lọc
          </button>
        </div>

        {bikesListQ.isLoading && (
          <p className="text-sm text-gray-500 py-6">Đang tải danh sách tin…</p>
        )}
        {bikesListQ.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            Không tải được danh sách tin.{' '}
            <button
              type="button"
              className="underline font-medium"
              onClick={() => void bikesListQ.refetch()}
            >
              Thử lại
            </button>
          </div>
        )}
        {bikesListQ.data && (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-3 w-20">Ảnh</th>
                    <th className="px-3 py-3">Tiêu đề / Hãng / Model</th>
                    <th className="px-3 py-3">Danh mục</th>
                    <th className="px-3 py-3">Giá</th>
                    <th className="px-3 py-3">Trạng thái</th>
                    <th className="px-3 py-3">Kiểm định</th>
                    <th className="px-3 py-3 min-w-[7rem]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bikesListQ.data.data.map((row) => {
                    const thumb = row.images?.[0];
                    const canToggleVisibility =
                      row.status === 'approved' || row.status === 'hidden';
                    const visibilityLabel =
                      row.status === 'hidden' ? 'Hiện tin' : 'Ẩn tin';
                    const canResubmitInspection =
                      row.inspectionStatus === 'rejected';
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/80">
                        <td className="px-3 py-2">
                          {thumb ? (
                            <img
                              src={resolveBikeMediaUrl(thumb)}
                              alt=""
                              className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100" />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900">
                            {row.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {row.brand} · {row.model} · {row.year}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {row.category?.name ?? '—'}
                        </td>
                        <td className="px-3 py-2 font-medium tabular-nums">
                          {row.price.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {row.inspectionStatus}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-1.5 items-start">
                            <Link
                              to={`/seller/tin-dang/${row.id}`}
                              className="text-[#f57224] font-medium hover:underline"
                            >
                              Xem / sửa
                            </Link>
                            {(row.status === 'approved' ||
                              row.status === 'hidden') && (
                              <Link
                                to={`/tin-dang/${row.id}`}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 underline"
                              >
                                Xem trên chợ
                              </Link>
                            )}
                            {canToggleVisibility && (
                              <button
                                type="button"
                                disabled={
                                  visibilityMut.isPending &&
                                  visibilityMut.variables === row.id
                                }
                                onClick={() => {
                                  void visibilityMut
                                    .mutateAsync(row.id)
                                    .catch((e: unknown) => {
                                      window.alert(
                                        sellerActionErrorMessage(
                                          e,
                                          'Không đổi được trạng thái ẩn/hiện. Chỉ áp dụng khi tin đã duyệt hoặc đang ẩn.',
                                        ),
                                      );
                                    });
                                }}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 underline disabled:opacity-50"
                              >
                                {visibilityMut.isPending &&
                                visibilityMut.variables === row.id
                                  ? 'Đang xử lý…'
                                  : visibilityLabel}
                              </button>
                            )}
                            {canResubmitInspection && (
                              <button
                                type="button"
                                disabled={
                                  resubmitMut.isPending &&
                                  resubmitMut.variables === row.id
                                }
                                onClick={() => {
                                  void resubmitMut
                                    .mutateAsync(row.id)
                                    .catch((e: unknown) => {
                                      window.alert(
                                        sellerActionErrorMessage(
                                          e,
                                          'Chỉ gửi lại kiểm định được khi xe đã bị từ chối (rejected). Hãy cập nhật tin rồi thử lại.',
                                        ),
                                      );
                                    });
                                }}
                                className="text-xs font-medium text-blue-700 hover:text-blue-900 underline disabled:opacity-50"
                              >
                                {resubmitMut.isPending &&
                                resubmitMut.variables === row.id
                                  ? 'Đang gửi…'
                                  : 'Gửi lại kiểm định'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bikesListQ.data.data.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">
                Chưa có tin nào khớp bộ lọc.
              </p>
            )}
            {bikesListQ.data.meta && bikesListQ.data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 text-sm text-gray-600 pt-2">
                <span>
                  Trang {bikesListQ.data.meta.page} /{' '}
                  {bikesListQ.data.meta.totalPages} — tổng{' '}
                  {bikesListQ.data.meta.total} tin
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={listPage <= 1}
                    onClick={() => setListPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={
                      listPage >= (bikesListQ.data.meta?.totalPages ?? 1)
                    }
                    onClick={() => setListPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
            {bikesListQ.data.meta && bikesListQ.data.meta.totalPages <= 1 && (
              <p className="text-xs text-gray-400 pt-1">
                {bikesListQ.data.meta.total} tin (trang 1)
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
};
