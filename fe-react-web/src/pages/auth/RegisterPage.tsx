import React from 'react';
import { Link } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { GoogleIcon } from '../../components/GoogleIcon';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../schema/validation';

export const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterFormData>,
    defaultValues: { role: 'customer' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Register data:', data);
    // TODO: Implement register logic
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Header cùng chủ đề Chợ Xe Đạp - cố định */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-[#f57224]">Chợ Xe Đạp</span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-20 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Phần đầu: tiêu đề + minh họa */}
          <div className="px-6 pt-6 pb-4 relative">
            <div className="pr-14">
              <h1 className="text-xl font-bold text-gray-900">Tạo tài khoản</h1>
              <p className="text-gray-500 mt-1 text-sm">Mua thì hời, bán thì lời.</p>
            </div>
            <div className="absolute right-6 top-6 w-12 h-12 rounded-full bg-[#f57224]/15 flex items-center justify-center text-2xl">
              🐣
            </div>
          </div>

          <form className="px-6 pb-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Nhập họ và tên"
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Ít nhất 6 ký tự"
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] sm:text-sm"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                className="block w-full px-4 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224] sm:text-sm"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bạn đăng ký với tư cách
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('role')}
                    type="radio"
                    value="customer"
                    className="w-4 h-4 text-[#f57224] border-gray-300 focus:ring-[#f57224]"
                  />
                  <span className="text-sm text-gray-700">Người mua</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register('role')}
                    type="radio"
                    value="seller"
                    className="w-4 h-4 text-[#f57224] border-gray-300 focus:ring-[#f57224]"
                  />
                  <span className="text-sm text-gray-700">Người bán</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#f57224] text-white font-semibold rounded-lg hover:bg-[#e0651a] focus:outline-none focus:ring-2 focus:ring-[#f57224] focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
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
              Đăng ký với Google
            </a>
          </form>

          {/* Đã có tài khoản */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/auth/login" className="font-medium text-[#f57224] hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-[#f57224]">
            ← Về trang chủ
          </Link>
        </p>
      </main>
    </div>
  );
};
