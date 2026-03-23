import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ChevronDown,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusCircle,
  Search,
  ShoppingBag,
  UserCircle,
} from 'lucide-react';
import { HEADER_QUICK_LINKS } from '../constants/data';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { authApi } from '../apis/authApi';
import { clearAuthSession } from '../utils/authStorage';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isSeller = user?.role?.toLowerCase() === 'seller';
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const handleLogout = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      dispatch(logout());
      clearAuthSession();
      navigate('/');
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    const params = new URLSearchParams();
    if (q) params.set('keyword', q);
    navigate(`/tat-ca-tin-dang${params.toString() ? `?${params}` : ''}`);
  };

  const goDefaultAccount = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    const role = user?.role?.toLowerCase();
    if (role === 'admin') navigate('/admin');
    else if (role === 'inspector') navigate('/inspector');
    else if (role === 'seller') navigate('/seller');
    else navigate('/tai-khoan');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="shrink-0 text-2xl font-bold tracking-tight text-[#f57224]"
          >
            Chợ Xe Đạp
          </Link>

          <form
            onSubmit={submitSearch}
            className="relative w-full sm:max-w-xl sm:flex-1"
          >
            <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow focus-within:border-[#f57224] focus-within:ring-2 focus-within:ring-[#f57224]/15">
              <div className="flex flex-1 items-center gap-2 pl-3 text-gray-400">
                <Search className="h-5 w-5 shrink-0" strokeWidth={2} />
                <input
                  type="search"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Tìm theo tên xe, hãng..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 pr-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  aria-label="Tìm kiếm tin đăng"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 bg-[#f57224] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e0651a]"
              >
                Tìm
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:shrink-0 sm:gap-2">
            {HEADER_QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-[#f57224]/40 hover:bg-orange-50/80 hover:text-[#f57224]"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </Link>
              );
            })}

            {!isAuthenticated ? (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/auth/register"
                  className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-[#f57224] hover:text-[#f57224] sm:px-4"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/auth/login"
                  className="rounded-full bg-[#f57224] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e0651a] sm:px-4"
                >
                  Đăng nhập
                </Link>
              </div>
            ) : (
              <div className="flex items-center rounded-full border border-gray-200 bg-white p-0.5 pl-1 shadow-sm transition-colors hover:border-gray-300">
                <button
                  type="button"
                  onClick={goDefaultAccount}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-sm font-semibold text-white outline-none ring-[#f57224] focus-visible:ring-2"
                  title="Tài khoản & trang chính"
                >
                  {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U')
                    .toString()
                    .toUpperCase()}
                </button>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 outline-none transition-colors hover:bg-gray-100 data-[state=open]:bg-gray-100 aria-expanded:bg-gray-100"
                      aria-label="Mở menu tài khoản"
                    >
                      <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="z-[100] min-w-[13.5rem] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                      sideOffset={8}
                      align="end"
                    >
                      {isSeller ? (
                        <>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/seller"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <LayoutDashboard className="h-4 w-4 text-[#f57224]" />
                              Kênh bán
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/seller/ho-so"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <UserCircle className="h-4 w-4 text-gray-500" />
                              Hồ sơ
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/dang-tin"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <PlusCircle className="h-4 w-4 text-[#f57224]" />
                              Đăng tin mới
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/seller/tra-gia"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <Handshake className="h-4 w-4 text-[#f57224]" />
                              Trả giá
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/seller/don-hang"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <ShoppingBag className="h-4 w-4 text-gray-500" />
                              Đơn hàng
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/seller/tin-nhan"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <MessageCircle className="h-4 w-4 text-gray-500" />
                              Tin nhắn
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                          <DropdownMenu.Item
                            className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            disabled={logoutBusy}
                            onSelect={(e) => {
                              e.preventDefault();
                              void handleLogout();
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            {logoutBusy ? 'Đang xuất…' : 'Đăng xuất'}
                          </DropdownMenu.Item>
                        </>
                      ) : (
                        <>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/tai-khoan"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              <UserCircle className="h-4 w-4 text-gray-500" />
                              Tài khoản
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild>
                            <Link
                              to="/lich-su-giao-dich"
                              className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-gray-800 outline-none data-[highlighted]:bg-orange-50"
                            >
                              Lịch sử giao dịch
                            </Link>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                          <DropdownMenu.Item
                            className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            disabled={logoutBusy}
                            onSelect={(e) => {
                              e.preventDefault();
                              void handleLogout();
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            {logoutBusy ? 'Đang xuất…' : 'Đăng xuất'}
                          </DropdownMenu.Item>
                        </>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-[4.75rem] sm:pt-20">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Link to="/" className="text-lg font-bold text-[#f57224]">
                Chợ Xe Đạp
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Nền tảng kết nối người mua và người bán xe đạp thể thao.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <p className="mb-2 font-semibold text-gray-800">Mua bán</p>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Link
                      to="/tat-ca-tin-dang"
                      className="hover:text-[#f57224]"
                    >
                      Tất cả tin đăng
                    </Link>
                  </li>
                  <li>
                    <Link to="/dang-tin" className="hover:text-[#f57224]">
                      Đăng tin
                    </Link>
                  </li>
                  <li>
                    <Link to="/yeu-thich" className="hover:text-[#f57224]">
                      Yêu thích
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-semibold text-gray-800">Hỗ trợ</p>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <Link to="/tro-giup" className="hover:text-[#f57224]">
                      Trợ giúp
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/bao-cao-vi-pham"
                      className="hover:text-[#f57224]"
                    >
                      Báo cáo vi phạm
                    </Link>
                  </li>
                  <li>
                    <Link to="/tai-khoan" className="hover:text-[#f57224]">
                      Tài khoản
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400 sm:text-left">
            © {new Date().getFullYear()} Chợ Xe Đạp
          </div>
        </div>
      </footer>
    </div>
  );
};
