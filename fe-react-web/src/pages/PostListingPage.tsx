import React, { useMemo, useState } from 'react';
import {
  useSellerListingCategoriesQuery,
  useSellerPostBikeMutation,
} from '../hooks/seller/useSellerQueries';
import {
  buildPostBikeFormData,
  extractBikeIdFromPostResponse,
  type ListingCategoryOption,
} from '../apis/sellerApi';
import { parseVndPriceInput } from '../utils/parseVndPrice';
import { Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function getApiErrorMessage(err: unknown): string {
  const ax = err as {
    response?: { data?: { message?: string; error?: string }; status?: number };
    message?: string;
  };
  const d = ax.response?.data;
  const msg =
    (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error === 'string' && d.error) ||
    ax.message;
  if (msg) return msg;
  if (!ax.response) {
    return 'Không kết nối được máy chủ. Kiểm tra backend đang chạy (vd. port 3000) và biến VITE_API_URL.';
  }
  return `Đăng tin thất bại (${ax.response?.status ?? '?'})`;
}

type ImageItem = { file: File; preview: string };

export const PostListingPage: React.FC = () => {
  const navigate = useNavigate();
  const postBikeMut = useSellerPostBikeMutation();
  const {
    data: apiCategories,
    isLoading: categoriesLoading,
    isFetched: categoriesFetched,
    isError: categoriesQueryError,
    refetch: refetchCategories,
  } = useSellerListingCategoriesQuery();

  const categoryOptions = useMemo((): ListingCategoryOption[] => {
    return apiCategories && apiCategories.length > 0 ? apiCategories : [];
  }, [apiCategories]);

  const categoriesLoadError =
    categoriesFetched && !categoriesLoading && !categoryOptions.length;

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    price: '',
    condition: 'excellent',
    mileage: '',
    color: '',
    video: '',
    description: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || imageItems.length >= 5) return;
    setImageItems((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file) },
    ]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageItems((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (imageItems.length === 0) {
      setSubmitError(
        'Vui lòng tải ít nhất một ảnh (jpeg, png, webp hoặc gif).',
      );
      return;
    }

    const catId = formData.categoryId.trim();
    if (!catId) {
      setSubmitError('Vui lòng chọn loại xe đạp (danh mục).');
      return;
    }

    const amount = parseVndPriceInput(formData.price);
    if (amount == null || amount <= 0) {
      setSubmitError(
        'Giá không hợp lệ. Nhập số VNĐ, ví dụ 45000000 hoặc 45.000.000 (dấu chấm chỉ để phân cách hàng nghìn).',
      );
      return;
    }

    const fd = buildPostBikeFormData({
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
      imageFiles: imageItems.map((i) => i.file),
    });

    try {
      const res = await postBikeMut.mutateAsync(fd);
      const bikeId =
        extractBikeIdFromPostResponse(res) ?? res.data?.id ?? uuidv4();
      /* Thanh toán là luồng buyer khi mua xe — sau đăng tin về kênh bán (pending → kiểm định → duyệt). */
      navigate('/seller', {
        replace: true,
        state: {
          postListingSuccess: true,
          newBikeId: bikeId,
          postMessage:
            typeof res.message === 'string' && res.message.trim() !== ''
              ? res.message
              : undefined,
        },
      });
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  /** Demo luồng buyer thanh toán — không liên quan bước seller đăng tin. */
  const goToCheckoutDemo = () => {
    const amount = parseVndPriceInput(formData.price) ?? 0;
    navigate('/thanh-toan', {
      state: { bikeId: uuidv4(), amount, demo: true },
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Đăng tin bán xe cũ</h1>
        <span className="text-sm text-gray-500">Bước 1/1</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <p className="text-xs text-gray-500">
          Sau đăng tin, hệ thống sẽ tiến hành kiểm duyệt trước khi hiển thị công
          khai. Giao dịch thanh toán sẽ được thực hiện khi có người mua.
        </p>

        {categoriesLoadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              {categoriesQueryError
                ? 'Không tải được danh mục từ máy chủ.'
                : 'Danh mục không khả dụng.'}
            </span>
            <button
              type="button"
              onClick={() => void refetchCategories()}
              className="text-sm font-medium text-red-950 underline shrink-0"
            >
              Thử tải lại
            </button>
          </div>
        )}

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3 space-y-2">
            <p className="font-medium">Không đăng tin được</p>
            <p>{submitError}</p>
            <button
              type="button"
              onClick={goToCheckoutDemo}
              className="text-xs underline text-red-700 hover:text-red-900"
            >
              Chỉ dùng thử nghiệm: sang trang thanh toán với mã xe giả
            </button>
          </div>
        )}

        {/* Ảnh — mỗi file một part `images` */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Hình ảnh <span className="text-red-500">*</span> (tối đa 5,
            jpeg/png/webp/gif)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {imageItems.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
              >
                <img
                  src={item.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {imageItems.length < 5 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#f57224] hover:bg-orange-50 transition-colors">
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-medium">
                  Đăng ảnh
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="post-listing-category"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Loại xe đạp <span className="text-red-500">*</span>
          </label>
          {categoriesLoading && !categoriesFetched ? (
            <select
              id="post-listing-category"
              disabled
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-wait"
              value=""
            >
              <option value="">Đang tải danh mục…</option>
            </select>
          ) : (
            <select
              id="post-listing-category"
              required
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              <option value="">-- Chọn loại xe đạp --</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-4">
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
                placeholder="Vd: Giant, Trek…"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Dòng xe / Model <span className="text-red-500">*</span>
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
              <label
                htmlFor="post-listing-price"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="post-listing-price"
                type="text"
                inputMode="numeric"
                required
                autoComplete="off"
                placeholder="Ví dụ: 45000000 hoặc 45.000.000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Có thể gõ số liền hoặc dùng dấu chấm phân hàng nghìn; gửi lên
                API là số nguyên (VNĐ).
              </p>
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
                Số km đã đi (tuỳ chọn)
              </label>
              <input
                type="text"
                placeholder="Vd: 1200"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({ ...formData, mileage: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Màu sắc (tuỳ chọn)
              </label>
              <input
                type="text"
                placeholder="Vd: Đỏ đen"
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
              Link video (tuỳ chọn)
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.video}
              onChange={(e) =>
                setFormData({ ...formData, video: e.target.value })
              }
            />
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

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={postBikeMut.isPending}
            className="px-8 py-2.5 bg-[#f57224] text-white font-bold rounded-lg hover:bg-[#e0651a] transition-colors shadow-sm disabled:opacity-60"
          >
            {postBikeMut.isPending ? 'Đang đăng...' : 'Đăng tin ngay'}
          </button>
        </div>
      </form>
    </div>
  );
};
