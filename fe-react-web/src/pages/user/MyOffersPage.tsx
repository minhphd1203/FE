import React from 'react';
import { Percent, Copy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MY_OFFERS = [
  {
    id: 1,
    title: 'Giảm 20k phí vận chuyển',
    code: 'SHIP20',
    exp: 'Còn 3 ngày',
    status: 'active',
  },
  {
    id: 2,
    title: 'Giảm 10% tối đa 50k',
    code: 'SALE10',
    exp: 'Hết hạn hôm qua',
    status: 'expired',
  },
];

export const MyOffersPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Percent className="w-8 h-8 text-[#f57224] fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">Ưu đãi của tôi</h1>
      </div>

      <div className="space-y-4">
        {MY_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className={`flex items-center justify-between p-4 rounded-xl border ${offer.status === 'active' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${offer.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}
              >
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                <p
                  className={`text-sm ${offer.status === 'active' ? 'text-[#f57224]' : 'text-gray-500'}`}
                >
                  {offer.exp}
                </p>
              </div>
            </div>

            {offer.status === 'active' ? (
              <button className="flex items-center gap-2 px-4 py-2 bg-[#f57224] text-white text-sm font-medium rounded-lg hover:bg-[#e0651a] transition-colors">
                <Copy className="w-4 h-4" />
                Dùng ngay
              </button>
            ) : (
              <span className="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-medium rounded-full">
                Đã hết hạn
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-4">Bạn muốn tìm thêm ưu đãi?</p>
        <Link
          to="/uu-dai"
          className="text-[#f57224] font-medium hover:underline"
        >
          Khám phá kho ưu đãi
        </Link>
      </div>
    </div>
  );
};
