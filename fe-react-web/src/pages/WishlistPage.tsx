import React, { useState } from 'react';
import { removeFromWishlist, getWishlist } from '../api/buyerApi';
import { Link } from 'react-router-dom';

export const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
                <div className="min-w-0">
                  <Link
                    to={`/tin-dang/${item.id}`}
                    className="font-medium text-gray-800 hover:text-[#f57224]"
                  >
                    {item.title || item.name || item.model || item.id}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {item.price
                      ? Number(item.price).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })
                      : ''}
                  </p>
                </div>
                <button
                  className="text-red-500 hover:underline ml-3"
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
