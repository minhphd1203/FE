import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getTransactions } from '../../api/buyerApi';
import { createRemainingPaymentUrl } from '../../apis/paymentApi';

type TransactionItem = {
  id: string;
  type?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  notes?: string;
  bikeId?: string;
};

export const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Không tải được lịch sử giao dịch.',
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, []);

  const normalizeType = (trx: TransactionItem) => {
    if (trx.type) return trx.type.toLowerCase();
    return 'payment';
  };

  const normalizeStatus = (status?: string) => (status || '').toLowerCase();

  const canPayRemaining = (trx: TransactionItem) => {
    const status = normalizeStatus(trx.status);
    return ['pending', 'partial', 'deposit_paid', 'processing'].includes(
      status,
    );
  };

  const handlePayRemaining = async (depositTransactionId: string) => {
    setPayingId(depositTransactionId);
    setError(null);
    try {
      const res = await createRemainingPaymentUrl(depositTransactionId);
      const paymentUrl = res?.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error('Không lấy được link thanh toán phần còn lại.');
      }
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo link thanh toán phần còn lại.',
      );
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-[#f57224]" />
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={7}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={7}
                  >
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => {
                  const type = normalizeType(trx);
                  const status = normalizeStatus(trx.status);
                  const isIncome = type === 'deposit';
                  const statusIsSuccess = [
                    'success',
                    'paid',
                    'completed',
                  ].includes(status);
                  const canPay = canPayRemaining(trx);

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {trx.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          {isIncome ? (
                            <div className="p-1 bg-green-100 rounded text-green-600">
                              <ArrowDownLeft className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1 bg-red-100 rounded text-red-600">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          )}
                          {isIncome ? 'Nạp tiền' : 'Chi tiêu'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {trx.notes ||
                          (trx.bikeId
                            ? `Thanh toán cho xe ${trx.bikeId}`
                            : 'Giao dịch mua bán')}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold text-right ${isIncome ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {isIncome ? '+' : '-'}
                        {new Intl.NumberFormat('vi-VN').format(
                          Number(trx.amount || 0),
                        )}{' '}
                        đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        {statusIsSuccess ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Thành công
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            {status || 'pending'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">
                        {trx.createdAt
                          ? new Date(trx.createdAt).toLocaleString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canPay ? (
                          <button
                            type="button"
                            onClick={() => handlePayRemaining(trx.id)}
                            disabled={payingId === trx.id}
                            className="px-3 py-1.5 rounded-lg bg-[#f57224] text-white text-xs font-medium hover:bg-[#e0651a] disabled:opacity-60"
                          >
                            {payingId === trx.id
                              ? 'Đang tạo link...'
                              : 'Thanh toán còn lại'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
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
