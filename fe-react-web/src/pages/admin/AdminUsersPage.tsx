import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import type { AdminUser } from '../../apis/adminApi';
import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
} from '../../hooks/admin/useAdminQueries';

const LIMIT = 20;

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Quản trị viên
        </span>
      );
    case 'inspector':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          Kiểm duyệt viên
        </span>
      );
    case 'buyer':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Người mua
        </span>
      );
    case 'user':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Người dùng
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {role}
        </span>
      );
  }
};

export const AdminUsersPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const deleteUserMutation = useDeleteAdminUserMutation();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const apiParams = {
    search: searchTerm || undefined,
    role: filterRole === 'all' ? undefined : filterRole,
    page,
    limit: LIMIT,
  };

  const {
    data: result,
    isLoading: loading,
    error: queryError,
  } = useAdminUsersQuery(apiParams);

  const users = result?.items ?? [];
  const meta = result?.meta ?? { page: 1, limit: LIMIT, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không thể tải danh sách người dùng.'
        : null;

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    setOpenActionMenu(null);
    try {
      await deleteUserMutation.mutateAsync(userId);
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể xóa người dùng.';
      alert(msg);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const startIdx = (meta.page - 1) * meta.limit + 1;
  const endIdx = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý tài khoản người dùng và kiểm duyệt viên trên hệ thống
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f57224] text-white font-medium rounded-lg hover:bg-[#e0651a] transition-colors">
          <UserPlus className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="buyer">Người mua</option>
              <option value="seller">Người bán</option>
              <option value="inspector">Kiểm duyệt viên</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#f57224] focus:ring-[#f57224]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#f57224] focus:ring-[#f57224]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {user.phone || '-'}
                    </td>
                    <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenActionMenu(
                              openActionMenu === user.id ? null : user.id,
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {openActionMenu === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenActionMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <Eye className="w-4 h-4" />
                                  Xem chi tiết
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa tài khoản
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Hiển thị {startIdx}–{endIdx} trong tổng số {meta.total} người dùng
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | 'gap')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push('gap');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'gap' ? (
                    <span key={`gap-${idx}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        item === page
                          ? 'bg-[#f57224] text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
