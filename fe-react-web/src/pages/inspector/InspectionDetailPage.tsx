import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  useInspectorBikeDetailQuery,
  useInspectorSellerProfileQuery,
  useInspectorStartInspectionMutation,
  useInspectorSubmitInspectionMutation,
} from '../../hooks/inspector/useInspectorQueries';
import { formatInspectorPrice } from '../../utils/inspectorBikeDetail';
import { formatDateTimeVi } from '../../utils/formatDisplayDate';
import {
  getSellerListingCategories,
  resolveBikeMediaUrl,
} from '../../apis/sellerApi';

interface InspectionFormData {
  status: 'passed' | 'failed' | '';
  overallCondition: string;
  frameCondition: string;
  wheelCondition: string;
  brakeCondition: string;
  drivetrainCondition: string;
  inspectionNote: string;
  recommendation: string;
  images: File[];
}

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: vehicle,
    isLoading: bikeLoading,
    error: bikeQueryError,
  } = useInspectorBikeDetailQuery(id);
  const sellerProfileQ = useInspectorSellerProfileQuery(
    vehicle?.sellerId ?? null,
  );
  const startMut = useInspectorStartInspectionMutation();
  const submitMut = useInspectorSubmitInspectionMutation();
  const [error, setError] = useState<string | null>(null);
  const [inspectionStarted, setInspectionStarted] = useState(false);

  const loading = bikeLoading || startMut.isPending;
  const loadError =
    bikeQueryError instanceof Error
      ? bikeQueryError.message
      : bikeQueryError
        ? 'Không thể tải thông tin xe'
        : null;

  const [formData, setFormData] = useState<InspectionFormData>({
    status: '',
    overallCondition: '',
    frameCondition: '',
    wheelCondition: '',
    brakeCondition: '',
    drivetrainCondition: '',
    inspectionNote: '',
    recommendation: '',
    images: [],
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categoryIdTrim = vehicle?.categoryId?.trim() ?? '';
  const categoryNameTrim = vehicle?.categoryName?.trim() ?? '';
  const needCategoryLookup = Boolean(categoryIdTrim && !categoryNameTrim);

  const categoriesLookupQ = useQuery({
    queryKey: ['inspector', 'listing-categories', 'resolve'],
    queryFn: () => getSellerListingCategories(),
    enabled: needCategoryLookup,
    staleTime: 10 * 60 * 1000,
  });

  const categoryLookupName = useMemo(() => {
    if (!categoryIdTrim || !categoriesLookupQ.data?.length) return null;
    return (
      categoriesLookupQ.data.find((c) => c.id === categoryIdTrim)?.name ?? null
    );
  }, [categoryIdTrim, categoriesLookupQ.data]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setUploadedImages((prev) => [...prev, ...newImages]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleStartInspection = async () => {
    if (!id) return;
    try {
      await startMut.mutateAsync(id);
      setInspectionStarted(true);
    } catch {
      setError('Không thể bắt đầu kiểm định');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        status: formData.status,
        overallCondition: formData.overallCondition,
        frameCondition: formData.frameCondition,
        wheelCondition: formData.wheelCondition,
        brakeCondition: formData.brakeCondition,
        drivetrainCondition: formData.drivetrainCondition,
        inspectionNote: formData.inspectionNote,
        recommendation: formData.recommendation,
        inspectionImages: uploadedImages,
      };
      await submitMut.mutateAsync({ bikeId: id!, data: payload });
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/inspector');
      }, 2000);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể gửi kiểm định',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Đang tải thông tin xe...</div>;
  if (loadError) return <div className="text-red-500">{loadError}</div>;
  if (!vehicle) return <div>Không tìm thấy xe</div>;

  const sellerFromApi = sellerProfileQ.data;
  const sellerLabel =
    sellerFromApi?.name?.trim() ||
    vehicle.sellerName?.trim() ||
    vehicle.seller?.name?.trim() ||
    (sellerProfileQ.isPending && !sellerFromApi
      ? 'Đang tải thông tin người bán…'
      : null);

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Kiểm định thành công!
          </h2>
          <p className="text-gray-600">
            Xe đạp đã được kiểm định và lưu vào hệ thống
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {/* Back Button */}
      <button
        onClick={() => navigate('/inspector')}
        className="flex items-center gap-2 text-[#f57224] hover:text-[#e06818] font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      {/* Thông tin người bán + nội dung tin đăng (theo payload seller gửi) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vehicle.title}</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Mã tin: {vehicle.id}
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Người bán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <div>
              <p className="text-sm text-gray-600">Tên hiển thị</p>
              <p className="text-lg font-semibold text-gray-900">
                {sellerLabel ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mã người bán (sellerId)</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {vehicle.sellerId ?? '—'}
              </p>
            </div>
            {sellerFromApi?.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base text-gray-900">{sellerFromApi.email}</p>
              </div>
            )}
            {sellerFromApi?.phone != null && sellerFromApi.phone !== '' && (
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="text-base text-gray-900">{sellerFromApi.phone}</p>
              </div>
            )}
            {vehicle.sellerId && sellerProfileQ.isError && (
              <p className="text-sm text-amber-700 md:col-span-2">
                Không tải được hồ sơ công khai qua{' '}
                <code className="text-xs bg-amber-100 px-1 rounded">
                  GET /profile/v1/:sellerId
                </code>
                . Vẫn hiển thị đủ dữ liệu tin đăng bên dưới.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Nội dung đơn đăng bán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Giá rao</p>
              <p className="text-lg font-semibold text-[#f57224]">
                {formatInspectorPrice(vehicle.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tình trạng (condition)</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.condition?.trim() ? vehicle.condition : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hãng</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.brand ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Model</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.model ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Năm sản xuất</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.year != null ? vehicle.year : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số km đã đi</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.mileage != null && vehicle.mileage !== ''
                  ? String(vehicle.mileage)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Màu sắc</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.color ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Danh mục</p>
              {categoryNameTrim ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    {categoryNameTrim}
                  </p>
                  {categoryIdTrim ? (
                    <p className="mt-0.5 break-all font-mono text-xs text-gray-500">
                      ID: {categoryIdTrim}
                    </p>
                  ) : null}
                </>
              ) : categoryIdTrim ? (
                <>
                  {categoryLookupName ? (
                    <p className="text-lg font-semibold text-gray-900">
                      {categoryLookupName}
                    </p>
                  ) : categoriesLookupQ.isFetching ? (
                    <p className="text-sm text-gray-500">
                      Đang tải tên danh mục…
                    </p>
                  ) : categoriesLookupQ.isError ? (
                    <p className="text-sm text-amber-800">
                      Không tải được danh sách danh mục để tra tên.
                    </p>
                  ) : (
                    <p className="text-sm text-amber-800">
                      API tin không gửi tên danh mục; không tìm thấy ID trong
                      danh sách hệ thống.
                    </p>
                  )}
                  <p className="mt-0.5 break-all font-mono text-xs text-gray-500">
                    ID: {categoryIdTrim}
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-900">—</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày tạo / cập nhật</p>
              <dl className="mt-1 space-y-1.5 text-sm text-gray-900">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-gray-500">Tạo</dt>
                  <dd>{formatDateTimeVi(vehicle.createdAt)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <dt className="font-medium text-gray-500">Cập nhật</dt>
                  <dd>{formatDateTimeVi(vehicle.updatedAt)}</dd>
                </div>
              </dl>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Mô tả</p>
              <p className="text-base text-gray-900 whitespace-pre-wrap mt-1">
                {vehicle.description?.trim() ? vehicle.description : '—'}
              </p>
            </div>
            {vehicle.video && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Video</p>
                <a
                  href={vehicle.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#f57224] font-medium hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {vehicle.video}
                </a>
              </div>
            )}
          </div>
        </section>

        {vehicle.images && vehicle.images.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Ảnh seller đăng kèm
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {vehicle.images.map((src, i) => (
                <a
                  key={`${src}-${i}`}
                  href={resolveBikeMediaUrl(src)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={resolveBikeMediaUrl(src)}
                    alt=""
                    className="w-full h-full object-cover hover:opacity-90"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Condition Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#f57224]" />
            Đánh giá tình trạng
          </h2>

          <div className="space-y-4">
            {/* Inspection Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kết quả kiểm định *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn kết quả</option>
                <option value="passed">Đạt</option>
                <option value="failed">Không đạt</option>
              </select>
            </div>

            {/* Overall Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng chung *
              </label>
              <select
                name="overallCondition"
                value={formData.overallCondition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn tình trạng</option>
                <option value="excellent">Tuyệt vời - Như mới</option>
                <option value="good">Tốt - Ít sử dụng</option>
                <option value="fair">Bình thường - Đã sử dụng</option>
                <option value="poor">Kém - Cần sửa chữa</option>
              </select>
            </div>

            {/* Frame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng khung *
              </label>
              <select
                name="frameCondition"
                value={formData.frameCondition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn tình trạng</option>
                <option value="perfect">Hoàn hảo</option>
                <option value="minor">Vết nhỏ nhưng không ảnh hưởng</option>
                <option value="damaged">Bị biến dạng</option>
              </select>
            </div>

            {/* Wheels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng bánh *
              </label>
              <select
                name="wheelCondition"
                value={formData.wheelCondition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn tình trạng</option>
                <option value="new">Bánh mới</option>
                <option value="good">Bánh tốt</option>
                <option value="worn">Bánh mòn, cần thay</option>
              </select>
            </div>

            {/* Brakes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng phanh *
              </label>
              <select
                name="brakeCondition"
                value={formData.brakeCondition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn tình trạng</option>
                <option value="working">Phanh hoạt động tốt</option>
                <option value="weak">Phanh yếu, cần điều chỉnh</option>
                <option value="broken">Phanh hỏng, cần thay</option>
              </select>
            </div>

            {/* Drivetrain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng truyền động *
              </label>
              <select
                name="drivetrainCondition"
                value={formData.drivetrainCondition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224]"
              >
                <option value="">Chọn tình trạng</option>
                <option value="smooth">Truyền động mượt</option>
                <option value="reasonable">Hợp lý, có thể cải thiện</option>
                <option value="issues">Có vấn đề, cần sửa</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                name="inspectionNote"
                value={formData.inspectionNote}
                onChange={handleInputChange}
                placeholder="Nhập bất kỳ nhận xét hoặc vấn đề khác..."
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224] resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khuyến nghị
              </label>
              <textarea
                name="recommendation"
                value={formData.recommendation}
                onChange={handleInputChange}
                placeholder="Khuyến nghị dành cho buyer/seller..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f57224] resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#f57224]" />
            Upload hình ảnh kiểm định
          </h2>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#f57224] transition-colors"
            onClick={() => document.getElementById('imageInput')?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">
              Nhấp để tải lên hoặc kéo thả
            </p>
            <p className="text-sm text-gray-500">
              Hỗ trợ: JPG, PNG (tối đa 5MB)
            </p>
            <input
              id="imageInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Hình ảnh đã tải ({uploadedImages.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/inspector')}
            className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg bg-[#f57224] text-white font-medium hover:bg-[#e06818] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Dang lưu...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Xác nhận kiểm định
              </>
            )}
          </button>
        </div>
      </form>

      {/* Nút bắt đầu kiểm định */}
      {!inspectionStarted && (
        <button
          onClick={handleStartInspection}
          className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          disabled={loading || startMut.isPending}
        >
          Bắt đầu kiểm định
        </button>
      )}
    </div>
  );
};
