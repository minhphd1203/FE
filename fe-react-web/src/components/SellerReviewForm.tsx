import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import { useBuyerReviewSellerMutation } from '../hooks/buyer/useBuyerQueries';

type SellerReviewFormProps = {
  sellerId: string | undefined;
  /** Dùng cho link đăng nhập (quay lại đúng tin đang xem). */
  listingId: string;
  sellerLabel?: string;
  /** Nếu có (ví dụ từ trang đơn mua), điền sẵn mã giao dịch đã hoàn tất. */
  defaultTransactionId?: string;
};

export const SellerReviewForm: React.FC<SellerReviewFormProps> = ({
  sellerId,
  listingId,
  sellerLabel,
  defaultTransactionId,
}) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const reviewMut = useBuyerReviewSellerMutation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [transactionId, setTransactionId] = useState(
    defaultTransactionId ?? '',
  );
  useEffect(() => {
    if (defaultTransactionId) setTransactionId(defaultTransactionId);
  }, [defaultTransactionId]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const loginReturn = `/tin-dang/${encodeURIComponent(listingId)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    const tid = transactionId.trim();
    if (!tid) {
      setError('Vui lòng nhập mã giao dịch đã hoàn tất (UUID).');
      return;
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tid)) {
      setError(
        'Mã giao dịch không đúng định dạng UUID (VD: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx). Xin vui lòng copy ID đầy đủ từ mục Quản lý đơn hàng.',
      );
      return;
    }

    setError('');
    setSuccess(false);
    try {
      await reviewMut.mutateAsync({
        sellerId,
        transactionId: tid,
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
      setComment('');
      setRating(5);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      );
    }
  };

  if (!sellerId) {
    return (
      <section className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-5 text-sm text-gray-500">
        Chưa có định danh người bán để gửi đánh giá. Vui lòng thử lại sau.
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mt-8 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Đánh giá người bán
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Đăng nhập để chia sẻ trải nghiệm với người bán
          {sellerLabel ? ` ${sellerLabel}` : ''}.
        </p>
        <Link
          to="/auth/login"
          state={{ from: loginReturn }}
          className="mt-4 inline-flex rounded-lg bg-[#f57224] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e0651a]"
        >
          Đăng nhập để đánh giá
        </Link>
      </section>
    );
  }

  if (user?.id && sellerId === user.id) {
    return (
      <section className="mt-8 rounded-xl border border-amber-100 bg-amber-50/60 p-5 text-sm text-amber-900">
        Đây là tin đăng của bạn — bạn không thể đánh giá chính mình.
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Đánh giá người bán
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        {sellerLabel
          ? `Trải nghiệm của bạn với ${sellerLabel} giúp cộng đồng mua bán minh bạch hơn.`
          : 'Chia sẻ trải nghiệm sau khi trao đổi hoặc mua hàng.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="seller-review-transaction"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Mã giao dịch (UUID)
          </label>
          <input
            id="seller-review-transaction"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            placeholder="Ví dụ: 577e13f7-1177-4bb6-ab41-b42682bb1858 (Copy nguyên UUID đầy đủ)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono text-gray-900 placeholder:text-gray-400 placeholder:font-sans focus:border-[#f57224] focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
          />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Mức độ hài lòng
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f57224]/40"
                aria-label={`${star} sao`}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="seller-review-comment"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Nhận xét
          </label>
          <textarea
            id="seller-review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            minLength={3}
            placeholder="Ví dụ: Người bán phản hồi nhanh, sản phảm đúng mô tả..."
            className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#f57224] focus:outline-none focus:ring-2 focus:ring-[#f57224]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={
              reviewMut.isPending ||
              comment.trim().length < 3 ||
              !transactionId.trim()
            }
            className="rounded-lg bg-[#f57224] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e0651a] disabled:opacity-60"
          >
            {reviewMut.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
          {success && (
            <span className="text-sm font-medium text-emerald-600">
              Cảm ơn bạn — đánh giá đã được gửi.
            </span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  );
};
