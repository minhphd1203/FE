import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_LISTINGS } from '../../constants/data';
import { Clock, Trash2 } from 'lucide-react';

export const ViewHistoryPage: React.FC = () => {
  // Reverse mock listings to simulate "recent" first
  const historyListings = [...MOCK_LISTINGS].reverse().slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#f57224]" />
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử xem tin</h1>
        </div>
        {historyListings.length > 0 && (
          <button className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Xóa lịch sử
          </button>
        )}
      </div>

      {historyListings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {historyListings.map((item) => (
            <Link
              key={item.id}
              to={`/tin-dang/${item.id}`}
              className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow opacity-75 hover:opacity-100"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">🚲</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-[#f57224] text-sm mb-1">
                  {item.price}
                </p>
                <p className="text-gray-800 text-sm line-clamp-2 mb-1">
                  {item.title}
                </p>
                <p className="text-gray-500 text-xs">{item.location}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Bạn chưa xem tin đăng nào gần đây.</p>
        </div>
      )}
    </div>
  );
};
