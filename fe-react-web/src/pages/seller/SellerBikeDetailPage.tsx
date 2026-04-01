import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import {
  useSellerBikeDetailQuery,
  useSellerDeleteBikeMutation,
} from '../../hooks/seller/useSellerQueries';
import { resolveBikeMediaUrl } from '../../apis/sellerApi';
import { formatDateTimeVi } from '../../utils/formatDisplayDate';
import {
  translateBikeStatus,
  translateInspectionStatus,
  translateBikeCondition,
  translateTransactionStatus,
} from '../../utils/translations';

export const SellerBikeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteMut = useSellerDeleteBikeMutation();
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useSellerBikeDetailQuery(id);

  const bike = data?.data;
  const loadError =
    error instanceof Error
      ? error.message
      : error
        ? 'Không tải được chi tiết tin.'
        : null;

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-500">Đang tải tin đăng…</div>
    );
  }

  if (loadError || !bike) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 mb-4">{loadError || 'Không có dữ liệu.'}</p>
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 text-[#f57224] font-medium hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Về kênh bán
        </Link>
        <button
          type="button"
          onClick={() => void refetch()}
          className="block mx-auto mt-4 text-sm text-gray-600 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224]"
        >
          <ChevronLeft className="w-4 h-4" />
          Về kênh bán
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/seller/tin-dang/${bike.id}/chinh-sua`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f57224] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e0651a]"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa tin
          </Link>
          {(bike.status === 'approved' || bike.status === 'hidden') && (
            <Link
              to={`/tin-dang/${bike.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              Xem trên chợ
            </Link>
          )}
          <button
            type="button"
            disabled={deleteMut.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            onClick={() => {
              setDeleteErr(null);
              if (
                !window.confirm(
                  'Xóa tin đăng này? Hành động không hoàn tác (nếu backend cho phép).',
                )
              ) {
                return;
              }
              if (!bike.id) return;
              void deleteMut
                .mutateAsync(bike.id)
                .then(() => navigate('/seller', { replace: true }))
                .catch((err: unknown) => {
                  const msg =
                    (err as { response?: { data?: { message?: string } } })
                      ?.response?.data?.message || 'Không xóa được tin.';
                  setDeleteErr(msg);
                });
            }}
          >
            <Trash2 className="w-4 h-4" />
            {deleteMut.isPending ? 'Đang xóa…' : 'Xóa tin'}
          </button>
        </div>
        {deleteErr && (
          <p className="text-sm text-red-600 w-full sm:text-right">
            {deleteErr}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{bike.title}</h1>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {translateBikeStatus(bike.status)}
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
              Kiểm định: {translateInspectionStatus(bike.inspectionStatus)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-xl font-semibold text-[#f57224]">
          {bike.price.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Danh mục: {bike.category?.name ?? 'Chưa phân loại'}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Hãng / Model</dt>
            <dd className="font-medium text-gray-900">
              {bike.brand} · {bike.model} · {bike.year}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Tình trạng</dt>
            <dd className="font-medium text-gray-900">
              {translateBikeCondition(bike.condition)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Màu</dt>
            <dd className="font-medium text-gray-900">{bike.color || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Số km</dt>
            <dd className="font-medium text-gray-900">
              {bike.mileage != null ? String(bike.mileage) : '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Tạo / Cập nhật</dt>
            <dd className="text-gray-900">
              {formatDateTimeVi(bike.createdAt)} —{' '}
              {formatDateTimeVi(bike.updatedAt)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-500">Mô tả</p>
          <p className="mt-1 whitespace-pre-wrap text-gray-900">
            {bike.description || '—'}
          </p>
        </div>
        {bike.video && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 mb-1">Video</p>
            <a
              href={bike.video}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#f57224] hover:underline"
            >
              {bike.video}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {bike.images?.length ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ảnh
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {bike.images.map((src, i) => (
              <a
                key={`${src}-${i}`}
                href={resolveBikeMediaUrl(src)}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
              >
                <img
                  src={resolveBikeMediaUrl(src)}
                  alt=""
                  className="h-full w-full object-cover hover:opacity-90"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Kết Quả Kiểm Định
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Đánh giá chi tiết về tình trạng xe từ kiểm định viên
          </p>
        </div>

        {!bike.inspections?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              Chưa có bản ghi kiểm định
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Tin của bạn sẽ được kiểm định khi được gửi duyệt
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const newestInspection =
                bike.inspections?.length > 0
                  ? [...bike.inspections].sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )[0]
                  : null;
              return newestInspection ? (
                <div
                  key={0}
                  className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-6 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                            newestInspection.status === 'passed'
                              ? 'bg-green-100 text-green-700'
                              : newestInspection.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {newestInspection.status === 'passed'
                            ? '✓'
                            : newestInspection.status === 'failed'
                              ? '✕'
                              : '−'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {newestInspection.status === 'passed'
                              ? 'Đạt Tiêu Chuẩn'
                              : newestInspection.status === 'failed'
                                ? 'Không Đạt Tiêu Chuẩn'
                                : 'Chờ Kết Quả'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(
                              newestInspection.createdAt,
                            ).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${
                          newestInspection.status === 'passed'
                            ? 'bg-green-100 text-green-700'
                            : newestInspection.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {translateBikeCondition(
                          newestInspection.overallCondition,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-5 space-y-4">
                    {/* Assessment Grid */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Đánh Giá Chi Tiết
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="rounded border border-gray-300 p-3 bg-white">
                          <p className="text-xs text-gray-600 mb-2">Khung Xe</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {translateBikeCondition(
                              newestInspection.frameCondition,
                            ) || '—'}
                          </p>
                        </div>

                        <div className="rounded border border-gray-300 p-3 bg-white">
                          <p className="text-xs text-gray-600 mb-2">Bánh Xe</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {translateBikeCondition(
                              newestInspection.wheelCondition,
                            ) || '—'}
                          </p>
                        </div>

                        <div className="rounded border border-gray-300 p-3 bg-white">
                          <p className="text-xs text-gray-600 mb-2">Hệ Phanh</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {translateBikeCondition(
                              newestInspection.brakeCondition,
                            ) || '—'}
                          </p>
                        </div>

                        <div className="rounded border border-gray-300 p-3 bg-white">
                          <p className="text-xs text-gray-600 mb-2">
                            Truyền Động
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {translateBikeCondition(
                              newestInspection.drivetrainCondition,
                            ) || '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Recommendations */}
                    {(newestInspection.inspectionNote ||
                      newestInspection.recommendation) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newestInspection.inspectionNote && (
                          <div className="rounded border border-gray-300 bg-white p-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                              Ghi Chú
                            </p>
                            <p className="text-sm text-gray-700">
                              {newestInspection.inspectionNote}
                            </p>
                          </div>
                        )}

                        {newestInspection.recommendation && (
                          <div className="rounded border border-gray-300 bg-white p-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                              Khuyến Nghị
                            </p>
                            <p className="text-sm text-gray-700">
                              {newestInspection.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inspection Images */}
                    {newestInspection.inspectionImages &&
                      newestInspection.inspectionImages.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-3">
                            Ảnh Kiểm Định (
                            {newestInspection.inspectionImages?.length})
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {newestInspection.inspectionImages?.map(
                              (img, i) => (
                                <div
                                  key={i}
                                  className="rounded border border-gray-300 overflow-hidden"
                                >
                                  <img
                                    src={img}
                                    alt={`inspection-${i}`}
                                    className="w-full h-24 object-cover"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch Sử Giao Dịch
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Chi tiết các đơn mua và trạng thái thanh toán
          </p>
        </div>

        {!bike.transactions?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Chưa có giao dịch</p>
            <p className="text-sm text-gray-500 mt-1">
              Giao dịch sẽ xuất hiện tại đây khi có người đặt mua xe
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bike.transactions.map((tx, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-200">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {tx.buyer?.name || 'Ẩn danh'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#f57224]">
                        {(tx.amount || 0).toLocaleString('vi-VN')} đ
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold mt-2 ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : tx.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {translateTransactionStatus(tx.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-3">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase">
                      Thông Tin Khách Hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="rounded border border-gray-300 p-3 bg-white">
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1 break-all">
                          {tx.buyer?.email || '—'}
                        </p>
                      </div>
                      <div className="rounded border border-gray-300 p-3 bg-white">
                        <p className="text-xs text-gray-600">Điện Thoại</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {tx.buyer?.phone || '—'}
                        </p>
                      </div>
                      <div className="rounded border border-gray-300 p-3 bg-white">
                        <p className="text-xs text-gray-600">
                          Phương Thức Thanh Toán
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {tx.paymentMethod === 'vnpay'
                            ? 'VNPay'
                            : tx.paymentMethod === 'transfer'
                              ? 'Chuyển khoản'
                              : tx.paymentMethod === 'cash'
                                ? 'Tiền mặt'
                                : 'Trực tiếp'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {tx.notes && (
                    <div className="rounded border border-gray-300 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                        Ghi Chú
                      </p>
                      <p className="text-sm text-gray-700">{tx.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
