import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, ChevronRight, Headset } from 'lucide-react';

export const SettingsPage: React.FC = () => (
  <div className="mx-auto max-w-lg">
    <div className="mb-6 flex items-center gap-3">
      <Settings className="h-8 w-8 text-[#f57224]" />
      <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <p className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        Tài khoản
      </p>
      <Link
        to="/tai-khoan"
        className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-gray-50"
      >
        <User className="h-5 w-5 shrink-0 text-gray-400" />
        <span className="flex-1 text-sm font-medium text-gray-900">
          Hồ sơ & vai trò
        </span>
        <ChevronRight className="h-5 w-5 text-gray-300" />
      </Link>
      <Link
        to="/tro-giup"
        className="flex items-center gap-3 border-t border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50"
      >
        <Headset className="h-5 w-5 shrink-0 text-gray-400" />
        <span className="flex-1 text-sm font-medium text-gray-900">
          Trợ giúp
        </span>
        <ChevronRight className="h-5 w-5 text-gray-300" />
      </Link>
    </div>
    <p className="mt-4 text-center text-xs text-gray-400">
      Xem thông tin tài khoản và vai trò tại{' '}
      <Link to="/tai-khoan" className="text-[#f57224] underline">
        Tài khoản
      </Link>
      . Cập nhật hồ sơ/mật khẩu phụ thuộc API backend (hiện app chỉ đọc hồ sơ).
    </p>
  </div>
);
