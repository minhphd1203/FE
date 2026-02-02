import React, { useState } from 'react';
import {
  Heart,
  Bookmark,
  Clock,
  Star,
  ChevronRight,
  Mountain,
  Bike,
  Battery,
  Baby,
  Package,
  History,
  Sparkles,
  Percent,
  Settings,
  Headset,
} from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';

// Màu Chợ Tốt: cam #f57224 — Icon Lucide đơn giản, không màu
const CATEGORIES = [
  { id: 1, label: 'Xe đạp địa hình', icon: Mountain, slug: 'xe-dap-dia-hinh' },
  { id: 2, label: 'Xe đạp đường phố', icon: Bike, slug: 'xe-dap-duong-pho' },
  { id: 3, label: 'Xe đạp điện', icon: Battery, slug: 'xe-dap-dien' },
  { id: 4, label: 'Xe đạp trẻ em', icon: Baby, slug: 'xe-dap-tre-em' },
  { id: 5, label: 'Phụ kiện', icon: Package, slug: 'phu-kien' },
];

// Dữ liệu mẫu tin đăng — thêm ảnh: dùng URL (từ API) hoặc đường dẫn trong project
const MOCK_LISTINGS = [
  { id: 1, title: 'Xe đạp địa hình Giant Talon 3 size M', price: '8.500.000 đ', location: 'Quận 1, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop' },
  { id: 2, title: 'Xe đạp đường phố Trinx 2024 mới 99%', price: '3.200.000 đ', location: 'Quận 7, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop' },
  { id: 3, title: 'Xe đạp điện Nijia inox bình mới', price: '12.000.000 đ', location: 'Quận Bình Thạnh, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop' },
  { id: 4, title: 'Xe đạp đua carbon 9.5kg full shimano', price: '25.000.000 đ', location: 'Quận 3, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=300&fit=crop' },
  { id: 5, title: 'Bộ đồ bảo hộ xe đạp thể thao', price: '450.000 đ', location: 'Quận 10, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop' },
  { id: 6, title: 'Xe đạp gấp Dahon Mariner D8', price: '15.000.000 đ', location: 'Quận Phú Nhuận, Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop' },
];

const UTILITIES = [
  { id: 1, label: 'Tin đăng đã lưu', icon: Heart, href: '/tin-dang-da-luu' },
  { id: 2, label: 'Tìm kiếm đã lưu', icon: Bookmark, href: '/tim-kiem-da-luu' },
  { id: 3, label: 'Lịch sử xem tin', icon: Clock, href: '/lich-su-xem-tin' },
  { id: 4, label: 'Đánh giá từ tôi', icon: Star, href: '/danh-gia-tu-toi' },
];

// Menu tài khoản: Lịch sử giao dịch, Ưu đãi, Khác
const ACCOUNT_MENU_TOP = [
  { id: 1, label: 'Lịch sử giao dịch', icon: History, href: '/lich-su-giao-dich' },
];
const ACCOUNT_MENU_OFFERS = [
  { id: 1, label: 'Chợ Xe Đạp ưu đãi', icon: Sparkles, href: '/uu-dai' },
  { id: 2, label: 'Ưu đãi của tôi', icon: Percent, href: '/uu-dai-cua-toi' },
];
const ACCOUNT_MENU_OTHER = [
  { id: 1, label: 'Cài đặt tài khoản', icon: Settings, href: '/cai-dat' },
  { id: 2, label: 'Trợ giúp', icon: Headset, href: '/tro-giup' },
];

