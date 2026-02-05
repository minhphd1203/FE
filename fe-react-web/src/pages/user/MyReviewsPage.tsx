import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

const MOCK_REVIEWS = [
  {
    id: 1,
    targetName: 'Nguyễn Văn A',
    itemName: 'Xe đạp Giant Talon 3',
    rating: 5,
    comment: 'Xe đẹp, chủ xe nhiệt tình, giao dịch nhanh gọn.',
    date: '2024-06-20',
    likes: 2,
  },
  {
    id: 2,
    targetName: 'Shop Xe Đạp 123',
    itemName: 'Phụ kiện mũ bảo hiểm',
    rating: 4,
    comment: 'Hàng ổn trong tầm giá, giao hàng hơi chậm.',
    date: '2024-06-15',
    likes: 0,
  },
];

export const MyReviewsPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-[#f57224] fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">Đánh giá từ tôi</h1>
      </div>

      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  Đã đánh giá: {review.targetName}
                </p>
                <p className="text-sm text-gray-500">
                  Tin đăng: {review.itemName}
                </p>
              </div>
              <span className="text-sm text-gray-400">{review.date}</span>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>

            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">
              "{review.comment}"
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span>{review.likes} hữu ích</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
