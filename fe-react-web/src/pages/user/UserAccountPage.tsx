import React from 'react';
import { Link } from 'react-router-dom';
import { HomePage } from '../HomePage';
import {
  UTILITIES,
  ACCOUNT_MENU_TOP,
  ACCOUNT_MENU_OFFERS,
  ACCOUNT_MENU_OTHER,
} from '../../constants/data';
import { ChevronRight } from 'lucide-react';

export const UserAccountPage: React.FC = () => {
  return (
    <div className="relative">
      {/* Nội dung chính giữ nguyên như HomePage */}
      <HomePage />

      {/* Góc tài khoản nổi giống ảnh 2 */}
      <div className="fixed right-4 top-24 z-40 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#f57224] flex items-center justify-center text-white text-2xl font-semibold">
              P
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Pham Thi Lan</p>
              <p className="text-xs text-gray-500">
                Người theo dõi 0 · Đang theo dõi 0
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#fff7e6] border border-[#facc15]/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Đồng Tốt</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
            </div>
            <button className="px-5 py-2 rounded-lg bg-[#facc15] text-sm font-semibold text-gray-900 hover:bg-[#eab308] transition-colors">
              Nạp ngay
            </button>
          </div>
        </div>

        {/* Tiện ích */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-sm font-medium text-gray-500 mb-3">Tiện ích</p>
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
          <p className="text-sm font-medium text-gray-600 mb-2 px-4">Khác</p>
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
  );
};
