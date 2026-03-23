import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useBuyerCancelTransactionMutation,
  useBuyerTransactionsQuery,
} from '../hooks/buyer/useBuyerQueries';

export const BuyerTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: transactions = [],
    isLoading: loading,
    error: queryError,
  } = useBuyerTransactionsQuery();
  const cancelMut = useBuyerCancelTransactionMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadError =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không thể tải danh sách đơn mua.'
        : '';

  const handleCancel = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await cancelMut.mutateAsync(id);
      setSuccess('Đã hủy đơn mua!');
    } catch {
      setError('Không thể hủy đơn mua.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Đơn mua của tôi</h1>
      <p className="text-sm text-gray-500 mb-5">
        Để tạo đơn mua, vào chi tiết tin đăng và bấm nút <b>Đặt mua</b>.
      </p>
      {(loadError || error) && (
        <div className="text-red-600 text-sm mb-3">{loadError || error}</div>
      )}
      {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
      <div>
        {transactions.length === 0 ? (
          <div className="text-gray-400 py-8 text-center border border-dashed rounded-xl">
            Chưa có đơn mua nào.
          </div>
        ) : (
          <ul className="space-y-3">
            {transactions.map(
              (item: {
                id?: string;
                bikeId?: string;
                bike?: { id?: string };
                amount?: unknown;
                status?: string;
              }) => (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border border-gray-100 rounded-xl p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">
                      Xe: {item.bikeId || item.bike?.id || '—'} | Số tiền:{' '}
                      {String(item.amount ?? '—')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Trạng thái: {item.status || 'pending'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {item.id && (
                      <button
                        type="button"
                        className="text-sm text-[#f57224] font-medium hover:underline px-2 py-1"
                        onClick={() => navigate(`/don-mua/${item.id}`)}
                      >
                        Chi tiết
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm"
                      onClick={() => item.id && handleCancel(item.id)}
                      disabled={loading || cancelMut.isPending || !item.id}
                    >
                      Hủy
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <Link to="/tat-ca-tin-dang" className="text-[#f57224] hover:underline">
          Xem tin để mua ngay
        </Link>
      </div>
    </div>
  );
};
