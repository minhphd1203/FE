import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const VEHICLE_DETAILS: Record<
  string,
  {
    id: number;
    title: string;
    seller: string;
    price: string;
    condition: string;
    submittedDate: string;
    description: string;
  }
> = {
  '1': {
    id: 1,
    title: 'Xe đạp địa hình Giant Talon 3',
    seller: 'Nguyễn Văn A',
    price: '8.500.000 đ',
    condition: 'Mới',
    submittedDate: '2 giờ trước',
    description: 'Xe đạp địa hình chất lượng cao, khung nhôm, bánh 29 inch',
  },
  '2': {
    id: 2,
    title: 'Xe đạp đua Pinarello F12',
    seller: 'Trần Thị B',
    price: '45.000.000 đ',
    condition: 'Tốt',
    submittedDate: '3 giờ trước',
    description: 'Xe đạp đua carbon chuyên nghiệp, khung F12 mới nhất',
  },
  '3': {
    id: 3,
    title: 'Xe đạp điện Nijia Pro',
    seller: 'Lê Văn C',
    price: '12.000.000 đ',
    condition: 'Bình thường',
    submittedDate: '5 giờ trước',
    description: 'Xe đạp điện với pin đầy đủ, mô tơ mạnh mẽ',
  },
  '4': {
    id: 4,
    title: 'Xe đạp gấp Brompton',
    seller: 'Phạm Thị D',
    price: '35.000.000 đ',
    condition: 'Mới',
    submittedDate: '6 giờ trước',
    description: 'Xe đạp gấp cao cấp, nhẹ, dễ mang theo',
  },
  '5': {
    id: 5,
    title: 'Bộ phụ kiện xe đạp thể thao',
    seller: 'Hoàng Văn E',
    price: '1.200.000 đ',
    condition: 'Như mới',
    submittedDate: '8 giờ trước',
    description: 'Bộ phụ kiện bao gồm yên, tay lái, phanh, số',
  },
};

interface InspectionFormData {
  overallCondition: string;
  frameCondition: string;
  wheelCondition: string;
  brakeCondition: string;
  drivetrain: string;
  additionalNotes: string;
  images: File[];
}

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicle = VEHICLE_DETAILS[id || '1'];

  const [formData, setFormData] = useState<InspectionFormData>({
    overallCondition: '',
    frameCondition: '',
    wheelCondition: '',
    brakeCondition: '',
    drivetrain: '',
    additionalNotes: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/inspector');
      }, 2000);
    }, 1500);
  };

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Xe không tìm thấy</p>
      </div>
    );
  }

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
              {vehicle.seller}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Giá</p>
            <p className="text-lg font-semibold text-[#f57224]">
              {vehicle.price}
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
                name="drivetrain"
                value={formData.drivetrain}
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
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Nhập bất kỳ nhận xét hoặc vấn đề khác..."
                rows={4}
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
    </div>
  );
};
