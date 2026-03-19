import React, { useState } from 'react';
import { reviewSeller } from '../api/buyerApi';

export const ReviewSellerPage: React.FC = () => {
  const [sellerId, setSellerId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await reviewSeller({ sellerId, rating, comment });
      setSuccess(true);
      setSellerId('');
      setRating(5);
      setComment('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Đánh giá Seller</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Seller ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            placeholder="Nhập Seller ID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Số sao</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} sao
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Nhận xét</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Nhập nhận xét"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
        {success && (
          <div className="text-green-600 mt-2">Gửi đánh giá thành công!</div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
};
