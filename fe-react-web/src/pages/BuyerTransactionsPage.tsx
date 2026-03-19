import React, { useState, useEffect } from 'react';
import {
  createTransaction,
  getTransactions,
  cancelTransaction,
  getBikeDetails,
} from '../api/buyerApi';

export const BuyerTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bikeId, setBikeId] = useState('');
  const [amount, setAmount] = useState('');
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

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createTransaction({ bikeId, amount });
      setSuccess('Đã đặt mua thành công!');
      setBikeId('');
      setAmount('');
      loadTransactions();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          placeholder="Nhập Bike ID để đặt mua"
        />
        <input
          className="border rounded px-3 py-2 w-32"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Số tiền"
        />
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          onClick={handleCreate}
          disabled={loading || !bikeId || !amount}
        >
          Đặt mua
        </button>
      </div>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
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
                <span>
                  Xe: {item.bikeId} | Số tiền: {item.amount} | Trạng thái:{' '}
                  {item.status}
                </span>
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
    </div>
  );
};
