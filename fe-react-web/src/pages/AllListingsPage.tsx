import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_LISTINGS } from '../constants/data';

export const AllListingsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tất cả tin đăng</h1>
        <p className="text-sm text-gray-500">
          Có {MOCK_LISTINGS.length} tin đăng đang hiển thị
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MOCK_LISTINGS.map((item) => (
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
    </div>
  );
};
