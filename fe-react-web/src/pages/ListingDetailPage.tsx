import React, { useEffect, useMemo, useState } from 'react';
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ChevronLeft, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import {
  useBuyerAddToWishlistMutation,
  useBuyerBikeDetailsQuery,
  useBuyerSendMessageMutation,
  useBuyerReportViolationMutation,
  useBuyerReportReasonsQuery,
} from '../hooks/buyer/useBuyerQueries';
import { SellerReviewForm } from '../components/SellerReviewForm';
import { useAppSelector } from '../redux/hooks';
import { formatChatSendError } from '../utils/chatErrors';
import {
  translateBikeStatus,
  translateBikeCondition,
} from '../utils/translations';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector((s) => s.auth.user);
  const {
    data: listing,
    isLoading: loading,
    error: queryError,
  } = useBuyerBikeDetailsQuery(id);
  const addWishlistMut = useBuyerAddToWishlistMutation();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [showChatModal, setShowChatModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const [reportReasonId, setReportReasonId] = useState('');
  const [reportReasonText, setReportReasonText] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [modalFeedback, setModalFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const sendMut = useBuyerSendMessageMutation();
  const reportMut = useBuyerReportViolationMutation();
  const { data: reportReasons = [], isLoading: reasonsLoading } =
    useBuyerReportReasonsQuery({ enabled: showReportModal });

  useEffect(() => {
    if (searchParams.get('openReport') !== '1') return;
    setShowReportModal(true);
    setModalFeedback(null);
    const next = new URLSearchParams(searchParams);
    next.delete('openReport');
    setSearchParams(next, { replace: true });
  }, [id, searchParams, setSearchParams]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing?.seller?.id) return;
    setModalFeedback(null);
    try {
      await sendMut.mutateAsync({
        sellerId: listing.seller.id,
        content: chatMessage.trim(),
        bikeId: listing.id,
        attachment: chatAttachment,
      });
      setModalFeedback({ type: 'success', msg: 'Gửi tin nhắn thành công!' });
      setChatMessage('');
      setChatAttachment(null);
      setTimeout(() => {
        setShowChatModal(false);
        setModalFeedback(null);
      }, 2000);
    } catch (err: unknown) {
      setModalFeedback({
        type: 'error',
        msg: formatChatSendError(err),
      });
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    const desc = reportDetails.trim();
    if (!reportReasonId) {
      setModalFeedback({
        type: 'error',
        msg: 'Vui lòng chọn lý do báo cáo.',
      });
      return;
    }
    if (reportReasonId === 'others' && !reportReasonText.trim()) {
      setModalFeedback({
        type: 'error',
        msg: 'Vui lòng mô tả lý do (Khác).',
      });
      return;
    }
    if (!desc) {
      setModalFeedback({
        type: 'error',
        msg: 'Vui lòng nhập mô tả chi tiết.',
      });
      return;
    }
    try {
      await reportMut.mutateAsync({
        reasonId: reportReasonId,
        reasonText:
          reportReasonId === 'others' ? reportReasonText.trim() : undefined,
        description: desc,
        reportedUserId: listing?.seller?.id,
        reportedBikeId: listing?.id,
      });
      setModalFeedback({ type: 'success', msg: 'Đã gửi báo cáo vi phạm.' });
      setReportReasonId('');
      setReportReasonText('');
      setReportDetails('');
      setTimeout(() => {
        setShowReportModal(false);
        setModalFeedback(null);
      }, 2000);
    } catch (err: unknown) {
      setModalFeedback({
        type: 'error',
        msg:
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Có lỗi xảy ra',
      });
    }
  };

  const isOwnListing = useMemo(() => {
    if (!listing || !user?.id) return false;
    const sid = listing.seller?.id;
    return Boolean(sid && user.id === sid);
  }, [listing, user?.id]);

  const error = queryError
    ? (queryError as Error).message || 'Không tải được chi tiết tin đăng.'
    : null;

  const handleAddWishlist = async () => {
    if (!listing?.id) return;
    setActionMessage(null);
    try {
      await addWishlistMut.mutateAsync(listing.id);
      setActionMessage('Đã thêm vào danh sách yêu thích.');
    } catch (err: unknown) {
      setActionMessage(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể thêm yêu thích.',
      );
    }
  };

  const handleBuyNow = async () => {
    if (!listing?.id || !listing?.price) return;
    navigate('/thanh-toan', {
      state: {
        bikeId: listing.id,
        amount: listing.price,
      },
    });
  };

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Đang tải...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-red-500">{error}</div>;
  }

  if (!listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-700 mb-4">
          Không tìm thấy tin đăng bạn yêu cầu.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f57224] text-white text-sm font-medium hover:bg-[#e0651a] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to={isOwnListing ? '/seller' : '/'}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#f57224] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {isOwnListing ? 'Về kênh bán' : 'Quay lại trang chủ'}
      </Link>

      {isOwnListing && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Đây là <strong>tin của bạn</strong>. Tin chưa duyệt hoặc chưa lên chợ
          có thể không xem được từ trang chủ — bạn vẫn xem được tại đây qua kênh
          người bán.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-gray-100 flex items-center justify-center">
            {listing.images?.[0] || listing.image ? (
              <img
                src={getBikeImage(
                  listing.images?.[0] || listing.image,
                  listing.title,
                )}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => handleBikeImageError(e, listing.title)}
              />
            ) : (
              <img
                src={getBikeImage(undefined, listing.title)}
                alt="Xe dap"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <p className="text-xl font-semibold text-[#f57224]">
              {listing.price?.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </p>
            <p className="text-sm text-gray-500">
              Người bán:{' '}
              {isOwnListing
                ? 'Bạn'
                : listing.seller?.name || listing.seller?.email || '—'}
            </p>
            {listing.status && (
              <p className="text-xs text-gray-400">
                Trạng thái tin:{' '}
                <span className="font-medium text-gray-600">
                  {translateBikeStatus(listing.status)}
                </span>
              </p>
            )}

            <div className="mt-6 mb-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Thông số chi tiết
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs">Danh mục</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.category?.name || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Hãng xe</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.brand || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Dòng xe / Model</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.model || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Tình trạng</dt>
                  <dd className="font-medium text-gray-900">
                    {translateBikeCondition(listing.condition)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Năm sản xuất</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.year || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Màu sắc</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.color || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Mô tả sản phẩm
              </h3>
              <p className="whitespace-pre-wrap">
                {listing.description || 'Không có mô tả cho tin đăng này.'}
              </p>
            </div>
            {!isOwnListing && (
              <div className="pt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddWishlist}
                  disabled={addWishlistMut.isPending}
                  className="px-4 py-2 rounded-lg border border-[#f57224] text-[#f57224] font-medium hover:bg-orange-50 disabled:opacity-60"
                >
                  Yêu thích
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={addWishlistMut.isPending}
                  className="px-4 py-2 rounded-lg bg-[#f57224] text-white font-medium hover:bg-[#e0651a] disabled:opacity-60"
                >
                  Đặt mua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChatModal(true);
                    setModalFeedback(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-blue-500 text-blue-500 font-medium hover:bg-blue-50 disabled:opacity-60 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Nhắn tin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(true);
                    setModalFeedback(null);
                    setReportReasonId('');
                    setReportReasonText('');
                  }}
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors ml-auto sm:ml-4"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Báo cáo
                </button>
              </div>
            )}
            {actionMessage && (
              <p className="text-sm text-gray-600 pt-1">{actionMessage}</p>
            )}
          </div>
        </div>
      </div>

      {!isOwnListing && (listing as any).canReview && (
        <SellerReviewForm
          listingId={listing.id}
          sellerId={listing.seller?.id}
          sellerLabel={
            listing.seller?.name || listing.seller?.email || undefined
          }
        />
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowChatModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Nhắn tin người bán
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-13">
              Gửi một tin nhắn để hỏi thêm chức năng xe, giấy tờ hoặc trao đổi
              giá.
            </p>
            <form onSubmit={handleSendChat} className="space-y-4">
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] resize-none"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={4}
                  placeholder="Nhập nội dung tin nhắn..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Đính kèm (tuỳ chọn, tối đa 10MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.txt"
                  className="w-full text-sm text-gray-600"
                  onChange={(e) =>
                    setChatAttachment(e.target.files?.[0] ?? null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {modalFeedback && (
                    <span
                      className={`text-sm font-medium ${
                        modalFeedback.type === 'success'
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {modalFeedback.msg}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sendMut.isPending}
                  className="bg-[#f57224] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#e0651a] disabled:opacity-60 flex items-center gap-2 transition-all shadow-md shadow-[#f57224]/20"
                >
                  {sendMut.isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Báo cáo vi phạm
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-13">
              Phát hiện xe lừa đảo hoặc người bán vi phạm? Tố cáo tới admin.
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
                    Mô tả lý do (Khác) <span className="text-red-600">*</span>
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
                  Mô tả chi tiết <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-colors"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết vi phạm để hỗ trợ Admin xử lý…"
                  required
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  {modalFeedback && (
                    <span
                      className={`text-sm font-medium ${
                        modalFeedback.type === 'success'
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
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
