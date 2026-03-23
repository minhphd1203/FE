import React from 'react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

type FeaturePendingPageProps = {
  title: string;
  description: string;
};

/** Trang gọn cho tính năng chưa có API — tránh hiển thị dữ liệu giả. */
export const FeaturePendingPage: React.FC<FeaturePendingPageProps> = ({
  title,
  description,
}) => (
  <div className="max-w-md mx-auto text-center py-16 px-4">
    <div className="inline-flex rounded-2xl bg-gray-100 p-4 mb-5">
      <Construction className="w-10 h-10 text-[#f57224]" strokeWidth={1.5} />
    </div>
    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#f57224] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e0651a] transition-colors"
    >
      Về trang chủ
    </Link>
  </div>
);
