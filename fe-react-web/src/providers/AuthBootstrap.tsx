import React, { useLayoutEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setCredentials, setAuthHydrated } from '../redux/slices/authSlice';
import { authApi } from '../apis/authApi';
import { clearAuthSession, persistAuthSession } from '../utils/authStorage';

/**
 * Token-only (phiên cũ): gọi /auth/me trước khi RoleGuard chạy.
 * Phiên đã lưu { user, token }: store đã prehydrate isHydrated=true.
 */
export const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((s) => s.auth.isHydrated);

  useLayoutEffect(() => {
    if (isHydrated) return;

    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(setAuthHydrated(true));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (!cancelled) {
          dispatch(
            setCredentials({
              user: {
                ...user,
                role: user.role || 'buyer',
              },
              token,
            }),
          );
          persistAuthSession(
            {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || 'buyer',
            },
            token,
          );
        }
      } catch {
        if (!cancelled) clearAuthSession();
      } finally {
        if (!cancelled) dispatch(setAuthHydrated(true));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isHydrated]);

  if (!isHydrated) {
    return (
      <div
        className="min-h-screen bg-[#f4f4f4] flex items-center justify-center text-gray-400 text-sm"
        aria-busy="true"
      >
        Đang tải phiên đăng nhập…
      </div>
    );
  }

  return <>{children}</>;
};
