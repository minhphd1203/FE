import React from 'react';
import { Sparkles, Gift, Tag } from 'lucide-react';

const MOCK_OFFERS = [
  {
    id: 1,
    title: 'Giảm 50% phí đẩy tin',
    code: 'PUSH50',
    exp: '30/06/2024',
    desc: 'Áp dụng cho mọi tin đăng xe đạp',
    color: 'bg-gradient-to-r from-orange-400 to-red-500',
  },
  {
    id: 2,
    title: 'Tặng 20.000đ khi nạp tiền',
    code: 'NAP20K',
    exp: '15/07/2024',
    desc: 'Áp dụng cho giao dịch nạp từ 100k',
    color: 'bg-gradient-to-r from-blue-400 to-indigo-500',
  },
  {
    id: 3,
    title: 'Miễn phí đăng tin VIP 3 ngày',
    code: 'VIPFREE',
    exp: '01/08/2024',
    desc: 'Dành cho người dùng mới',
    color: 'bg-gradient-to-r from-purple-400 to-pink-500',
  },
];

export const OffersPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-[#f57224] fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">Chợ Xe Đạp ưu đãi</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className="relative overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow"
          >
            <div className={`h-2 ${offer.color}`}></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-orange-50 rounded-lg text-[#f57224]">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-400">
                  HSD: {offer.exp}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {offer.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{offer.desc}</p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-md border border-gray-200 border-dashed">
                  <Tag className="w-4 h-4" />
                  <span className="font-mono font-semibold">{offer.code}</span>
                </div>
                <button className="text-sm font-semibold text-[#f57224] hover:underline">
                  Lưu mã
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
