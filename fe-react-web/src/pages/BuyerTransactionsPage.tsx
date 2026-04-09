import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Filter,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  useBuyerCancelTransactionMutation,
  useBuyerTransactionsQuery,
  useBuyerCreatePaymentUrlMutation,
  useBuyerCreateRemainingPaymentUrlMutation,
  useBuyerReportReasonsQuery,
  useBuyerReportViolationMutation,
  useBuyerMyReportsQuery,
  useBuyerRefundMutation,
} from '../hooks/buyer/useBuyerQueries';
import { VnpayPaymentModal } from '../components/VnpayPaymentModal';
import { translateTransactionStatus } from '../utils/translations';

export const BuyerTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const reportMut = useBuyerReportViolationMutation();
  const refundMut = useBuyerRefundMutation();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingTransactionId, setReportingTransactionId] = useState<
    string | null
  >(null);
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

  const { data: myReports = [] } = useBuyerMyReportsQuery();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const payBusy =
    createPayMut.isPending ||
    createRemainingMut.isPending ||
    refundMut.isPending;

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
  const handleOpenPaymentModal = (
    id: string,
    type: 'initial' | 'remaining',
  ) => {
    setPaymentTargetId(id);
    setPaymentType(type);
    setShowPaymentModal(true);
    setError('');
  };

  const handleOpenReportModal = (id: string) => {
    setReportingTransactionId(id);
    setShowReportModal(true);
    setModalFeedback(null);
    setReportReasonId('');
    setReportReasonText('');
    setReportDetails('');
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    if (!reportReasonId) {
      setModalFeedback({ type: 'error', msg: 'Vui lòng chọn lý do.' });
      return;
    }
    const transaction = transactions.find(
      (t: any) => t.id === reportingTransactionId,
    );
    if (!transaction?.bike?.id) {
      setModalFeedback({
        type: 'error',
        msg: 'Không tìm thấy xe để báo cáo.',
      });
      return;
    }
    try {
      await reportMut.mutateAsync({
        transactionId: reportingTransactionId!,
        reportedBikeId: transaction.bike.id,
        reportedUserId: transaction.seller?.id,
        reasonId: reportReasonId,
        reasonText: reportReasonId === 'others' ? reportReasonText : undefined,
        description: reportDetails,
      });
      setModalFeedback({ type: 'success', msg: 'Gửi báo cáo thành công!' });
      void queryClient.invalidateQueries({ queryKey: ['buyer', 'reports'] });
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        msg: err?.response?.data?.message || 'Lỗi gửi báo cáo',
      });
    }
  };

  const handleRefund = async (
    transactionId: string,
    reportId?: string,
    reportDescription?: string,
  ) => {
    if (!window.confirm('Xác nhận yêu cầu hoàn tiền cho đơn hàng này?')) return;
    setError('');
    setSuccess('');
    try {
      await refundMut.mutateAsync({
        transactionId,
        reportId,
        reason: reportDescription,
      });
      setSuccess('Đang xử lý hoàn tiền. Vui lòng kiểm tra lại sau ít phút.');
      // The mutation's onSettled will refetch transactions automatically
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Không thể thực hiện hoàn tiền.',
      );
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    refunded: 'bg-red-100 text-red-800 border-red-200',
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
            <option value="approved">Đã duyệt (Chờ TT)</option>
            <option value="completed">Đã thanh toán</option>
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

              // Check if there's a resolved refund report for this transaction
              const report = myReports.find((r) => r.transactionId === item.id);
              const hasRefundApproved =
                report &&
                report.status === 'resolved' &&
                (report.reason?.autoResolveAction === 'refund' ||
                  report.reason?.name?.toLowerCase().includes('refund') ||
                  report.reason?.description?.toLowerCase().includes('refund'));

              const needsInitialPay =
                isApproved && item.paymentMethod === 'vnpay';
              const needsRemainingPay =
                isCompleted && isDeposit && Number(item.remainingBalance) > 0;
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
                        {translateTransactionStatus(item.status)}
                      </span>
                      {isDeposit && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 rounded-md">
                          Mua đặt cọc
                        </span>
                      )}
                      {item.refundAmount && Number(item.refundAmount) > 0 && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md">
                          Đã hoàn tiền
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
                      {item.refundAmount && Number(item.refundAmount) > 0 && (
                        <p>
                          Hoàn tiền:{' '}
                          <span className="font-bold text-emerald-600">
                            +{Number(item.refundAmount).toLocaleString('vi-VN')}
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

                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-bold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors flex items-center gap-1"
                      onClick={() => navigate(`/theo-doi/${item.id}`)}
                    >
                      Theo dõi
                    </button>

                    {isPending && (
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-semibold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        onClick={() => item.id && handleCancel(item.id)}
                        disabled={cancelMut.isPending || payBusy}
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
                        disabled={payBusy}
                      >
                        {payBusy ? (
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
                        disabled={payBusy}
                      >
                        {payBusy ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Trả số dư
                      </button>
                    )}

                    {isCompleted &&
                      (() => {
                        if (hasRefundApproved) {
                          return (
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-colors flex items-center gap-1.5"
                              onClick={() =>
                                item.id &&
                                handleRefund(
                                  item.id,
                                  report?.id,
                                  report?.description,
                                )
                              }
                              disabled={refundMut.isPending}
                            >
                              <RotateCcw className="w-4 h-4" />
                              {refundMut.isPending
                                ? 'Đang xử lý...'
                                : 'Yêu cầu hoàn tiền'}
                            </button>
                          );
                        }

                        const hasPendingReport =
                          report && report.status === 'pending';
                        if (hasPendingReport) {
                          return (
                            <span className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                              Đang chờ duyệt báo cáo
                            </span>
                          );
                        }

                        const hasResolvedReport =
                          report && report.status === 'resolved';
                        if (hasResolvedReport && !hasRefundApproved) {
                          return (
                            <span className="px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-xl border border-amber-100">
                              Báo cáo đã xử lý
                            </span>
                          );
                        }

                        const hasRejectedReport =
                          report && report.status === 'rejected';
                        if (hasRejectedReport) {
                          return (
                            <span className="px-4 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-xl border border-red-100">
                              Báo cáo từ chối
                            </span>
                          );
                        }

                        if (!report) {
                          return (
                            <button
                              type="button"
                              className="px-4 py-2 text-sm font-semibold rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                              onClick={() =>
                                item.id && handleOpenReportModal(item.id)
                              }
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Báo cáo
                            </button>
                          );
                        }
                        return null;
                      })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <VnpayPaymentModal
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentTargetId(null);
          setPaymentType(null);
        }}
        isPending={payBusy}
        requestPayment={async ({ bankCode, language }) => {
          if (!paymentTargetId || !paymentType) {
            throw new Error('Thiếu thông tin đơn thanh toán.');
          }
          if (paymentType === 'initial') {
            const row = transactions.find(
              (t: { id?: string }) => t.id === paymentTargetId,
            );
            if (row && row.status !== 'approved') {
              throw new Error(
                'Chỉ tạo thanh toán khi đơn đã được duyệt (Approved).',
              );
            }
            return createPayMut.mutateAsync({
              transactionId: paymentTargetId,
              bankCode,
              language,
            });
          }
          return createRemainingMut.mutateAsync({
            depositTransactionId: paymentTargetId,
            bankCode,
            language,
          });
        }}
        onAfterPaymentCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ['buyer', 'transactions'],
          });
        }}
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
