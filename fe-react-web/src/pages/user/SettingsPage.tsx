import React, { useState } from 'react';
import { Settings, Bell, Lock, User, Globe, ChevronRight } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-[#f57224]" />
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
      </div>

      <div className="space-y-6">
        {/* Personal Info Group */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Thông tin cá nhân
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Chỉnh sửa hồ sơ</p>
                <p className="text-sm text-gray-500">
                  Tên hiển thị, Avatar, Số điện thoại
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Địa chỉ giao hàng</p>
                <p className="text-sm text-gray-500">
                  Quản lý địa chỉ nhận hàng
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              Thông báo
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Thông báo qua Email</p>
                <p className="text-sm text-gray-500">
                  Nhận cập nhật về đơn hàng và ưu đãi
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotif}
                  onChange={() => setEmailNotif(!emailNotif)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Thông báo đẩy (Push)
                </p>
                <p className="text-sm text-gray-500">
                  Nhận thông báo trực tiếp trên trình duyệt
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={pushNotif}
                  onChange={() => setPushNotif(!pushNotif)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Group */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-500" />
              Bảo mật
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Đổi mật khẩu</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-red-600">
                  Yêu cầu xóa tài khoản
                </p>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Language Group */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              Ngôn ngữ & Khu vực
            </h2>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Ngôn ngữ</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Tiếng Việt</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
