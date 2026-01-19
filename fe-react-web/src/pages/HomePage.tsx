import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            Bicycle Marketplace
          </h1>

          <input
            type="text"
            placeholder="Tìm xe đạp cũ..."
            className="border border-blue-200 rounded-lg px-4 py-2 w-72
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          🚲 Xe đạp cũ nổi bật
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card */}
          <BikeCard
            name="Xe đạp thể thao"
            condition="90%"
            price="3.500.000đ"
          />
          <BikeCard
            name="Xe đạp city"
            condition="85%"
            price="2.800.000đ"
          />
        </div>
      </main>
    </div>
  );
};

/* ---------------- CARD ---------------- */

type BikeCardProps = {
  name: string;
  condition: string;
  price: string;
};

const BikeCard: React.FC<BikeCardProps> = ({ name, condition, price }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition
                 border border-blue-100"
    >
      <div className="h-40 bg-blue-100 rounded-t-2xl flex items-center justify-center">
        <span className="text-blue-400 text-sm">Hình ảnh xe</span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">
          {name}
        </h3>

        <p className="text-sm text-gray-500">
          Tình trạng: {condition}
        </p>

        <p className="text-blue-600 font-bold text-lg mt-3">
          {price}
        </p>

        <button
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg
                     hover:bg-blue-600 transition"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};
