import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';
import {
  useBuyerTransactionDetailQuery,
  useBuyerCreatePaymentUrlMutation,
  useBuyerCreateRemainingPaymentUrlMutation,
} from '../hooks/buyer/useBuyerQueries';
import { useAppSelector } from '../redux/hooks';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';

export const BuyerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authed = useAppSelector((s) => s.auth.isAuthenticated);
  const {
    data: transaction,
    isLoading,
    error,
  } = useBuyerTransactionDetailQuery(id, { enabled: authed });

  const createPaymentMut = useBuyerCreatePaymentUrlMutation();
  const createRemainingMut = useBuyerCreateRemainingPaymentUrlMutation();

  const [payError, setPayError] = useState<string | null>(null);

  // Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<
    'initial' | 'remaining' | null
  >(null);
  const [bankCode, setBankCode] = useState('');
  const [language, setLanguage] = useState('vn');

  const handleOpenPaymentModal = (type: 'initial' | 'remaining') => {
    setPaymentType(type);
    setShowPaymentModal(true);
    setPayError(null);
  };

  const submitPayment = async () => {
    if (!transaction?.id || !paymentType) return;
    setPayError(null);
    try {
      if (paymentType === 'initial') {
        const res = await createPaymentMut.mutateAsync({
          transactionId: transaction.id,
          bankCode,
          language,
        });
        if (res?.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        }
      } else {
        const res = await createRemainingMut.mutateAsync({
          depositTransactionId: transaction.id,
          bankCode,
          language,
        });
        if (res?.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        }
      }
    } catch (err: unknown) {
      setPayError(
        (err as any)?.response?.data?.message ||
          'Có lỗi xảy ra khi tạo link thanh toán.',
      );
      setShowPaymentModal(false);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <p className="text-lg font-medium">Vui lòng đăng nhập</p>
          <p className="mt-1 mb-4 opacity-80">
            Bạn cần đăng nhập để xem chi tiết đơn mua.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">
          Đang tải thông tin đơn hàng...
        </p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Không tìm thấy đơn mua
        </h2>
        <p className="text-gray-500 mb-6">
          Đơn mua mã không hợp lệ hoặc không thuộc tài khoản của bạn.
        </p>
        <Link
          to="/don-mua"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Về danh sách đơn mua
        </Link>
      </div>
    );
  }

  const {
    bike,
    seller,
    status,
    transactionType,
    amount,
    remainingBalance,
    paymentMethod,
    createdAt,
    notes,
  } = transaction as any;
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isCompleted = status === 'completed' || status === 'paid';
  const isCancelled = status === 'cancelled';
  const isDeposit = transactionType === 'deposit';

  // Trạng thái chờ thanh toán VNPay
  const canPayInitial = isApproved && paymentMethod === 'vnpay';
  // Trạng thái chờ thanh toán phần còn lại
  const canPayRemaining =
    isCompleted && isDeposit && Number(remainingBalance) > 0;

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
            <Clock className="w-4 h-4" /> Chờ người bán duyệt
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Đã duyệt (Chờ thanh toán)
          </span>
        );
      case 'completed':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" /> Hoàn thành / Đã thanh toán
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
            <XCircle className="w-4 h-4" /> Đã huỷ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/don-mua"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Tham chiếu danh sách Đơn mua
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Chi tiết đơn hàng #{transaction.id?.slice(0, 8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {payError && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{payError}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cột trái: Chi tiết thanh toán & Tình trạng */}
          <div className="md:col-span-2 space-y-6">
            {/* Box trạng thái cần hành động */}
            {(canPayInitial || canPayRemaining || isPending) && (
              <div
                className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 shadow-sm ${
                  isPending
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold mb-1 ${isPending ? 'text-amber-900' : 'text-blue-900'}`}
                  >
                    {isPending
                      ? 'Yêu cầu đang chờ duyệt'
                      : canPayInitial
                        ? 'Đơn hàng chờ thanh toán'
                        : 'Cần thanh toán phần còn lại'}
                  </h3>
                  <p
                    className={`text-sm ${isPending ? 'text-amber-800/80' : 'text-blue-800/80'}`}
                  >
                    {isPending
                      ? 'Xin vui lòng chờ người bán xem xét và chấp nhận yêu cầu mua xe của bạn.'
                      : canPayInitial
                        ? 'Người bán đã chuẩn bị xe. Vui lòng thanh toán trực tuyến qua cổng VNPay để xác nhận.'
                        : 'Bạn đã thanh toán cọc. Vui lòng hoàn tất thanh toán số dư để nhận xe.'}
                  </p>
                </div>

                {canPayInitial && (
                  <button
                    onClick={() => handleOpenPaymentModal('initial')}
                    className="shrink-0 whitespace-nowrap px-6 py-3 bg-[#f57224] text-white rounded-xl font-bold hover:bg-[#e0651a] shadow-md shadow-[#f57224]/20 transition-all flex items-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Thanh toán VNPay
                  </button>
                )}

                {canPayRemaining && (
                  <button
                    onClick={() => handleOpenPaymentModal('remaining')}
                    className="shrink-0 whitespace-nowrap px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Thanh toán số dư
                  </button>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                Thông tin thanh toán
              </h2>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hình thức mua</p>
                  <p className="font-semibold text-gray-900">
                    {isDeposit
                      ? 'Mua đặt cọc trước (10%)'
                      : 'Mua thanh toán 100%'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Phương thức thanh toán
                  </p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-1.5">
                    {paymentMethod === 'vnpay' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-blue-500" /> Chuyển
                        khoản (VNPay)
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />{' '}
                        Thỏa thuận trực tiếp
                      </>
                    )}
                  </p>
                </div>

                <div className="col-span-2 pt-4 mt-2 border-t border-gray-50 space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Đơn giá xe</span>
                    <span className="font-medium">
                      {Number(bike?.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  {isDeposit && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>
                        Số tiền cọc (
                        {isCompleted ? 'Đã thanh toán' : 'Cần thanh toán'})
                      </span>
                      <span className="font-semibold text-[#f57224]">
                        {Number(amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                  {isDeposit && Number(remainingBalance) >= 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Số dư còn lại (Thanh toán khi nhận xe)</span>
                      <span className="font-semibold text-blue-600">
                        {Number(remainingBalance || 0).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                  )}

                  {!isDeposit && (
                    <div className="flex justify-between items-center text-gray-900 pt-2 border-t border-dashed border-gray-200">
                      <span className="font-bold">Tổng thanh toán</span>
                      <span className="font-bold text-xl text-[#f57224]">
                        {Number(amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {notes && (
                <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Ghi chú của bạn
                  </p>
                  <p className="text-sm text-gray-700 italic">"{notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin xe & Người bán */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {bike?.image || bike?.images?.[0] ? (
                  <img
                    src={getBikeImage(
                      bike.image || bike.images?.[0],
                      bike.title,
                    )}
                    alt={bike.title}
                    className="w-full h-full object-cover"
                    onError={(e) => handleBikeImageError(e, bike.title)}
                  />
                ) : (
                  <img
                    src={getBikeImage(undefined, 'Xe')}
                    alt="Xe"
                    className="w-full h-full object-cover"
                  />
                )}
                <Link
                  to={`/tin-dang/${bike?.id}`}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-gray-700 shadow-sm hover:text-[#f57224] transition-colors"
                  title="Xem bài đăng"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug">
                  {bike?.title || 'Đang tải tên xe...'}
                </h3>
                <p className="text-[#f57224] font-bold mt-2">
                  {Number(bike?.price || 0).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>

              {seller && (
                <div className="p-5 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Người bán
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden shadow-inner">
                      {seller.avatar ? (
                        <img
                          src={seller.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (
                          seller.name?.[0] ||
                          seller.email?.[0] ||
                          'U'
                        ).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {seller.name ||
                          seller.email?.split('@')[0] ||
                          'Người bán'}
                      </p>
                      {seller.phone && (
                        <p className="text-xs text-gray-500">{seller.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  createPaymentMut.isPending || createRemainingMut.isPending
                }
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitPayment}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#f57224] rounded-xl hover:bg-[#e0651a] shadow-md transition-all flex items-center gap-2"
                disabled={
                  createPaymentMut.isPending || createRemainingMut.isPending
                }
              >
                {createPaymentMut.isPending || createRemainingMut.isPending ? (
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
