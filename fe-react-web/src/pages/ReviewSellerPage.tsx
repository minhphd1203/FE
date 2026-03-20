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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Đánh giá seller</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Chia sẻ trải nghiệm của bạn sau khi giao dịch hoàn tất.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Seller ID
          </label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            placeholder="Nhập Seller ID"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Số sao</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
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
          <label className="block mb-1 font-medium text-gray-700">
            Nhận xét
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Nhập nhận xét"
            required
          />
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="bg-[#f57224] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#e0651a] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
          {success && (
            <div className="text-green-600 text-sm">
              Gửi đánh giá thành công!
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
      </form>
    </div>
  );
};
