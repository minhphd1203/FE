import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Filter,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  useBuyerCancelTransactionMutation,
  useBuyerTransactionsQuery,
  useBuyerCreatePaymentUrlMutation,
  useBuyerCreateRemainingPaymentUrlMutation,
} from '../hooks/buyer/useBuyerQueries';

export const BuyerTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const {
    data: transactions = [],
    isLoading: loading,
    error: queryError,
  } = useBuyerTransactionsQuery({
    status: statusFilter || undefined,
    limit: 50,
  });

  const cancelMut = useBuyerCancelTransactionMutation();
  const createPayMut = useBuyerCreatePaymentUrlMutation();
  const createRemainingMut = useBuyerCreateRemainingPaymentUrlMutation();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadError =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Không thể tải danh sách đơn mua.'
        : '';

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ yêu cầu mua xe này không?'))
      return;
    setError('');
    setSuccess('');
    try {
      await cancelMut.mutateAsync(id);
      setSuccess('Đã hủy yêu cầu mua xe thành công!');
    } catch {
      setError('Không thể hủy yêu cầu mua xe.');
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<
    'initial' | 'remaining' | null
  >(null);
  const [paymentTargetId, setPaymentTargetId] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [language, setLanguage] = useState('vn');

  const handleOpenPaymentModal = (
    id: string,
    type: 'initial' | 'remaining',
  ) => {
    setPaymentTargetId(id);
    setPaymentType(type);
    setShowPaymentModal(true);
    setError('');
  };

  const submitPayment = async () => {
    if (!paymentTargetId || !paymentType) return;
    setError('');
    setSuccess('');
    setProcessingId(paymentTargetId);
    try {
      let mutRes;
      if (paymentType === 'initial') {
        mutRes = await createPayMut.mutateAsync({
          transactionId: paymentTargetId,
          bankCode,
          language,
        });
      } else {
        mutRes = await createRemainingMut.mutateAsync({
          depositTransactionId: paymentTargetId,
          bankCode,
          language,
        });
      }
      if (mutRes?.data?.paymentUrl) {
        window.location.href = mutRes.data.paymentUrl;
      }
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message ||
          'Không thể tạo link thanh toán.',
      );
      setProcessingId(null);
      setShowPaymentModal(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt (Chờ TT)',
    completed: 'Đã thanh toán',
    paid: 'Đã thanh toán',
    cancelled: 'Đã huỷ',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#f57224]" />
            Quản lý Đơn Mua
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi và thanh toán các yêu cầu mua xe của bạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="text-sm border-gray-200 rounded-lg focus:ring-[#f57224] focus:border-[#f57224] py-2 px-3 outline-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
        </div>
      </div>

      {(loadError || error) && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
          {loadError || error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6 font-medium flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-gray-500 py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 flex flex-col items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-medium text-lg">Chưa có đơn mua nào</p>
              <p className="text-sm mt-1 mb-5">
                Bạn chưa thực hiện gửi yêu cầu mua chiếc xe nào.
              </p>
              <Link
                to="/tat-ca-tin-dang"
                className="px-5 py-2.5 bg-[#f57224] text-white rounded-xl font-medium shadow-sm hover:bg-[#e0651a] transition-colors"
              >
                Tìm xe ngay
              </Link>
            </div>
          ) : (
            transactions.map((item: any) => {
              const isPending = item.status === 'pending';
              const isApproved = item.status === 'approved';
              const isCompleted =
                item.status === 'completed' || item.status === 'paid';
              const isDeposit = item.transactionType === 'deposit';

              const needsInitialPay =
                isApproved && item.paymentMethod === 'vnpay';
              const needsRemainingPay =
                isCompleted && isDeposit && Number(item.remainingBalance) > 0;
              const amIProcessing = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#f57224]/30 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-5"
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                      {isDeposit && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 rounded-md">
                          Mua đặt cọc
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        #{item.id?.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-gray-900 font-bold text-base mb-1 group-hover:text-[#f57224] transition-colors line-clamp-1">
                      {item.bike?.title || `Xe tải mã ${item.bikeId}`}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <p>
                        Tiền {isDeposit ? 'cọc' : 'xe'}:{' '}
                        <span className="font-bold text-gray-900">
                          {Number(item.amount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </p>
                      {isDeposit && Number(item.remainingBalance) >= 0 && (
                        <p>
                          Số dư:{' '}
                          <span className="font-bold text-gray-900">
                            {Number(item.remainingBalance).toLocaleString(
                              'vi-VN',
                            )}
                            đ
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-5 shrink-0">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => navigate(`/don-mua/${item.id}`)}
                    >
                      Chi tiết
                    </button>

                    {isPending && (
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        onClick={() => item.id && handleCancel(item.id)}
                        disabled={cancelMut.isPending || amIProcessing}
                      >
                        Huỷ
                      </button>
                    )}

                    {needsInitialPay && (
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-bold rounded-xl text-white bg-[#f57224] hover:bg-[#e0651a] shadow-sm shadow-[#f57224]/30 transition-colors flex items-center gap-1.5"
                        onClick={() =>
                          item.id && handleOpenPaymentModal(item.id, 'initial')
                        }
                        disabled={amIProcessing}
                      >
                        {amIProcessing ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Thanh toán
                      </button>
                    )}

                    {needsRemainingPay && (
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-colors flex items-center gap-1.5"
                        onClick={() =>
                          item.id &&
                          handleOpenPaymentModal(item.id, 'remaining')
                        }
                        disabled={amIProcessing}
                      >
                        {amIProcessing ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Trả số dư
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thông tin thanh toán VNPay
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Xin vui lòng chọn thông tin ngân hàng và ngôn ngữ trước khi tạo
              giao dịch.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ngân hàng / Cổng thanh toán (Tuỳ chọn)
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#f57224] focus:border-[#f57224]"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                >
                  <option value="">Cổng thanh toán Gateway (Mặc định)</option>
                  <option value="VNPAYQR">Ứng dụng thanh toán (VNPAYQR)</option>
                  <option value="VNBANK">
                    Thẻ ATM / Tài khoản nội địa (VNBANK)
                  </option>
                  <option value="INTCARD">
                    Thẻ quốc tế (Visa, Master, JCB)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ngôn ngữ hiển thị
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#f57224] focus:border-[#f57224]"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="vn">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={
                  createPayMut.isPending || createRemainingMut.isPending
                }
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitPayment}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#f57224] rounded-xl hover:bg-[#e0651a] shadow-md transition-all flex items-center gap-2"
                disabled={
                  createPayMut.isPending || createRemainingMut.isPending
                }
              >
                {createPayMut.isPending || createRemainingMut.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                    Đang xử lý...
                  </>
                ) : (
                  'Tiến hành thanh toán'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
