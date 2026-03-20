import React, { useState, useEffect } from 'react';
import { getTransactions, cancelTransaction } from '../api/buyerApi';
import { Link } from 'react-router-dom';

export const BuyerTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTransactions();
      setTransactions(res);
    } catch (err: any) {
      setError('Không thể tải danh sách đơn mua.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleCancel = async (id: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await cancelTransaction(id);
      setSuccess('Đã hủy đơn mua!');
      loadTransactions();
    } catch (err: any) {
      setError('Không thể hủy đơn mua.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Đơn mua của tôi</h1>
      <p className="text-sm text-gray-500 mb-5">
        Để tạo đơn mua, vào chi tiết tin đăng và bấm nút <b>Đặt mua</b>.
      </p>
      {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <div>
        {transactions.length === 0 ? (
          <div className="text-gray-400 py-8 text-center border border-dashed rounded-xl">
            Chưa có đơn mua nào.
          </div>
        ) : (
          <ul className="space-y-3">
            {transactions.map((item: any) => (
              <li
                key={item.id}
                className="flex justify-between items-center border border-gray-100 rounded-xl p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">
                    Xe: {item.bikeId || item.bike?.id || '—'} | Số tiền:{' '}
                    {item.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Trạng thái: {item.status || 'pending'}
                  </p>
                </div>
                <button
                  className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  onClick={() => handleCancel(item.id)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </li>
            ))}
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
