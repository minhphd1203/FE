import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GoogleIcon } from '../components/GoogleIcon';
import { ChevronRight } from 'lucide-react';
import {
  UTILITIES,
  ACCOUNT_MENU_TOP,
  ACCOUNT_MENU_OFFERS,
  ACCOUNT_MENU_OTHER,
} from '../constants/data';

export const MainLayout: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* ========== HEADER (giống Chợ Tốt) ========== */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-bold text-[#f57224]">
                Chợ Xe Đạp
              </span>
            </Link>

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
              <Link
                to="/dang-tin"
                className="py-2.5 px-4 bg-[#f57224] text-white font-semibold rounded-lg hover:bg-[#e0651a] transition-colors whitespace-nowrap"
              >
                + Đăng tin
              </Link>
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
                  <h3 className="text-xl font-bold text-gray-900">
                    Mua thì hời, bán thì lời.
                  </h3>
                  <p className="text-gray-500 mt-1">Đăng nhập cái đã!</p>
                </div>
                {/* Nhân vật cam (minh họa) */}
                <div className="absolute right-4 top-4 w-14 h-14 rounded-full bg-[#f57224]/20 flex items-center justify-center text-3xl">
                  🐣
                </div>
                <div className="flex gap-3 mt-4">
                  <Link
                    to="/auth/register"
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-center font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Tạo tài khoản
                  </Link>
                  <Link
                    to="/auth/login"
                    className="flex-1 py-2.5 px-4 bg-[#facc15] text-gray-900 font-semibold rounded-lg text-center hover:bg-[#eab308]"
                  >
                    Đăng nhập
                  </Link>
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
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Tiện ích
                </p>
                <ul className="space-y-0">
                  {UTILITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 py-3 text-gray-800 hover:text-[#f57224] transition-colors"
                        >
                          <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                        </Link>
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
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon
                          className="w-5 h-5 text-gray-500 shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Ưu đãi, khuyến mãi */}
              <div className="border-t border-gray-100 px-4 py-3 bg-[#f5f5f5]">
                <p className="text-sm font-medium text-gray-600 mb-2 px-4">
                  Ưu đãi, khuyến mãi
                </p>
                <div className="space-y-2">
                  {ACCOUNT_MENU_OFFERS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon
                          className="w-5 h-5 text-gray-500 shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Khác */}
              <div className="border-t border-gray-100 px-4 py-3 pb-5 bg-[#f5f5f5]">
                <p className="text-sm font-medium text-gray-600 mb-2 px-4">
                  Khác
                </p>
                <div className="space-y-2">
                  {ACCOUNT_MENU_OTHER.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <Icon
                          className="w-5 h-5 text-gray-500 shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pt-20">
        <Outlet />
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="text-xl font-bold text-[#f57224]">
                Chợ Xe Đạp
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                Nền tảng mua bán xe đạp thể thao uy tín, kết nối người mua và
                người bán.
              </p>
            </div>
            {/* Liên kết */}
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">
                Về chúng tôi
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/gioi-thieu"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/lien-he"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tin-tuc"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Tin tức
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">
                Hỗ trợ
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/huong-dan"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Hướng dẫn mua bán
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cau-hoi-thuong-gap"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bao-cao"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Báo cáo vi phạm
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm mb-3">
                Pháp lý
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dieu-khoan"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link
                    to="/chinh-sach-bao-mat"
                    className="text-sm text-gray-600 hover:text-[#f57224]"
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Chợ Xe Đạp. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-6">
              <Link
                to="/dieu-khoan"
                className="text-sm text-gray-500 hover:text-[#f57224]"
              >
                Điều khoản
              </Link>
              <Link
                to="/chinh-sach-bao-mat"
                className="text-sm text-gray-500 hover:text-[#f57224]"
              >
                Bảo mật
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
