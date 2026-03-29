import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCredentials } from '../../redux/slices/authSlice';
import { persistAuthSession } from '../../utils/authStorage';
import { profileApi, type ProfileUser } from '../../apis/profileApi';
import { resolveBikeMediaUrl } from '../../apis/sellerApi';

function profileErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  const ax = err as {
    response?: { data?: { message?: string; error?: string } };
  };
  const d = ax.response?.data;
  return (
    (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error === 'string' && d.error) ||
    'Có lỗi xảy ra'
  );
}

function avatarUrl(avatar?: string | null): string | undefined {
  if (!avatar?.trim()) return undefined;
  const a = avatar.trim();
  if (/^https?:\/\//i.test(a)) return a;
  return resolveBikeMediaUrl(a);
}

function formatDate(iso?: string): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN');
}

export const BuyerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { token, user: reduxUser } = useAppSelector((s) => s.auth);

  const profileQ = useQuery({
    queryKey: ['profile', 'v1', 'info', 'buyer-ho-so'] as const,
    queryFn: () => profileApi.getMyProfile(),
  });

  const syncRoleToStore = useCallback(
    (next: ProfileUser) => {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) return;
      const nextUser = {
        id: next.id,
        email: next.email,
        name: next.name,
        role: next.role,
      };
      dispatch(setCredentials({ user: nextUser, token: currentToken }));
      persistAuthSession(
        {
          id: nextUser.id,
          email: nextUser.email,
          name: nextUser.name,
          role: nextUser.role,
        },
        currentToken,
      );
    },
    [dispatch, token],
  );

  const upgradeMut = useMutation({
    mutationFn: () => profileApi.upgradeSeller(),
    onSuccess: (updatedProfile) => {
      syncRoleToStore(updatedProfile);
      void qc.invalidateQueries({ queryKey: ['profile'] });
      void qc.invalidateQueries({ queryKey: ['seller'] });
      navigate('/tai-khoan', {
        replace: true,
        state: {
          profileMessage:
            'Đã nâng cấp lên người bán. Bạn hiện tại có thể tham gia đăng tin bán xe.',
        },
      });
    },
  });

  const profile = profileQ.data;
  const isBuyer = (profile?.role ?? reduxUser?.role)?.toLowerCase() === 'buyer';

  const handleUpgrade = () => {
    const ok = window.confirm(
      'Bạn có chắc muốn nâng cấp tài khoản lên người bán? Bạn sẽ ngay lập tức được cấp quyền đăng tin.',
    );
    if (!ok) return;
    upgradeMut.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#f57224] hover:text-[#e0651a]"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang chủ
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[#f57224]/15 flex items-center justify-center shrink-0 overflow-hidden">
            {avatarUrl(profile?.avatar) ? (
              <img
                src={avatarUrl(profile?.avatar)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-[#f57224]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">Hồ sơ người mua</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Xem thông tin cá nhân của bạn. Chức năng cập nhật hồ sơ, đổi mật
              khẩu và đổi ảnh đại diện chưa được hỗ trợ trên ứng dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void profileQ.refetch()}
            disabled={profileQ.isFetching}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Tải lại"
          >
            <RefreshCw
              className={`w-5 h-5 ${profileQ.isFetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {profileQ.isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải hồ sơ…
            </div>
          )}

          {profileQ.isError && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {profileErrorMessage(profileQ.error)}
            </div>
          )}

          {profile && !profileQ.isLoading && (
            <>
              {!isBuyer && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm px-4 py-3">
                  Tài khoản hiện đã là {profile.role}. Bạn có thể xem các chức
                  năng của người bán trong{' '}
                  <Link to="/tai-khoan" className="font-semibold underline">
                    Tài khoản
                  </Link>
                  .
                </div>
              )}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-gray-500">Họ tên</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">
                    {profile.name || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5 break-all">
                    {profile.email || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Số điện thoại</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">
                    {profile.phone ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Vai trò</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5 uppercase">
                    {profile.role || '—'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Id</dt>
                  <dd className="font-mono text-xs text-gray-800 mt-0.5 break-all">
                    {profile.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Ngày tạo</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {formatDate(profile.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Cập nhật</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {formatDate(profile.updatedAt)}
                  </dd>
                </div>
              </dl>

              <div className="pt-6 border-t border-gray-100">
                <Link
                  to="/tai-khoan"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Trang tài khoản
                </Link>
              </div>

              {isBuyer && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="rounded-lg border border-[#f57224]/20 bg-[#f57224]/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#f57224] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Nâng cấp thành người bán
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Nâng cấp tài khoản của bạn để trở thành người bán. Bạn
                          sẽ có thể đăng tin giao dịch trên chợ ngay lập tức.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={upgradeMut.isPending}
                      className="shrink-0 px-4 py-2.5 rounded-lg border border-transparent bg-[#f57224] text-white text-sm font-semibold hover:bg-[#e0651a] disabled:opacity-60"
                    >
                      {upgradeMut.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang xử lý…
                        </span>
                      ) : (
                        'Nâng cấp lên seller'
                      )}
                    </button>
                  </div>
                  {upgradeMut.isError && (
                    <p className="mt-2 text-sm text-red-600">
                      {profileErrorMessage(upgradeMut.error)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
