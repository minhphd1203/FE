import React, { useState } from 'react';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../api/buyerApi';

export const WishlistPage: React.FC = () => {
  const [bikeId, setBikeId] = useState('');
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addToWishlist(bikeId);
      setSuccess('Đã thêm vào danh sách yêu thích!');
      loadWishlist();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await removeFromWishlist(id);
      setSuccess('Đã xóa khỏi danh sách yêu thích!');
      loadWishlist();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getWishlist();
      // Đảm bảo wishlist luôn là mảng
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setWishlist(data);
    } catch (err: any) {
      setError('Không thể tải danh sách yêu thích.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Danh sách yêu thích</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
          placeholder="Nhập Bike ID để thêm"
        />
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          onClick={handleAdd}
          disabled={loading || !bikeId}
        >
          Thêm
        </button>
      </div>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div>
        {wishlist.length === 0 ? (
          <div className="text-gray-400">
            Chưa có xe nào trong danh sách yêu thích.
          </div>
        ) : (
          <ul>
            {wishlist.map((item: any) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{item.name || item.model || item.id}</span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleRemove(item.id)}
                  disabled={loading}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
