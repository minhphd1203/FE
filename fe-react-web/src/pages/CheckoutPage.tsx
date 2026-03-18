import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, Banknote, ShieldCheck, Clock } from 'lucide-react';
import { createTransaction, createPaymentUrl } from '../apis/paymentApi';
import { useLocation } from 'react-router-dom';

type PaymentMethod = 'wallet' | 'bank' | 'cod';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { bikeId, amount } = location.state || {};

  // Nếu không có dữ liệu, quay lại trang đăng tin
  if (!bikeId || !amount) {
    navigate('/dang-tin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Tạo transaction
      const transactionRes = await createTransaction({
        bikeId,
        amount,
        notes: 'Thanh toán dịch vụ đăng tin',
      });
      const transactionId = transactionRes.data.id;
      // 2. Tạo paymentUrl
      const paymentRes = await createPaymentUrl(transactionId);
      const paymentUrl = paymentRes.data.paymentUrl;
      // 3. Redirect sang VNPay
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Thanh toán dịch vụ
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Bảo mật bởi Chợ Xe Đạp, bạn có thể xem lại trong mục Lịch sử giao
            dịch.
          </p>
        </div>
        <ShieldCheck className="w-7 h-7 text-emerald-500" />
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mb-2">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Tóm tắt đơn hàng */}
        <section className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              Gói đẩy tin nổi bật 7 ngày
            </span>
            <span className="text-sm font-semibold text-[#f57224]">
              {amount} đ
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Áp dụng cho 1 tin đăng. Tin sẽ được ưu tiên hiển thị và nhận được
            nhiều lượt xem hơn.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Thời gian hiệu lực: 7 ngày kể từ khi thanh toán.
            </span>
            <span className="text-sm font-bold text-gray-900">
              Tổng: {amount} đ
            </span>
          </div>
        </section>

        {/* Phương thức thanh toán */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Chọn phương thức thanh toán
          </h2>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-[#f57224] hover:bg-orange-50 transition-colors">
              <input
                type="radio"
                name="method"
                value="wallet"
                checked={method === 'wallet'}
                onChange={() => setMethod('wallet')}
                className="w-4 h-4 text-[#f57224] border-gray-300 focus:ring-[#f57224]"
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f57224]/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#f57224]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Ví Chợ Xe Đạp
                  </p>
                  <p className="text-xs text-gray-500">
                    Thanh toán nhanh, tích điểm thưởng cho lần sau.
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-[#f57224] hover:bg-orange-50 transition-colors">
              <input
                type="radio"
                name="method"
                value="bank"
                checked={method === 'bank'}
                onChange={() => setMethod('bank')}
                className="w-4 h-4 text-[#f57224] border-gray-300 focus:ring-[#f57224]"
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Thẻ ngân hàng / QR
                  </p>
                  <p className="text-xs text-gray-500">
                    Hỗ trợ thẻ nội địa, Visa/MasterCard và quét mã QR.
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-[#f57224] hover:bg-orange-50 transition-colors">
              <input
                type="radio"
                name="method"
                value="cod"
                checked={method === 'cod'}
                onChange={() => setMethod('cod')}
                className="w-4 h-4 text-[#f57224] border-gray-300 focus:ring-[#f57224]"
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Thanh toán khi giao dịch
                  </p>
                  <p className="text-xs text-gray-500">
                    Bạn tự thỏa thuận thanh toán trực tiếp với người mua/bán.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Thông tin liên hệ (đơn giản, mô phỏng) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Thông tin người thanh toán
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Họ và tên"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              required
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email (nhận hoá đơn điện tử)"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#f57224] focus:ring-1 focus:ring-[#f57224]"
          />
        </section>

        {/* Footer actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#f57224] text-white hover:bg-[#e0651a] shadow-sm transition-colors"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </form>
    </div>
  );
};
