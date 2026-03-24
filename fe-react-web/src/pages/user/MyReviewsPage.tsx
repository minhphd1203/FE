import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Store } from 'lucide-react';

export const MyReviewsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Đánh giá từ tôi
        </h1>
        <p className="text-gray-500 mt-2">
          Lịch sử các đánh giá bạn đã để lại cho người bán sau khi giao dịch.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <Star className="w-10 h-10" fill="currentColor" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Chưa có đánh giá nào
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Sau khi đặt mua thành công một chiếc xe trên hệ thống, bạn có thể đánh
          giá mức độ uy tín của người bán tại trang chi tiết tin đăng.
        </p>
        <Link
          to="/don-mua"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          <Store className="w-5 h-5 text-gray-400" />
          Xem đơn mua của bạn
        </Link>
      </div>
    </div>
  );
};
