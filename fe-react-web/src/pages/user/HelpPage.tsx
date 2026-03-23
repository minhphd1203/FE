import React, { useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const FAQS = [
  {
    q: 'Làm thế nào để đăng tin bán xe?',
    a: 'Bạn cần đăng nhập với tài khoản người bán, mở "Kênh bán" trên thanh điều hướng rồi chọn "Đăng tin mới". Điền đầy đủ thông tin và tải ảnh lên.',
  },
  {
    q: 'Tôi có mất phí khi đăng tin không?',
    a: 'Chúng tôi miễn phí đăng tin cơ bản. Nếu bạn muốn tin đăng nổi bật hơn, bạn có thể sử dụng các gói đẩy tin trả phí.',
  },
  {
    q: 'Làm sao để thanh toán an toàn?',
    a: 'Chúng tôi khuyến khích người mua và người bán gặp mặt trực tiếp để kiểm tra xe trước khi thanh toán. Không chuyển khoản trước khi xem hàng.',
  },
  {
    q: 'Tôi quên mật khẩu thì phải làm sao?',
    a: 'Bạn hãy vào trang Đăng nhập và chọn "Quên mật khẩu". Hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu qua email của bạn.',
  },
];

export const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-8 h-8 text-[#f57224]" />
        <h1 className="text-2xl font-bold text-gray-900">Trung tâm trợ giúp</h1>
      </div>

      {/* Contact Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-3">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Chat trực tuyến</h3>
          <p className="text-sm text-gray-500">Phản hồi trong 5 phút</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-green-50 rounded-full text-green-600 mb-3">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            Hotline 1900 xxxx
          </h3>
          <p className="text-sm text-gray-500">8:00 - 21:00 hàng ngày</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-3 bg-orange-50 rounded-full text-orange-600 mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Gửi email</h3>
          <p className="text-sm text-gray-500">support@choxedap.vn</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Câu hỏi thường gặp</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {FAQS.map((item, index) => (
            <div key={index} className="">
              <button
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span
                  className={`font-medium ${openIndex === index ? 'text-[#f57224]' : 'text-gray-900'}`}
                >
                  {item.q}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center bg-blue-50 p-6 rounded-xl border border-blue-100">
        <p className="text-blue-800 font-medium mb-2">
          Vẫn chưa tìm thấy câu trả lời?
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Gửi yêu cầu hỗ trợ
        </button>
      </div>
    </div>
  );
};
