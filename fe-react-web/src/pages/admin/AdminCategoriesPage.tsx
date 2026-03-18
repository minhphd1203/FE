import React, { useEffect, useState } from 'react';
import { adminApi, AdminCategory } from '../../apis/adminApi';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

const initialForm = { name: '', slug: '', description: '' };

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      setError('Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
    });
    setEditingId(cat.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    setActionLoading(true);
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, form);
      } else {
        await adminApi.createCategory(form);
      }
      setModalOpen(false);
      fetchCategories();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý danh mục xe
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#f57224] text-white rounded-lg hover:bg-[#e0651a]"
          onClick={openAddModal}
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex justify-center">
            <Loader2 className="animate-spin mr-2" /> Đang tải...
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {cat.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                      onClick={() => openEditModal(cat)}
                    >
                      <Edit className="w-4 h-4" /> Sửa
                    </button>
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDelete(cat.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal thêm/sửa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-4 relative"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-bold mb-2">
              {editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên danh mục *
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#f57224] text-white hover:bg-[#e0651a] flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}{' '}
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
