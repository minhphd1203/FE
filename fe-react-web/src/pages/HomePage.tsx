import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, MOCK_LISTINGS } from '../constants/data';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* ========== DANH MỤC (grid icon + text như Chợ Tốt) ========== */}
      <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Danh mục</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/danh-muc/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <Icon
                  className="w-9 h-9 text-gray-500 shrink-0 group-hover:text-[#f57224] transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#f57224]">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========== TIN ĐĂNG MỚI / NỔI BẬT (card như Chợ Tốt) ========== */}
      <section className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tin đăng mới nhất
          </h2>
          <Link
            to="/tat-ca-tin-dang"
            className="text-sm font-medium text-[#f57224] hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOCK_LISTINGS.map((item) => (
            <Link
              key={item.id}
              to={`/tin-dang/${item.id}`}
              className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Ảnh: có image thì hiển thị ảnh, không thì placeholder */}
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
      </section>

      {/* Gợi ý xem thêm */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Nền tảng mua bán xe đạp thể thao uy tín — Kết nối người mua và người bán
      </p>
    </>
  );
};
