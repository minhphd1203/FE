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
  MapPin,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  useFulfillmentDetailQuery,
  useConfirmReceiptMutation,
} from '../hooks/useFulfillmentQueries';
import { SellerReviewForm } from '../components/SellerReviewForm';
import { VnpayPaymentModal } from '../components/VnpayPaymentModal';
import {
  useBuyerTransactionDetailQuery,
  useBuyerCreatePaymentUrlMutation,
  useBuyerCreateRemainingPaymentUrlMutation,
  useBuyerReportReasonsQuery,
  useBuyerReportViolationMutation,
  useBuyerMyReportsQuery,
  useBuyerRefundMutation,
} from '../hooks/buyer/useBuyerQueries';
import { useAppSelector } from '../redux/hooks';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import { RootState } from '../redux/store';

export const BuyerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authed = useAppSelector((s: RootState) => s.auth.isAuthenticated);

  // Fetch fulfillment details alongside transaction details
  const { data: fullData } = useFulfillmentDetailQuery(id);
  const confirmReceiptMut = useConfirmReceiptMutation();

  const {
    data: transaction,
    isLoading,
    error,
    refetch: refetchTransaction,
  } = useBuyerTransactionDetailQuery(id, { enabled: authed });

  const createPaymentMut = useBuyerCreatePaymentUrlMutation();
  const createRemainingMut = useBuyerCreateRemainingPaymentUrlMutation();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<
    'initial' | 'remaining' | null
  >(null);

  const handleOpenPaymentModal = (type: 'initial' | 'remaining') => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  const reportMut = useBuyerReportViolationMutation();
  const refundMut = useBuyerRefundMutation();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasonId, setReportReasonId] = useState('');
  const [reportReasonText, setReportReasonText] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const { data: reportReasons = [], isLoading: reasonsLoading } =
    useBuyerReportReasonsQuery({
      enabled: showReportModal,
    });

  const { data: myReports = [], refetch: refetchReports } =
    useBuyerMyReportsQuery();

  const handleOpenReportModal = () => {
    setShowReportModal(true);
    setModalFeedback(null);
    setReportReasonId('');
    setReportReasonText('');
    setReportDetails('');
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    if (!id) return;
    if (!reportReasonId) {
      setModalFeedback({ type: 'error', msg: 'Vui lòng chọn lý do.' });
      return;
    }
    try {
      await reportMut.mutateAsync({
        transactionId: id,
        reasonId: reportReasonId,
        reasonText: reportReasonId === 'others' ? reportReasonText : undefined,
        description: reportDetails,
      });
      setModalFeedback({ type: 'success', msg: 'Gửi báo cáo thành công!' });
      void refetchReports();
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        msg: err?.response?.data?.message || 'Lỗi gửi báo cáo',
      });
    }
  };

  const handleRefund = async (reportId?: string) => {
    if (!id) return;
    if (!window.confirm('Xác nhận yêu cầu hoàn tiền cho đơn hàng này?')) return;
    try {
      await refundMut.mutateAsync({ transactionId: id, reportId });
      toast.success('Đang xử lý hoàn tiền. Vui lòng kiểm tra lại sau ít phút.');
      void refetchTransaction();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Không thể thực hiện hoàn tiền.',
      );
    }
  };

  const handleConfirmReceipt = async () => {
    if (!id) return;
    try {
      await confirmReceiptMut.mutateAsync(id);
      toast.success('Xác nhận đã nhận hàng thành công!');
    } catch (err) {
      toast.error('Lỗi khi xác nhận nhận hàng');
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
    address,
    shippingAddress,
    fullName,
  } = transaction as any;

  const deliveryStatus = fullData?.data?.deliveryStatus;

  const deliveryAddress =
    (typeof address === 'string' && address.trim()) ||
    (typeof shippingAddress === 'string' && shippingAddress.trim()) ||
    '';
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

  // Xác nhận nhận hàng: Khi status là completed/paid VÀ deliveryStatus là delivered
  const canConfirmReceipt =
    isCompleted && deliveryStatus === 'delivered' && status !== 'completed'; // Giả sử completed là trạng thái cuối cùng sau khi confirm receipt

  const getStatusBadge = () => {
    // Override badge if delivered but not confirmed
    if (deliveryStatus === 'delivered' && isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
          <Truck className="w-4 h-4" /> Đã giao hàng (Chờ xác nhận)
        </span>
      );
    }

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
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Chi tiết đơn hàng #{transaction.id?.slice(0, 8).toUpperCase()}
              </h1>
              <button
                onClick={() => {
                  if (transaction.id) {
                    navigator.clipboard.writeText(transaction.id);
                    alert('Đã copy Mã UUID giao dịch: ' + transaction.id);
                  }
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                title="Copy toàn bộ UUID"
              >
                (Copy UUID)
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

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

                {canConfirmReceipt && (
                  <button
                    onClick={handleConfirmReceipt}
                    className="shrink-0 whitespace-nowrap px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Xác nhận đã nhận hàng
                  </button>
                )}

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

                {isCompleted &&
                  (() => {
                    const report = myReports.find(
                      (r) => r.transactionId === id,
                    );
                    if (!report) {
                      return (
                        <button
                          onClick={handleOpenReportModal}
                          className="shrink-0 whitespace-nowrap px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                        >
                          <AlertTriangle className="w-5 h-5" />
                          Báo cáo vi phạm
                        </button>
                      );
                    }
                    if (report.status === 'pending') {
                      return (
                        <div className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium text-sm text-center">
                          Đang chờ duyệt báo cáo
                        </div>
                      );
                    }
                    if (
                      report.status === 'resolved' &&
                      report.resolution === 'refund'
                    ) {
                      return (
                        <button
                          onClick={() => handleRefund(report.id)}
                          disabled={refundMut.isPending}
                          className="shrink-0 whitespace-nowrap px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md shadow-red-600/20 transition-all flex items-center gap-2"
                        >
                          <RotateCcw className="w-5 h-5" />
                          Hoàn tiền
                        </button>
                      );
                    }
                    return null;
                  })()}
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

              {deliveryAddress && (
                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Địa chỉ giao hàng
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {fullName || transaction.fullName ? (
                      <>
                        <span className="font-medium">Người nhận: </span>
                        {fullName || transaction.fullName}
                        <br />
                      </>
                    ) : null}
                    {deliveryAddress}
                  </p>
                </div>
              )}

              {fullData?.data?.deliveryNotes && (
                <div className="mt-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Ghi chú giao hàng từ người bán
                  </p>
                  <p className="text-sm text-orange-800 font-medium">
                    {fullData.data.deliveryNotes}
                  </p>
                </div>
              )}

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

            {isCompleted && (
              <SellerReviewForm
                listingId={bike?.id || ''}
                sellerId={seller?.id}
                sellerLabel={seller?.name || seller?.email || undefined}
                defaultTransactionId={id}
              />
            )}
          </div>
        </div>
      </div>

      <VnpayPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        isPending={createPaymentMut.isPending || createRemainingMut.isPending}
        requestPayment={async ({
          bankCode,
          language,
        }: {
          bankCode?: string;
          language?: string;
        }) => {
          if (!transaction?.id || !paymentType) {
            throw new Error('Thiếu thông tin đơn thanh toán.');
          }
          if (paymentType === 'initial') {
            if (status !== 'approved') {
              throw new Error(
                'Chỉ tạo thanh toán khi đơn đã được người bán duyệt (trạng thái Approved).',
              );
            }
            return createPaymentMut.mutateAsync({
              transactionId: transaction.id,
              bankCode,
              language,
            });
          }
          if (!canPayRemaining) {
            throw new Error('Chưa đủ điều kiện thanh toán phần còn lại.');
          }
          return createRemainingMut.mutateAsync({
            depositTransactionId: transaction.id,
            bankCode,
            language,
          });
        }}
        onAfterPaymentCreated={() => void refetchTransaction()}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Báo cáo đơn hàng
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-13">
              Mô tả vấn đề bạn gặp phải với đơn hàng này để Admin hỗ trợ.
            </p>
            <form onSubmit={handleSendReport} className="space-y-4">
              <div>
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                  Lý do báo cáo
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors bg-white"
                  value={reportReasonId}
                  onChange={(e) => setReportReasonId(e.target.value)}
                  required
                  disabled={reasonsLoading}
                >
                  <option value="">
                    {reasonsLoading ? 'Đang tải…' : 'Chọn lý do'}
                  </option>
                  {reportReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {reportReasonId === 'others' && (
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                    Mô tả lý do (Khác) *
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-colors"
                    value={reportReasonText}
                    onChange={(e) => setReportReasonText(e.target.value)}
                    rows={2}
                    placeholder="Nêu rõ lý do…"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                  Mô tả chi tiết *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-colors"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết để hỗ trợ Admin xử lý…"
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  {modalFeedback && (
                    <span
                      className={`text-sm font-medium ${modalFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {modalFeedback.msg}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={reportMut.isPending}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-60 flex items-center gap-2 shadow-md shadow-red-600/20 transition-all"
                >
                  {reportMut.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
