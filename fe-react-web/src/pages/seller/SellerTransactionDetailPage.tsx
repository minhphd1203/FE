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
  Truck,
  MapPin,
  DollarSign,
  ArrowRight,
  PartyPopper,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useSellerTransactionDetailQuery,
  useSellerUpdateTransactionMutation,
  useSellerRequestPayoutMutation,
  useSellerPayoutByTransactionQuery,
} from '../../hooks/seller/useSellerQueries';
import { useAppSelector } from '../../redux/hooks';
import { getBikeImage, handleBikeImageError } from '../../utils/bikeImage';

export const SellerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authed = useAppSelector((s) => s.auth.isAuthenticated);
  const { data, isLoading, error, refetch } =
    useSellerTransactionDetailQuery(id);
  const updateMut = useSellerUpdateTransactionMutation();
  const payoutMut = useSellerRequestPayoutMutation();
  const { data: payoutData } = useSellerPayoutByTransactionQuery(
    id,
    !!id && !!data?.data,
  );

  const [notes, setNotes] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [showPayoutSuccess, setShowPayoutSuccess] = useState(false);

  const transaction = data?.data;
  const payoutInfo = payoutData?.data;

  const handleUpdateStatus = async (
    statusArg: 'approved' | 'completed' | 'cancelled',
  ) => {
    if (!id) return;
    setUpdateError(null);
    try {
      await updateMut.mutateAsync({
        transactionId: id,
        body: {
          status: statusArg,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      });
      refetch();
    } catch (err: unknown) {
      setUpdateError(
        (err as any)?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.',
      );
    }
  };

  const handleRequestPayout = async () => {
    if (!id) return;
    setPayoutError(null);
    try {
      console.log('[SellerTransactionDetailPage] Requesting payout for:', id);
      await payoutMut.mutateAsync(id);
      setShowPayoutSuccess(true);
      toast.success('Yêu cầu thanh toán đã được gửi đi!');
    } catch (err: unknown) {
      const respMsg = (err as any)?.response?.data?.message || '';

      // If the error is simply because it already exists, don't show an error
      // Instead, just let the refetch/polling handle it
      if (respMsg.includes('tồn tại') || respMsg.includes('already exists')) {
        console.log(
          '[SellerTransactionDetailPage] Payout already exists, refreshing status...',
        );
        return;
      }

      const msg =
        respMsg ||
        (err as any)?.message ||
        'Có lỗi xảy ra khi yêu cầu thanh toán.';
      console.error('[SellerTransactionDetailPage] Payout error:', err);
      setPayoutError(msg);
      toast.error(msg);
    }
  };

  // Validate payout eligibility
  const canRequestPayout = (): { allowed: boolean; reason?: string } => {
    // Check for existing payout that's not failed
    if (payoutInfo && payoutInfo.status !== 'failed') {
      return {
        allowed: false,
        reason: `Payout đã tồn tại (trạng thái: ${payoutInfo.status}). Chỉ có thể tạo payout mới khi payout trước đó thất bại.`,
      };
    }

    if (!transaction)
      return { allowed: false, reason: 'Chưa tải thông tin giao dịch' };

    const txn = transaction as any;

    // 1. Transaction must be completed
    if (txn.status !== 'completed') {
      return {
        allowed: false,
        reason: `Giao dịch chưa hoàn thành (${txn.status})`,
      };
    }

    // 2. Delivery must exist, be 'delivered', and be confirmed
    const delivery = txn.delivery;
    if (!delivery) {
      return { allowed: false, reason: 'Chưa có thông tin giao hàng' };
    }
    if (delivery.deliveryStatus !== 'delivered') {
      return {
        allowed: false,
        reason: `Giao hàng chưa hoàn thành (${delivery.deliveryStatus})`,
      };
    }
    if (!delivery.receiptConfirmedAt) {
      return { allowed: false, reason: 'Người mua chưa xác nhận nhận hàng' };
    }

    return { allowed: true };
  };

  const payoutValidation = canRequestPayout();

  // Determine payout button state
  const getPayoutButtonState = () => {
    if (!payoutInfo) {
      // No payout yet - normal request state
      return {
        show: true,
        label: payoutMut.isPending ? 'Đang xử lý...' : 'Yêu cầu thanh toán',
        disabled: payoutMut.isPending || !payoutValidation.allowed,
        variant: 'primary' as const,
        color: 'emerald',
      };
    }

    if (payoutInfo.status === 'completed') {
      // Payout completed - hide button, show success
      return { show: false, status: 'completed' as const };
    }

    if (payoutInfo.status === 'failed') {
      // Payout failed - show retry button
      return {
        show: true,
        label: payoutMut.isPending ? 'Đang xử lý...' : 'Thử lại yêu cầu',
        disabled: payoutMut.isPending,
        variant: 'danger' as const,
        color: 'red',
      };
    }

    if (payoutInfo.status === 'pending') {
      // Payout pending - show loading state
      return {
        show: true,
        label: 'Đang xử lý thanh toán...',
        disabled: true,
        variant: 'pending' as const,
        color: 'amber',
      };
    }

    // Default
    return {
      show: true,
      label: payoutMut.isPending ? 'Đang xử lý...' : 'Yêu cầu thanh toán',
      disabled: payoutMut.isPending || !payoutValidation.allowed,
      variant: 'primary' as const,
      color: 'emerald',
    };
  };

  const payoutButtonState = getPayoutButtonState();

  if (!authed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <p className="text-lg font-medium">Vui lòng đăng nhập</p>
          <p className="mt-1 mb-4 opacity-80">
            Bạn cần đăng nhập bằng tài khoản người bán để xem.
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
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Không tìm thấy yêu cầu
        </h2>
        <p className="text-gray-500 mb-6">
          Mã giao dịch không hợp lệ hoặc dữ liệu không tồn tại.
        </p>
        <Link
          to="/seller/don-hang"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Về danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const {
    bike,
    buyer,
    status,
    transactionType,
    amount,
    remainingBalance,
    paymentMethod,
    createdAt,
    notes: buyerNotes,
    address,
    shippingAddress,
    fullName,
  } = transaction as any;
  const deliveryAddress =
    (typeof address === 'string' && address.trim()) ||
    (typeof shippingAddress === 'string' && shippingAddress.trim()) ||
    '';
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  // const isCompleted = status === 'completed' || status === 'paid';
  // const isCancelled = status === 'cancelled';
  const isDeposit = transactionType === 'deposit';

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
            <Clock className="w-4 h-4" /> Chờ bạn duyệt
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
            <ShieldCheck className="w-4 h-4" /> Hoàn thành / Đã bán
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
          to="/seller/don-hang"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Trở lại danh sách quản lý
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Chi tiết đơn đặt xe #
              {(transaction as any)?.id?.slice(0, 8).toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {updateError && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{updateError}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cột trái: Chi tiết thanh toán & Thao tác */}
          <div className="md:col-span-2 space-y-6">
            {/* Box trạng thái cần hành động từ người bán */}
            {(isPending || isApproved) && (
              <div
                className={`p-6 rounded-2xl border shadow-sm ${
                  isPending
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <h3
                  className={`text-lg font-bold mb-2 ${isPending ? 'text-amber-900' : 'text-blue-900'}`}
                >
                  {isPending
                    ? 'Người mua đang chờ xác nhận'
                    : 'Đơn đang trong quá trình thanh toán'}
                </h3>
                <p
                  className={`text-sm mb-4 ${isPending ? 'text-amber-800/80' : 'text-blue-800/80'}`}
                >
                  {isPending
                    ? 'Vui lòng kiểm tra thông tin và duyệt đơn để người mua có thể tiến hành thanh toán VNPay.'
                    : 'Bạn đã duyệt yêu cầu. Người mua đang tiến hành thanh toán. Nếu thỏa thuận mua hàng gốc thanh toán bằng Tiền Mặt thay vì trực tuyến, bạn có thế trực tiếp Đánh dấu hoàn tất tại đây.'}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú phản hồi (Tuỳ chọn)
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f57224] bg-white"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ví dụ: Xe hiện sẽ giao trong sáng mai..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={updateMut.isPending}
                        className="px-6 py-2.5 rounded-xl bg-[#f57224] text-white font-bold hover:bg-[#e0651a] shadow-md transition-all flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> Duyệt yêu cầu
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      disabled={updateMut.isPending}
                      className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 bg-white font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Hủy bỏ/Từ chối
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(status === 'completed' || status === 'paid') && !isDeposit && (
              <div className="p-6 rounded-2xl border border-orange-100 bg-orange-50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-orange-900 mb-1 flex items-center gap-2">
                    <Truck className="w-5 h-5" /> Chuẩn bị giao hàng
                  </h3>
                  <p className="text-sm text-orange-800/80">
                    Người mua đã thanh toán thành công. Vui lòng chuẩn bị xe và
                    bàn giao cho đơn vị vận chuyển.
                  </p>
                </div>
                <Link
                  to={`/seller/giao-hang/${id}`}
                  className="shrink-0 px-6 py-3 bg-[#f57224] text-white rounded-xl font-bold hover:bg-[#e0651a] shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
                >
                  Xử lý giao hàng <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}

            {isDeposit && status === 'completed' && (
              <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">
                      Chờ thanh toán phần còn lại
                    </h3>
                    <p className="text-sm text-blue-800/80 mb-4">
                      Người mua đã thanh toán đặt cọc thành công. Họ cần thanh
                      toán phần còn lại để hoàn tất giao dịch và bắt đầu quy
                      trình giao hàng.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold uppercase mb-1">
                        Số tiền còn lại
                      </p>
                      <p className="text-2xl font-black text-blue-900">
                        {remainingBalance
                          ? Number(remainingBalance).toLocaleString('vi-VN')
                          : '0'}{' '}
                        đ
                      </p>
                    </div>
                    <p className="text-xs text-blue-700 font-medium">
                      Sau khi người mua thanh toán xong, bạn sẽ có thể truy cập
                      chức năng "Xử lý giao hàng" để tiến hành giao xe.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' &&
              (transaction as any)?.delivery?.deliveryStatus === 'delivered' &&
              payoutButtonState.show && (
                <>
                  {/* Payout Completed - Success Message */}
                  {payoutInfo?.status === 'completed' && (
                    <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-emerald-900 mb-2">
                            Thanh toán hoàn thành
                          </h3>
                          <p className="text-sm text-emerald-800/80 mb-4">
                            Yêu cầu rút tiền của bạn đã được xử lý thành công.
                            Tiền sẽ được chuyển vào tài khoản ngân hàng của bạn
                            trong thời gian sắp tới.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">
                              Số tiền rút
                            </p>
                            <p className="text-2xl font-black text-emerald-900">
                              {Number(payoutInfo.amount || 0).toLocaleString(
                                'vi-VN',
                              )}{' '}
                              đ
                            </p>
                            {payoutInfo.completedAt && (
                              <p className="text-xs text-emerald-700 mt-3">
                                Hoàn thành lúc:{' '}
                                {new Date(
                                  payoutInfo.completedAt,
                                ).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payout Pending - Loading State */}
                  {payoutInfo?.status === 'pending' && (
                    <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 animate-spin">
                          <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-amber-900 mb-2">
                            Đang xử lý thanh toán
                          </h3>
                          <p className="text-sm text-amber-800/80 mb-4">
                            Yêu cầu rút tiền của bạn đang được xử lý. Vui lòng
                            đợi trong lúc này. Thời gian xử lý thường từ 2-7
                            giây.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-amber-100">
                            <p className="text-xs text-amber-600 font-bold uppercase mb-1">
                              Số tiền rút
                            </p>
                            <p className="text-2xl font-black text-amber-900">
                              {Number(payoutInfo.amount || 0).toLocaleString(
                                'vi-VN',
                              )}{' '}
                              đ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payout Failed - Retry Button */}
                  {payoutInfo?.status === 'failed' && (
                    <div className="p-6 rounded-2xl border border-red-200 bg-red-50 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-red-900 mb-2">
                            Rút tiền thất bại
                          </h3>
                          <p className="text-sm text-red-800/80 mb-3">
                            Yêu cầu rút tiền của bạn không thành công. Vui lòng
                            thử lại hoặc liên hệ với hỗ trợ khách hàng.
                          </p>
                          {payoutInfo.failureReason && (
                            <p className="text-xs text-red-700 mb-4 font-medium">
                              Lý do: {payoutInfo.failureReason}
                            </p>
                          )}
                          <div className="bg-white rounded-lg p-4 mb-4 border border-red-100">
                            <p className="text-xs text-red-600 font-bold uppercase mb-1">
                              Số tiền rút
                            </p>
                            <p className="text-2xl font-black text-red-900">
                              {Number(payoutInfo.amount || 0).toLocaleString(
                                'vi-VN',
                              )}{' '}
                              đ
                            </p>
                          </div>
                          <button
                            onClick={handleRequestPayout}
                            disabled={payoutMut.isPending}
                            className="w-full px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                          >
                            <DollarSign className="w-5 h-5" />
                            {payoutMut.isPending
                              ? 'Đang xử lý...'
                              : 'Thử lại yêu cầu'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Normal Request - New Payout */}
                  {!payoutInfo && (
                    <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-emerald-900 mb-2">
                            Giao hàng hoàn thành - Yêu cầu thanh toán
                          </h3>
                          <p className="text-sm text-emerald-800/80 mb-4">
                            Xe đã được giao thành công cho người mua. Bạn có thể
                            yêu cầu thanh toán tiền bán hàng ngay bây giờ.
                          </p>
                          <div className="bg-white rounded-lg p-4 mb-4 border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">
                              Số tiền sẽ nhận
                            </p>
                            <p className="text-2xl font-black text-emerald-900">
                              {Number(amount || 0).toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                          {payoutError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-700">
                                {payoutError}
                              </p>
                            </div>
                          )}
                          {!payoutValidation.allowed && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-700">
                                {payoutValidation.reason}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={handleRequestPayout}
                            disabled={
                              payoutMut.isPending || !payoutValidation.allowed
                            }
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98]"
                            title={
                              !payoutValidation.allowed
                                ? payoutValidation.reason
                                : 'Yêu cầu thanh toán'
                            }
                          >
                            {payoutMut.isPending ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <DollarSign className="w-6 h-6" />
                            )}
                            {payoutMut.isPending
                              ? 'Đang xử lý...'
                              : 'Yêu cầu Thanh toán Ngay'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* Payout Success Modal */}
            {showPayoutSuccess && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div
                  className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative text-center">
                    <button
                      onClick={() => setShowPayoutSuccess(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-white/10 animate-bounce cursor-default">
                      <PartyPopper className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 tracking-tight">
                      Thành Công!
                    </h2>
                    <p className="text-emerald-50 font-medium">
                      Yêu cầu của bạn đã được tiếp nhận
                    </p>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        Số tiền dự kiến nhận
                      </p>
                      <p className="text-3xl font-black text-gray-900">
                        {Number(amount || 0).toLocaleString('vi-VN')}{' '}
                        <span className="text-lg">đ</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-snug">
                          Hệ thống đã ghi nhận yêu cầu rút tiền cho đơn hàng #
                          {id?.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-snug">
                          Tiền sẽ được xử lý và chuyển vào tài khoản định danh
                          trong vòng 24-48h làm việc.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPayoutSuccess(false)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2 group"
                    >
                      Đóng thông báo{' '}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Chợ Xe Đạp Marketplace
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                Thông tin giao dịch
              </h2>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loại yêu cầu</p>
                  <p className="font-semibold text-gray-900">
                    {isDeposit
                      ? 'Yêu cầu đặt cọc trước (10%)'
                      : 'Yêu cầu trả 100%'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Phương thức đề xuất
                  </p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-1.5">
                    {paymentMethod === 'vnpay' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-blue-500" />{' '}
                        VNPay(Cổng thanh toán)
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Qua
                        thỏa thuận trực tiếp
                      </>
                    )}
                  </p>
                </div>

                <div className="col-span-2 pt-4 mt-2 border-t border-gray-50 space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Giá trị đăng bán cúa xe</span>
                    <span className="font-medium">
                      {Number(bike?.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  {isDeposit && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Lợi nhuận nhận cọc (Yêu cầu)</span>
                      <span className="font-semibold text-[#f57224]">
                        {Number(amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                  {isDeposit && Number(remainingBalance) >= 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Người mua chưa thanh toán số tiền gốc</span>
                      <span className="font-semibold text-blue-600">
                        {Number(remainingBalance || 0).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                  )}

                  {!isDeposit && (
                    <div className="flex justify-between items-center text-gray-900 pt-2 border-t border-dashed border-gray-200">
                      <span className="font-bold">Tổng tiền giao dịch</span>
                      <span className="font-bold text-xl text-[#f57224]">
                        {Number(amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {deliveryAddress && (
                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Địa chỉ giao hàng (người mua)
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {fullName ? (
                      <>
                        <span className="font-medium">Người nhận: </span>
                        {fullName}
                        <br />
                      </>
                    ) : null}
                    {deliveryAddress}
                  </p>
                </div>
              )}

              {buyerNotes && (
                <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Lời nhắn từ người mua
                  </p>
                  <p className="text-sm text-gray-700 italic">"{buyerNotes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin người mua & Xe */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                <p className="text-xs font-bold text-[#f57224] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Thông tin người mua
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#f57224] font-bold overflow-hidden shadow-inner text-lg">
                    {buyer?.avatar ? (
                      <img
                        src={buyer.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        buyer?.name?.[0] ||
                        buyer?.email?.[0] ||
                        'B'
                      ).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {buyer?.name || buyer?.email?.split('@')[0] || 'User'}
                    </p>
                    {buyer?.phone && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {buyer.phone}
                      </p>
                    )}
                    {buyer?.email && (
                      <p className="text-xs text-gray-500 mt-0.5 w-40 truncate">
                        {buyer.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
                  title="Xem bài đăng xe"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug">
                  {bike?.title || 'Đang tải...'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
