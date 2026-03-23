import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export const MyReviewsPage: React.FC = () => (
  <div className="mx-auto max-w-md text-center py-12 px-4">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
      <Star className="h-8 w-8 text-amber-500" fill="currentColor" />
    </div>
    <h1 className="text-xl font-bold text-gray-900">Đánh giá từ tôi</h1>
    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
      Danh sách đánh giá bạn đã gửi sẽ hiển thị khi backend cung cấp API. Hiện
      bạn có thể đánh giá người bán ngay tại trang chi tiết tin đăng sau khi
      mua.
    </p>
    <Link
      to="/tat-ca-tin-dang"
      className="mt-6 inline-flex rounded-xl bg-[#f57224] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e0651a]"
    >
      Xem tin đăng
    </Link>
  </div>
);
