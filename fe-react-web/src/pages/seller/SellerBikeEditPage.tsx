import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Camera, X } from 'lucide-react';
import {
  useSellerBikeDetailQuery,
  useSellerListingCategoriesQuery,
  useSellerUpdateBikeMutation,
} from '../../hooks/seller/useSellerQueries';
import {
  buildUpdateBikeFormData,
  type ListingCategoryOption,
} from '../../apis/sellerApi';
import { CATEGORIES } from '../../constants/data';
import { parseVndPriceInput } from '../../utils/parseVndPrice';

function getApiErrorMessage(err: unknown): string {
  const ax = err as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };
  const d = ax.response?.data;
  const msg =
    (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error === 'string' && d.error) ||
    ax.message;
  if (msg) return msg;
  if (!ax.response) {
    return 'Không kết nối được máy chủ.';
  }
  return `Cập nhật thất bại (${ax.response?.status ?? '?'})`;
}

type ImageItem = { file: File; preview: string };

const FALLBACK_LISTING_CATEGORIES: ListingCategoryOption[] = CATEGORIES.map(
  (c) => ({
    id: String(c.id),
    name: c.label,
    slug: c.slug,
  }),
);

export const SellerBikeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detailQ = useSellerBikeDetailQuery(id);
  const updateMut = useSellerUpdateBikeMutation();
  const { data: apiCategories } = useSellerListingCategoriesQuery();

  const categoryOptions = useMemo((): ListingCategoryOption[] => {
    if (apiCategories && apiCategories.length > 0) return apiCategories;
    return FALLBACK_LISTING_CATEGORIES;
  }, [apiCategories]);

  const bike = detailQ.data?.data;
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    condition: 'excellent',
    mileage: '',
    color: '',
    video: '',
    description: '',
  });
  const [newImages, setNewImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (!bike || hydrated) return;
    setFormData({
      categoryId: bike.categoryId?.trim()
        ? bike.categoryId
        : (bike.category?.id ?? ''),
      title: bike.title ?? '',
      brand: bike.brand ?? '',
      model: bike.model ?? '',
      year: String(bike.year ?? ''),
      price:
        bike.price != null
          ? bike.price.toLocaleString('vi-VN').replace(/\./g, '')
          : '',
      condition: bike.condition || 'excellent',
      mileage:
        bike.mileage != null && bike.mileage !== '' ? String(bike.mileage) : '',
      color: bike.color ?? '',
      video: bike.video ?? '',
      description: bike.description ?? '',
    });
    setHydrated(true);
  }, [bike, hydrated]);

  useEffect(() => {
    if (!id) return;
    setHydrated(false);
  }, [id]);

  const handleNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || newImages.length >= 5) return;
    setNewImages((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file) },
    ]);
    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError(null);

    const catId = formData.categoryId.trim();
    if (!catId) {
      setSubmitError('Vui lòng chọn danh mục.');
      return;
    }

    const amount = parseVndPriceInput(formData.price);
    if (amount == null || amount <= 0) {
      setSubmitError('Giá không hợp lệ.');
      return;
    }

    const fd = buildUpdateBikeFormData({
      title: formData.title.trim(),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: formData.year.trim(),
      price: amount,
      condition: formData.condition,
      categoryId: catId,
      mileage: formData.mileage.trim(),
      color: formData.color.trim(),
      video: formData.video.trim(),
      imageFiles:
        newImages.length > 0 ? newImages.map((i) => i.file) : undefined,
    });

    try {
      await updateMut.mutateAsync({ bikeId: id, formData: fd });
      navigate(`/seller/tin-dang/${id}`, { replace: true });
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  if (detailQ.isLoading && !bike) {
    return (
      <div className="py-12 text-center text-gray-500">Đang tải tin đăng…</div>
    );
  }

  if (detailQ.error || !bike) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-red-600 mb-4">
          {detailQ.error instanceof Error
            ? detailQ.error.message
            : 'Không tải được tin để sửa.'}
        </p>
        <Link
          to="/seller"
          className="text-[#f57224] font-medium hover:underline"
        >
          Về kênh bán
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={`/seller/tin-dang/${id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Chi tiết tin
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Sửa tin đăng</h1>
          <p className="text-xs text-amber-800 mt-1">
            PUT{' '}
            <code className="bg-amber-100 px-1 rounded">
              /api/seller/v1/bikes/&#123;id&#125;
            </code>
            — sửa phần cốt lõi có thể khiến tin về trạng thái chờ duyệt (theo
            backend).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {submitError}
          </p>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
          >
            <option value="">— Chọn —</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Hãng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Năm <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1980}
              max={new Date().getFullYear() + 1}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tình trạng <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
            >
              <option value="excellent">Xuất sắc / Như mới</option>
              <option value="good">Tốt</option>
              <option value="fair">Khá</option>
              <option value="poor">Cũ / Cần sửa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Số km (tuỳ chọn)
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.mileage}
              onChange={(e) =>
                setFormData({ ...formData, mileage: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Màu
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Link video
          </label>
          <input
            type="url"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.video}
            onChange={(e) =>
              setFormData({ ...formData, video: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Ảnh mới (tuỳ chọn — không chọn = giữ ảnh cũ trên server)
          </label>
          <div className="flex flex-wrap gap-3">
            {newImages.map((item, idx) => (
              <div key={item.preview} className="relative w-24 h-24">
                <img
                  src={item.preview}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-200 p-1 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {newImages.length < 5 && (
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#f57224]">
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Thêm</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleNewImage}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
          <Link
            to={`/seller/tin-dang/${id}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={updateMut.isPending}
            className="px-8 py-2.5 bg-[#f57224] text-white font-bold rounded-lg hover:bg-[#e0651a] disabled:opacity-60"
          >
            {updateMut.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};
