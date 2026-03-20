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
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Đơn mua của tôi</h1>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <p className="text-sm text-gray-500 mb-4">
        Để tạo đơn mua, vào chi tiết tin đăng và bấm nút <b>Đặt mua</b>.
      </p>
      <div>
        {transactions.length === 0 ? (
          <div className="text-gray-400">Chưa có đơn mua nào.</div>
        ) : (
          <ul>
            {transactions.map((item: any) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b py-2"
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
                  className="text-red-500 hover:underline"
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
