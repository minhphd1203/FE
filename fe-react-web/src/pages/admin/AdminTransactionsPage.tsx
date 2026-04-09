import React, { useMemo, useState } from 'react';
import type { AdminTransaction } from '../../apis/adminApi';
import {
  useAdminTransactionsQuery,
  useAdminUpdateTransactionMutation,
} from '../../hooks/admin/useAdminQueries';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
} from 'lucide-react';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  approved: {
    label: 'Đã duyệt (Chờ TT)',
    color: 'bg-blue-100 text-blue-700',
  },
  completed: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
};

const fmtVND = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(n)
    : '—';

export const AdminTransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'completed' | 'cancelled'
  >('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useAdminTransactionsQuery(filterStatus);
  const updateTxMut = useAdminUpdateTransactionMutation();

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return transactions.filter((tx) => {
      const addr =
        `${tx.address ?? ''} ${tx.shippingAddress ?? ''}`.toLowerCase();
      const matchTerm =
        !term ||
        tx.bike?.title.toLowerCase().includes(term) ||
        tx.buyer?.name.toLowerCase().includes(term) ||
        tx.seller?.name.toLowerCase().includes(term) ||
        addr.includes(term);
      return matchTerm;
    });
  }, [transactions, searchTerm]);

  const handleUpdateStatus = async (
    id: string,
    status: 'completed' | 'cancelled',
  ) => {
    setActiveId(id);
    try {
      await updateTxMut.mutateAsync({ id, status });
      await refetch();
    } catch {
      // ignore
    } finally {
      setActiveId(null);
    }
  };

  const handleSaveFee = async (txId: string) => {
    const parsed = Number(feeInput);
    if (isNaN(parsed) || parsed < 0) return;
    setFeeSaving(true);
    try {
      await updateTxMut.mutateAsync({ id: txId, systemFee: parsed });
      await refetch();
      setExpandedId(null);
    } catch {
      // ignore
    } finally {
      setFeeSaving(false);
    }
  };

  const toggleExpand = (tx: AdminTransaction) => {
    if (expandedId === tx.id) {
      setExpandedId(null);
    } else {
      setExpandedId(tx.id);
      setFeeInput(tx.systemFee != null ? String(tx.systemFee) : '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý giao dịch
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi và xử lý các giao dịch của hệ thống
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo xe, người mua hoặc người bán..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Xe
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người mua
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Phí HT
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy giao dịch
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const status = STATUS_LABEL[tx.status] ?? {
                    label: tx.status,
                    color: 'bg-gray-100 text-gray-700',
                  };
                  const isExpanded = expandedId === tx.id;

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium font-mono text-[#f57224]">
                          #{tx.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {tx.bike?.title ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {tx.buyer?.name ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {tx.seller?.name ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[#f57224]">
                          {fmtVND(tx.amount)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {fmtVND(tx.systemFee)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={
                                tx.status !== 'pending' || activeId === tx.id
                              }
                              onClick={() =>
                                handleUpdateStatus(tx.id, 'completed')
                              }
                              className="px-3 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4 inline" />
                              <span className="ml-1">Hoàn thành</span>
                            </button>
                            <button
                              disabled={
                                tx.status !== 'pending' || activeId === tx.id
                              }
                              onClick={() =>
                                handleUpdateStatus(tx.id, 'cancelled')
                              }
                              className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4 inline" />
                              <span className="ml-1">Hủy</span>
                            </button>
                            <button
                              onClick={() => toggleExpand(tx)}
                              className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100"
                              title="Chỉnh phí hệ thống"
                            >
                              <DollarSign className="w-4 h-4 inline" />
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 inline ml-0.5" />
                              ) : (
                                <ChevronDown className="w-3 h-3 inline ml-0.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-indigo-50/40">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-xl">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  Phí hệ thống (VND)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={feeInput}
                                  onChange={(e) => setFeeInput(e.target.value)}
                                  placeholder="Nhập phí hệ thống"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-sm"
                                />
                                {tx.sellerNetAmount != null && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Người bán nhận:{' '}
                                    <span className="font-semibold">
                                      {fmtVND(tx.sellerNetAmount)}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <button
                                disabled={
                                  feeSaving ||
                                  feeInput === '' ||
                                  isNaN(Number(feeInput))
                                }
                                onClick={() => handleSaveFee(tx.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {feeSaving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Lưu
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
