import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_LISTINGS } from '../../constants/data';
import { Heart } from 'lucide-react';

export const SavedListingsPage: React.FC = () => {
  // Simulate saved listings by taking a subset
  const savedListings = MOCK_LISTINGS.slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-8 h-8 text-[#f57224] fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">Tin đăng đã lưu</h1>
      </div>

      {savedListings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {savedListings.map((item) => (
            <Link
              key={item.id}
              to={`/tin-dang/${item.id}`}
              className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
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
          <p className="text-gray-500">Bạn chưa lưu tin đăng nào.</p>
          <Link
            to="/"
            className="inline-block mt-4 px-4 py-2 bg-[#f57224] text-white rounded-lg hover:bg-[#e0651a]"
          >
            Khám phá ngay
          </Link>
        </div>
      )}
    </div>
  );
};
