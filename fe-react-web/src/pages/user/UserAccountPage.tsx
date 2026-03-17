import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import {
  UTILITIES,
  ACCOUNT_MENU_TOP,
  ACCOUNT_MENU_OFFERS,
  ACCOUNT_MENU_OTHER,
} from '../../constants/data';
import { ChevronRight } from 'lucide-react';

export const UserAccountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/');
  };

  const displayName = user?.name || user?.email || 'Người dùng';

  return (
    <div className="min-h-screen bg-[#f4f4f4] pt-20">
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#f57224] flex items-center justify-center text-white font-semibold text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">
                  Người theo dõi 0 · Đang theo dõi 0
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-[#fff7e6] border border-[#facc15]/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Đồng Tốt</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/thanh-toan')}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#facc15] text-sm font-semibold text-gray-900 hover:bg-[#eab308] transition-colors"
              >
                Nạp ngay
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-sm font-medium text-gray-500 mb-3">Tiện ích</p>
            <ul className="space-y-0">
              {UTILITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className="flex items-center gap-3 w-full text-left py-3 text-gray-800 hover:text-[#f57224] transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="flex-1 text-sm font-medium">
                        {item.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-gray-100 px-4 py-4 bg-[#f5f5f5]">
            <div className="space-y-2">
              {ACCOUNT_MENU_TOP.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="flex items-center gap-3 py-3 px-4 w-full bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <Icon
                      className="w-5 h-5 text-gray-500 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 py-4 bg-[#f5f5f5]">
            <p className="text-sm font-medium text-gray-600 mb-2 px-4">
              Ưu đãi, khuyến mãi
            </p>
            <div className="space-y-2">
              {ACCOUNT_MENU_OFFERS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="flex items-center gap-3 py-3 px-4 w-full bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <Icon
                      className="w-5 h-5 text-gray-500 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 py-4 pb-6 bg-[#f5f5f5]">
            <p className="text-sm font-medium text-gray-600 mb-2 px-4">Khác</p>
            <div className="space-y-2">
              {ACCOUNT_MENU_OTHER.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    className="flex items-center gap-3 py-3 px-4 w-full bg-white rounded-xl text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <Icon
                      className="w-5 h-5 text-gray-500 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
