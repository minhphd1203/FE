import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, MOCK_LISTINGS } from '../constants/data';
import { ChevronRight, Home } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = CATEGORIES.find((c) => c.slug === slug);
  const listings = MOCK_LISTINGS.filter(
    (l) => category && l.categoryId === category.id,
  );

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Không tìm thấy danh mục
        </h2>
        <p className="text-gray-500 mb-4">
          Danh mục bạn đang tìm kiếm không tồn tại.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-[#f57224] text-white rounded-lg hover:bg-[#e0651a]"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#f57224] flex items-center gap-1">
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{category.label}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{category.label}</h1>
        <span className="text-gray-500 text-sm">
          {listings.length} tin đăng
        </span>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((item) => (
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
          <p className="text-gray-500">
            Chưa có tin đăng nào trong danh mục này.
          </p>
        </div>
      )}
    </div>
  );
};
