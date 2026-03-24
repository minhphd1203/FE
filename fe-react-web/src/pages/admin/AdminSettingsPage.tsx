import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { clearAuthSession } from '../../utils/authStorage';
import {
  Save,
  Settings,
  DollarSign,
  Shield,
  Bell,
  Lock,
  User,
} from 'lucide-react';

type TabType = 'general' | 'fees' | 'security' | 'notifications';

export const AdminSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [siteName, setSiteName] = useState('Chợ Xe Đạp');
  const [listingFee, setListingFee] = useState('15000');
  const [vipFee, setVipFee] = useState('50000');

  const handleSave = () => {
    alert('Đã lưu cài đặt hệ thống thành công!');
  };

  const handleLogout = () => {
    dispatch(logout());
    clearAuthSession();
    navigate('/auth/login');
  };

  const displayName = user?.name || user?.email || 'Administrator';

  const tabs = [
    { id: 'general', label: 'Cấu hình chung', icon: Settings },
    { id: 'fees', label: 'Phí dịch vụ', icon: DollarSign },
    { id: 'security', label: 'Bảo mật & Truy cập', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Compact User Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f57224] flex items-center justify-center text-white font-semibold text-lg">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-[#fff7e6] border border-[#facc15]/60 px-3 py-1.5 rounded-lg">
            <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Đồng Tốt
              </p>
              <p className="text-sm font-bold text-gray-900 leading-none mt-0.5">
                0
              </p>
            </div>
            <button
              onClick={() => navigate('/thanh-toan')}
              className="px-2.5 py-1.5 bg-[#facc15] text-xs font-semibold text-gray-900 rounded hover:bg-[#eab308] transition-colors"
            >
              Nạp
            </button>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <button
            onClick={() => navigate('/tai-khoan')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tài khoản
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý cấu hình chung, phí và bảo mật
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#f57224] text-white text-sm font-medium rounded-lg hover:bg-[#e0651a] shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>

      {/* Main Settings Content */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 bg-white rounded-xl shadow-sm border border-gray-100 p-2 shrink-0 sticky top-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#f57224]/10 text-[#f57224] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#f57224]' : 'text-gray-400'}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-h-[400px]">
          {activeTab === 'general' && (
            <div className="max-w-xl space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                  Cấu hình chung
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên website
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Chế độ bảo trì
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
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
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f57224]"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="max-w-xl space-y-5">
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                Phí dịch vụ
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phí đăng tin (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={listingFee}
                    onChange={(e) => setListingFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    VNĐ
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phí đẩy tin VIP (VNĐ/ngày)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={vipFee}
                    onChange={(e) => setVipFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    VNĐ/ngày
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl space-y-2">
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                Bảo mật & Quyền truy cập
              </h2>
              <button className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Đổi mật khẩu Admin
                  </span>
                </div>
                <span className="text-xs text-[#f57224] font-medium bg-[#f57224]/10 px-2.5 py-1 rounded">
                  Cập nhật
                </span>
              </button>
              <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Xác thực 2 lớp (2FA)
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Yêu cầu mã OTP qua Email khi đăng nhập
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f57224]"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl space-y-4">
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
                Thông báo hệ thống
              </h2>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email báo cáo mới
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Nhận email khi có bài đăng bị báo cáo
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f57224]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email đăng ký mới
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Nhận email khi có người dùng mới đăng ký
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f57224]"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
