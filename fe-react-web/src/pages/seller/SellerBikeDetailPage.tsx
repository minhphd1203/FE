import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil, ExternalLink, Trash2 } from 'lucide-react';
import {
  useSellerBikeDetailQuery,
  useSellerDeleteBikeMutation,
} from '../../hooks/seller/useSellerQueries';
import { resolveBikeMediaUrl } from '../../apis/sellerApi';
import { formatDateTimeVi } from '../../utils/formatDisplayDate';

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
              {bike.status}
            </span>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
              Kiểm định: {bike.inspectionStatus}
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
            <dd className="font-medium text-gray-900">{bike.condition}</dd>
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

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Kiểm định (API: inspections)
        </h2>
        {!bike.inspections?.length ? (
          <p className="text-sm text-gray-500">Chưa có bản ghi kiểm định.</p>
        ) : (
          <ul className="space-y-3">
            {bike.inspections.map((row, idx) => (
              <li
                key={idx}
                className="rounded-lg bg-gray-50 p-3 text-xs font-mono text-gray-800 overflow-x-auto"
              >
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Giao dịch (API: transactions)
        </h2>
        {!bike.transactions?.length ? (
          <p className="text-sm text-gray-500">Chưa có giao dịch.</p>
        ) : (
          <ul className="space-y-3">
            {bike.transactions.map((row, idx) => (
              <li
                key={idx}
                className="rounded-lg bg-gray-50 p-3 text-xs font-mono text-gray-800 overflow-x-auto"
              >
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
