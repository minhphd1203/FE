import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout, setCredentials } from '../../redux/slices/authSlice';
import { clearAuthSession, persistAuthSession } from '../../utils/authStorage';
import { profileApi, type ProfileUser } from '../../apis/profileApi';
import { UTILITIES } from '../../constants/data';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const getRoleLabel = (role: string) => {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'inspector') return 'Kiểm duyệt viên';
  if (role === 'seller') return 'Người bán';
  return 'Người mua';
};

export const UserAccountPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const profileFlash = (location.state as { profileMessage?: string } | null)
    ?.profileMessage;
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    clearAuthSession();
    navigate('/');
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể tải thông tin hồ sơ.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const syncRoleToStore = (nextProfile: ProfileUser) => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return;
    const nextUser = {
      id: nextProfile.id,
      email: nextProfile.email,
      name: nextProfile.name,
      role: nextProfile.role,
    };
    dispatch(
      setCredentials({
        user: nextUser,
        token: currentToken,
      }),
    );
    persistAuthSession(
      {
        id: nextUser.id,
        email: nextUser.email,
        name: nextUser.name,
        role: nextUser.role,
      },
      currentToken,
    );
  };

  const handleToggleSellerRole = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const nextProfile =
        profile?.role === 'seller'
          ? await profileApi.downgradeSeller()
          : await profileApi.upgradeSeller();
      setProfile(nextProfile);
      syncRoleToStore(nextProfile);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể cập nhật vai trò tài khoản.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const displayName =
    profile?.name ||
    user?.name ||
    profile?.email ||
    user?.email ||
    'Người dùng';
  const displayRole = profile?.role || user?.role || 'buyer';
  const displayEmail = profile?.email || user?.email || '-';
  const essentialLinks = [
    ...UTILITIES.filter((item) =>
      ['/tin-dang-da-luu', '/lich-su-xem-tin'].includes(item.href),
    ),
    {
      id: 'transaction-history',
      label: 'Lịch sử giao dịch',
      href: '/lich-su-giao-dich',
      icon: UTILITIES[2]?.icon || UTILITIES[0].icon,
    },
    {
      id: 'settings',
      label: 'Cài đặt tài khoản',
      href: '/cai-dat',
      icon: UTILITIES[0].icon,
    },
    {
      id: 'help',
      label: 'Trợ giúp',
      href: '/tro-giup',
      icon: UTILITIES[0].icon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff7f0] via-[#f8f8f8] to-[#f4f4f4] pt-20">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {profileFlash && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm px-4 py-3">
            {profileFlash}
          </div>
        )}
        <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <div className="p-6 sm:p-7 border-b border-gray-100">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#f57224] flex items-center justify-center text-white font-semibold text-2xl shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-900">
                  {displayName}
                </p>
                {loading ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Đang tải hồ sơ...
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f57224]/10 text-[#f57224]">
                      {getRoleLabel(displayRole)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {displayEmail}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#fff8e8] to-[#fff2dc] border border-[#facc15]/50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Đồng Tốt</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 leading-none">
                  0
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/thanh-toan')}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#facc15] text-sm font-semibold text-gray-900 hover:bg-[#eab308] transition-colors"
                >
                  Nạp ngay
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleToggleSellerRole}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#f57224] text-sm font-semibold text-white hover:bg-[#e0651a] transition-colors disabled:opacity-60"
                >
                  {actionLoading
                    ? 'Đang cập nhật...'
                    : profile?.role === 'seller'
                      ? 'Hạ về buyer'
                      : 'Nâng cấp seller'}
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            {profile?.role === 'seller' && (
              <Link
                to="/seller"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#f57224] bg-[#f57224]/5 text-[#f57224] text-sm font-bold hover:bg-[#f57224]/10 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Xem tổng quan kênh bán (dashboard)
              </Link>
            )}
          </div>

          <div className="px-5 sm:px-6 py-5 bg-white">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              Thiết yếu
            </p>
            <ul className="space-y-1.5">
              {essentialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className="flex items-center gap-3 w-full text-left py-3 px-3 rounded-xl text-gray-800 hover:bg-[#f57224]/5 hover:text-[#f57224] transition-colors"
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
        </div>
      </div>
    </div>
  );
};
