import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Thanh toán thành công!
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Cảm ơn bạn đã sử dụng dịch vụ của Chợ Xe Đạp. Thông tin giao dịch đã
          được lưu vào mục <strong>Lịch sử giao dịch</strong>.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-xs text-gray-600">
          <Clock className="w-4 h-4" />
          Giao dịch sẽ được xử lý trong vài phút. Vui lòng kiểm tra ví hoặc tài
          khoản ngân hàng nếu cần.
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/lich-su-giao-dich')}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#f57224] text-white hover:bg-[#e0651a] transition-colors"
          >
            Xem lịch sử giao dịch
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
