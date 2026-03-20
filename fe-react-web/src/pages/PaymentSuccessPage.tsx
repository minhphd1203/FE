import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getPaymentStatus, getVnpayReturnResult } from '../apis/paymentApi';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean>(true);
  const [message, setMessage] = useState('Đang xác nhận kết quả thanh toán...');

  useEffect(() => {
    const verify = async () => {
      const query = new URLSearchParams(location.search);
      const transactionId =
        query.get('transactionId') || query.get('vnp_TxnRef') || '';

      try {
        // Ưu tiên xác nhận theo callback query nếu có từ VNPay
        if (location.search && query.get('vnp_ResponseCode')) {
          const ret = await getVnpayReturnResult(location.search);
          const status = (ret.data?.status || '').toLowerCase();
          const isOk =
            status.includes('success') ||
            status.includes('paid') ||
            query.get('vnp_ResponseCode') === '00';
          setSuccess(isOk);
          setMessage(
            isOk
              ? 'Thanh toán thành công! Giao dịch đã được xác nhận.'
              : ret.message || 'Thanh toán chưa thành công.',
          );
          return;
        }

        if (transactionId) {
          const statusRes = await getPaymentStatus(transactionId);
          const status = (statusRes.data?.status || '').toLowerCase();
          const isOk = ['success', 'paid', 'completed'].includes(status);
          const isPending = ['pending', 'processing'].includes(status);
          setSuccess(isOk || isPending);
          setMessage(
            isOk
              ? 'Thanh toán thành công!'
              : isPending
                ? 'Giao dịch đang được xử lý, vui lòng kiểm tra lại sau.'
                : 'Thanh toán chưa thành công.',
          );
          return;
        }

        setSuccess(false);
        setMessage('Không tìm thấy thông tin giao dịch.');
      } catch (err: any) {
        setSuccess(false);
        setMessage(
          err?.response?.data?.message ||
            'Không thể xác minh trạng thái thanh toán.',
        );
      } finally {
        setLoading(false);
      }
    };

    void verify();
  }, [location.search]);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            {success ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {loading
            ? 'Đang xác nhận...'
            : success
              ? 'Thanh toán thành công!'
              : 'Thanh toán thất bại'}
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">{message}</p>

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
