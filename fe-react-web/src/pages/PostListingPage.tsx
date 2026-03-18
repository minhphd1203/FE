import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { CATEGORIES } from '../constants/data';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const PostListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    price: '',
    condition: 'used-like-new', // Default to used
    location: 'Hồ Chí Minh',
    description: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Mock preview URL
      const url = URL.createObjectURL(e.target.files[0]);
      setImages((prev) => [...prev, url]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập tạo bikeId và lấy amount
    const bikeId = uuidv4();
    const amount = Number(formData.price);
    alert(
      'Đăng tin thành công! Tin của bạn đang được duyệt. Chuyển đến trang thanh toán dịch vụ.',
    );
    navigate('/thanh-toan', { state: { bikeId, amount } });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Đăng tin bán xe cũ</h1>
        <span className="text-sm text-gray-500">Bước 1/1</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 1. Hình ảnh */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Hình ảnh sản phẩm (Tối đa 5 ảnh)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={img}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#f57224] hover:bg-orange-50 transition-colors">
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-medium">
                  Đăng ảnh
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Hình ảnh phải là ảnh thật của xe, thể hiện rõ tình trạng hiện tại.
          </p>
        </div>

        {/* 2. Danh mục */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Danh mục đăng tin
          </label>
          <select
            required
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
          >
            <option value="">-- Chọn danh mục --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Thông tin chi tiết */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tiêu đề tin đăng
            </label>
            <input
              type="text"
              required
              placeholder="Vd: Thanh lý xe Giant Talon 3 cũ..."
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
                Giá bán (VNĐ)
              </label>
              <input
                type="number"
                required
                placeholder="Nhập giá bán..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tình trạng xe
              </label>
              <select
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
              >
                <option value="used-like-new">Đã sử dụng (Như mới 99%)</option>
                <option value="used-good">Đã sử dụng (Tốt 90-95%)</option>
                <option value="used-fair">Đã sử dụng (Khá 80%)</option>
                <option value="used-old">Cũ / Cần sửa chữa</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Mô tả chi tiết */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mô tả tình trạng
          </label>
          <textarea
            required
            rows={5}
            placeholder="Mô tả chi tiết về thời gian sử dụng, các vị trí trầy xước, bộ phận đã thay thế..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* 5. Địa điểm */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Khu vực bán
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            >
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Toàn quốc">Toàn quốc</option>
            </select>
          </div>
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
            className="px-8 py-2.5 bg-[#f57224] text-white font-bold rounded-lg hover:bg-[#e0651a] transition-colors shadow-sm"
          >
            Đăng tin ngay
          </button>
        </div>
      </form>
    </div>
  );
};
