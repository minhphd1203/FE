import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ExternalLink, User, Tag, Calendar, Hash } from 'lucide-react';
import type { AdminBike } from '../../apis/adminApi';

const API_ORIGIN =
  (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(
    /\/api\/?$/,
    '',
  ) || 'http://localhost:3000';

function resolvePublicAssetUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${p}`;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);

const formatDate = (d?: string) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('vi-VN');
  } catch {
    return d;
  }
};

type AdminListingDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: AdminBike | null;
};

const statusLabel: Record<string, string> = {
  approved: 'Đang hiển thị',
  pending: 'Chờ duyệt',
  rejected: 'Đã từ chối',
};

export const AdminListingDetailModal: React.FC<
  AdminListingDetailModalProps
> = ({ open, onOpenChange, bike }) => {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (open && bike) setActiveImage(0);
  }, [open, bike?.id]);

  if (!bike) return null;

  const images = Array.isArray(bike.images) ? bike.images.filter(Boolean) : [];
  const mainSrc = images[activeImage]
    ? resolvePublicAssetUrl(images[activeImage])
    : '';

  const extra = bike as AdminBike & {
    mileage?: number;
    color?: string;
    video?: string | null;
    isVerified?: string;
    inspectionStatus?: string;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] flex max-h-[min(92vh,880px)] w-[min(96vw,920px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-xl focus:outline-none">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div className="min-w-0 pr-2">
              <Dialog.Title className="text-lg font-semibold text-gray-900 sm:text-xl">
                Chi tiết tin đăng
              </Dialog.Title>
              <Dialog.Description className="mt-1 line-clamp-2 text-sm text-gray-500">
                {bike.title}
              </Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              {/* Ảnh */}
              <div className="space-y-3">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                  {mainSrc ? (
                    <img
                      src={mainSrc}
                      alt={bike.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&h=600&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {images.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors ${
                          i === activeImage
                            ? 'border-[#f57224] ring-2 ring-[#f57224]/20'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={resolvePublicAssetUrl(src)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Thông tin */}
              <div className="space-y-5">
                <div>
                  <p className="text-2xl font-bold text-[#f57224]">
                    {formatPrice(bike.price)}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      bike.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : bike.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {statusLabel[bike.status] ?? bike.status}
                  </span>
                </div>

                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Hãng / Model
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                      {bike.brand} {bike.model}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Năm SX
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                      {bike.year}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Tình trạng
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">
                      {bike.condition}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Danh mục
                    </dt>
                    <dd className="mt-0.5 flex items-center gap-1 font-medium text-gray-900">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      {bike.category?.name ?? '—'}
                    </dd>
                  </div>
                  {extra.mileage != null && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <dt className="text-xs font-medium text-gray-500">
                        Số km
                      </dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {extra.mileage.toLocaleString('vi-VN')} km
                      </dd>
                    </div>
                  )}
                  {extra.color && (
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <dt className="text-xs font-medium text-gray-500">
                        Màu sắc
                      </dt>
                      <dd className="mt-0.5 font-medium text-gray-900">
                        {extra.color}
                      </dd>
                    </div>
                  )}
                </dl>

                <div>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Mô tả
                  </h3>
                  <p className="whitespace-pre-wrap rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-700">
                    {bike.description?.trim() || 'Không có mô tả.'}
                  </p>
                </div>

                {extra.video && (
                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Video
                    </h3>
                    <a
                      href={extra.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f57224] hover:underline"
                    >
                      Mở liên kết video
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <User className="h-4 w-4 text-gray-400" />
                    Người bán
                  </h3>
                  <ul className="space-y-1.5 text-sm text-gray-800">
                    <li>
                      <span className="text-gray-500">Tên: </span>
                      {bike.seller?.name ?? '—'}
                    </li>
                    <li>
                      <span className="text-gray-500">Email: </span>
                      {bike.seller?.email ?? '—'}
                    </li>
                    <li>
                      <span className="text-gray-500">Điện thoại: </span>
                      {bike.seller?.phone ?? '—'}
                    </li>
                    <li className="flex items-center gap-1 pt-1 font-mono text-xs text-gray-500">
                      <Hash className="h-3 w-3 shrink-0" />
                      sellerId: {bike.sellerId}
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Tạo: {formatDate(bike.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Cập nhật: {formatDate(bike.updatedAt)}
                  </span>
                  <span className="font-mono">bikeId: {bike.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-3 sm:px-6">
            {bike.status === 'approved' && (
              <a
                href={`/tin-dang/${bike.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Xem trên chợ
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Đóng
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