export const HomePage: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* ========== HEADER (giống Chợ Tốt) ========== */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-bold text-[#f57224]">Chợ Xe Đạp</span>
            </a>

            {/* Ô tìm kiếm chính */}
            <div className="flex-1 w-full sm:max-w-xl">
              <div className="relative flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 focus-within:border-[#f57224] focus-within:ring-1 focus-within:ring-[#f57224]">
                <input
                  type="text"
                  placeholder="Tìm xe đạp, phụ kiện..."
                  className="w-full py-2.5 pl-4 pr-10 bg-transparent text-gray-800 placeholder-gray-500 outline-none"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 bottom-0 px-4 bg-[#f57224] text-white font-medium hover:bg-[#e0651a] transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Khu vực + Đăng tin + Đăng nhập */}
            <div className="flex items-center gap-2 shrink-0">
              <select className="py-2 px-3 border border-gray-200 rounded-lg text-gray-700 text-sm bg-white cursor-pointer hover:border-[#f57224]">
                <option>Toàn quốc</option>
                <option>Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
              </select>
              <a
                href="/dang-tin"
                className="py-2.5 px-4 bg-[#f57224] text-white font-semibold rounded-lg hover:bg-[#e0651a] transition-colors whitespace-nowrap"
              >
                + Đăng tin
              </a>
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Popup Đăng nhập / Tài khoản (giống Chợ Tốt) */}
      {showLoginModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowLoginModal(false)}
            aria-hidden
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-y-auto overflow-x-hidden flex flex-col max-h-[90vh]">
              {/* Phần trên: Mua thì hời, bán thì lời + Nút */}
              <div className="p-6 relative">
                <div className="pr-16">
                  <h3 className="text-xl font-bold text-gray-900">Mua thì hời, bán thì lời.</h3>
                  <p className="text-gray-500 mt-1">Đăng nhập cái đã!</p>
                </div>
                {/* Nhân vật cam (minh họa) */}
                <div className="absolute right-4 top-4 w-14 h-14 rounded-full bg-[#f57224]/20 flex items-center justify-center text-3xl">
                  🐣
                </div>
                <div className="flex gap-3 mt-4">
                  <a
                    href="/auth/register"
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-center font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Tạo tài khoản
                  </a>
                  <a
                    href="/auth/login"
                    className="flex-1 py-2.5 px-4 bg-[#facc15] text-gray-900 font-semibold rounded-lg text-center hover:bg-[#eab308]"
                  >
                    Đăng nhập
                  </a>
                </div>
                <a
                  href="/api/auth/google"
                  className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  Đăng nhập với Google
                </a>
              </div>
              {/* Tiện ích */}
              <div className="border-t border-gray-100 px-6 py-4">
                <p className="text-sm font-medium text-gray-500 mb-3">Tiện ích</p>
                <ul className="space-y-0">
                  {UTILITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <a
                          href={item.href}
                          className="flex items-center gap-3 py-3 text-gray-800 hover:text-[#f57224] transition-colors"
                        >
                          <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Lịch sử giao dịch, Cửa hàng */}
              <div className="border-t border-gray-100 px-4 py-3 bg-[#f5f5f5]">
                <div className="space-y-2">
                  {ACCOUNT_MENU_TOP.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-500 shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Ưu đãi, khuyến mãi */}
              <div className="border-t border-gray-100 px-4 py-3 bg-[#f5f5f5]">
                <p className="text-sm font-medium text-gray-600 mb-2 px-4">Ưu đãi, khuyến mãi</p>
                <div className="space-y-2">
                  {ACCOUNT_MENU_OFFERS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-500 shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Khác */}
              <div className="border-t border-gray-100 px-4 py-3 pb-5 bg-[#f5f5f5]">
                <p className="text-sm font-medium text-gray-600 mb-2 px-4">Khác</p>
                <div className="space-y-2">
                  {ACCOUNT_MENU_OTHER.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-500 shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 pt-20">
        {/* ========== DANH MỤC (grid icon + text như Chợ Tốt) ========== */}
        <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh mục</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <Icon className="w-9 h-9 text-gray-500 shrink-0 group-hover:text-[#f57224] transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#f57224]">
                    {cat.label}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ========== TIN ĐĂNG MỚI / NỔI BẬT (card như Chợ Tốt) ========== */}
        <section className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Tin đăng mới nhất</h2>
            <a href="/tat-ca-tin-dang" className="text-sm font-medium text-[#f57224] hover:underline">
              Xem tất cả
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOCK_LISTINGS.map((item) => (
              <a
                key={item.id}
                href={`/tin-dang/${item.id}`}
                className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Ảnh: có image thì hiển thị ảnh, không thì placeholder */}
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-300">🚲</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-[#f57224] text-sm mb-1">{item.price}</p>
                  <p className="text-gray-800 text-sm line-clamp-2 mb-1">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.location}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Gợi ý xem thêm */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Nền tảng mua bán xe đạp thể thao uy tín — Kết nối người mua và người bán
        </p>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <a href="/" className="text-xl font-bold text-[#f57224]">
                Chợ Xe Đạp
              </a>
              <p className="mt-2 text-sm text-gray-500">
                Nền tảng mua bán xe đạp thể thao uy tín, kết nối người mua và người bán.
              </p>
            </div>
            {/* Liên kết */}
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">Về chúng tôi</h4>
              <ul className="space-y-2">
                <li><a href="/gioi-thieu" className="text-sm text-gray-600 hover:text-[#f57224]">Giới thiệu</a></li>
                <li><a href="/lien-he" className="text-sm text-gray-600 hover:text-[#f57224]">Liên hệ</a></li>
                <li><a href="/tin-tuc" className="text-sm text-gray-600 hover:text-[#f57224]">Tin tức</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li><a href="/huong-dan" className="text-sm text-gray-600 hover:text-[#f57224]">Hướng dẫn mua bán</a></li>
                <li><a href="/cau-hoi-thuong-gap" className="text-sm text-gray-600 hover:text-[#f57224]">Câu hỏi thường gặp</a></li>
                <li><a href="/bao-cao" className="text-sm text-gray-600 hover:text-[#f57224]">Báo cáo vi phạm</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">Pháp lý</h4>
              <ul className="space-y-2">
                <li><a href="/dieu-khoan" className="text-sm text-gray-600 hover:text-[#f57224]">Điều khoản sử dụng</a></li>
                <li><a href="/chinh-sach-bao-mat" className="text-sm text-gray-600 hover:text-[#f57224]">Chính sách bảo mật</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Chợ Xe Đạp. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-6">
              <a href="/dieu-khoan" className="text-sm text-gray-500 hover:text-[#f57224]">Điều khoản</a>
              <a href="/chinh-sach-bao-mat" className="text-sm text-gray-500 hover:text-[#f57224]">Bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
