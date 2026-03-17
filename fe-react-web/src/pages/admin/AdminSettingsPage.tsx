import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { Save, Settings, DollarSign, Shield, Bell, Lock } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteName, setSiteName] = useState('Chợ Xe Đạp');
  const [listingFee, setListingFee] = useState('15000');
  const [vipFee, setVipFee] = useState('50000');

  const handleSave = () => {
    alert('Đã lưu cài đặt hệ thống thành công!');
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const displayName = user?.name || user?.email || 'Administrator';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f57224] flex items-center justify-center text-white font-semibold text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => navigate('/tai-khoan')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quay lại tài khoản
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#fff7e6] border border-[#facc15]/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Đồng Tốt</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
          </div>
          <button
            onClick={() => navigate('/thanh-toan')}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#facc15] text-sm font-semibold text-gray-900 hover:bg-[#eab308] transition-colors"
          >
            Nạp ngay
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-500 mt-1">
            Quản lý cấu hình chung, phí dịch vụ và bảo mật
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#f57224] text-white font-medium rounded-lg hover:bg-[#e0651a] transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Cấu hình chung</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên website
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-gray-900">Chế độ bảo trì</p>
                <p className="text-sm text-gray-500">
                  Tạm ngưng truy cập để bảo trì hệ thống
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={maintenanceMode}
                  onChange={() => setMaintenanceMode(!maintenanceMode)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Fee Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">
              Cấu hình phí dịch vụ
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phí đăng tin (VNĐ)
              </label>
              <input
                type="number"
                value={listingFee}
                onChange={(e) => setListingFee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phí đẩy tin VIP (VNĐ/ngày)
              </label>
              <input
                type="number"
                value={vipFee}
                onChange={(e) => setVipFee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">
              Bảo mật & Quyền truy cập
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">
                  Đổi mật khẩu Admin
                </span>
              </div>
              <span className="text-sm text-[#f57224] font-medium">
                Cập nhật
              </span>
            </button>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-gray-900">
                  Xác thực 2 lớp (2FA)
                </p>
                <p className="text-sm text-gray-500">
                  Yêu cầu mã OTP khi đăng nhập trang Admin
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Thông báo hệ thống</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email báo cáo mới</p>
                <p className="text-sm text-gray-500">
                  Nhận email khi có bài đăng bị báo cáo
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email đăng ký mới</p>
                <p className="text-sm text-gray-500">
                  Nhận email khi có người dùng mới đăng ký
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f57224]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
