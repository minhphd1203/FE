import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../redux/hooks';
import { setCredentials } from '../../redux/slices/authSlice';
import { authApi } from '../../apis/authApi';
import { GoogleIcon } from '../../components/GoogleIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schema/validation';
import { persistAuthSession } from '../../utils/authStorage';
import { getDefaultRouteForRole } from '../../utils/postLoginRedirect';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const { user, token } = await authApi.login(data);
      const normalized = { ...user, role: user.role || 'buyer' };
      persistAuthSession(
        {
          id: normalized.id,
          email: normalized.email,
          name: normalized.name,
          role: normalized.role,
        },
        token,
      );

      dispatch(
        setCredentials({
          user: normalized,
          token,
        }),
      );

      const role = user.role || 'buyer';
      const from = (location.state as { from?: string } | null)?.from;
      const isBuyerLike =
        String(role).trim().toLowerCase() === 'buyer' ||
        String(role).trim().toLowerCase() === 'customer';

      let redirectTo = getDefaultRouteForRole(role);
      if (
        isBuyerLike &&
        typeof from === 'string' &&
        from.startsWith('/') &&
        !from.startsWith('/auth')
      ) {
        redirectTo = from;
      }

      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Header cùng chủ đề Chợ Xe Đạp - cố định */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-[#f57224]">
              Chợ Xe Đạp
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-20 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Phần đầu: tiêu đề + minh họa */}
          <div className="px-6 pt-6 pb-4 relative">
            <div className="pr-14">
              <h1 className="text-xl font-bold text-gray-900">Đăng nhập</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Mua thì hời, bán thì lời.
              </p>
            </div>
            <div className="absolute right-6 top-6 w-12 h-12 rounded-full bg-[#f57224]/15 flex items-center justify-center text-2xl">
              🐣
            </div>
          </div>

          <form
            className="px-6 pb-6 space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email của bạn"
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] sm:text-sm"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-[#f57224] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#f57224] text-white font-semibold rounded-lg hover:bg-[#e0651a] focus:outline-none focus:ring-2 focus:ring-[#f57224] focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="relative my-4">
              <span className="block w-full border-t border-gray-200" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                Hoặc
              </span>
            </div>

            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-2.5 px-4 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              Đăng nhập với Google
            </a>
          </form>

          {/* Chưa có tài khoản */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-[#f57224] hover:underline"
              >
                Tạo tài khoản
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
