import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  getBikeDetails,
  startInspection,
  submitInspection,
} from '../../apis/inspectorApi';

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
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectionStarted, setInspectionStarted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBikeDetails(id)
      .then((res) => setVehicle(res.data))
      .catch(() => setError('Không thể tải thông tin xe'))
      .finally(() => setLoading(false));
  }, [id]);

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
    setLoading(true);
    try {
      await startInspection(id);
      setInspectionStarted(true);
    } catch {
      setError('Không thể bắt đầu kiểm định');
    } finally {
      setLoading(false);
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
      await submitInspection(id!, payload);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/inspector');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi kiểm định');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Đang tải thông tin xe...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!vehicle) return <div>Không tìm thấy xe</div>;

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
      {/* Back Button */}
      <button
        onClick={() => navigate('/inspector')}
        className="flex items-center gap-2 text-[#f57224] hover:text-[#e06818] font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>

      {/* Vehicle Info Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{vehicle.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Người bán</p>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.seller?.name || vehicle.sellerName || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Giá</p>
            <p className="text-lg font-semibold text-[#f57224]">
              {vehicle.price
                ? Number(vehicle.price).toLocaleString('vi-VN') + ' đ'
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tình trạng ban đầu</p>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.condition}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mô tả</p>
            <p className="text-lg font-semibold text-gray-900">
              {vehicle.description}
            </p>
          </div>
        </div>
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
          disabled={loading}
        >
          Bắt đầu kiểm định
        </button>
      )}
    </div>
  );
};
