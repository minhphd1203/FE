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
  useSellerTransactionDetailQuery,
  useSellerUpdateTransactionMutation,
} from '../../hooks/seller/useSellerQueries';
import { useAppSelector } from '../../redux/hooks';
import { getBikeImage, handleBikeImageError } from '../../utils/bikeImage';

export const SellerTransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const authed = useAppSelector((s) => s.auth.isAuthenticated);
  const { data, isLoading, error, refetch } =
    useSellerTransactionDetailQuery(id);
  const updateMut = useSellerUpdateTransactionMutation();

  const [notes, setNotes] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);

  const transaction = data?.data;

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
  } = transaction as any;
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
                      onClick={() => handleUpdateStatus('approved')}
                      disabled={updateMut.isPending}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Hoàn tất đơn hàng
                    </button>
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
