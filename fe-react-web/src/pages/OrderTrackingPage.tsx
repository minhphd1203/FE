import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  CreditCard,
  Phone,
  User,
  Bike,
} from 'lucide-react';
import { useBuyerTransactionDetailQuery } from '../hooks/buyer/useBuyerQueries';
import { useFulfillmentDetailQuery } from '../hooks/useFulfillmentQueries';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';
import { Info } from 'lucide-react';

const StatusStep = ({
  icon: Icon,
  label,
  description,
  isActive,
  isCompleted,
  isLast,
  notes,
}: {
  icon: any;
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
  notes?: string | null;
}) => (
  <div className="relative flex gap-4 pb-8 group">
    {!isLast && (
      <div
        className={`absolute left-[19px] top-10 bottom-0 w-0.5 transition-colors duration-500 ${isCompleted ? 'bg-[#f57224]' : 'bg-gray-200'}`}
      />
    )}
    <div
      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 shrink-0 ${
        isCompleted
          ? 'bg-[#f57224] border-[#f57224] text-white shadow-lg shadow-[#f57224]/20'
          : isActive
            ? 'bg-white border-[#f57224] text-[#f57224] ring-4 ring-orange-50'
            : 'bg-white border-gray-200 text-gray-400'
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
    </div>
    <div className="flex flex-col pt-1">
      <h3
        className={`font-bold transition-colors ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}
      >
        {label}
      </h3>
      <p
        className={`text-sm mt-1 transition-colors ${isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'}`}
      >
        {description}
      </p>
      {notes && isActive && (
        <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-800 font-medium">
          <Info className="w-3 h-3 inline-block mr-1 mb-0.5" /> {notes}
        </div>
      )}
    </div>
  </div>
);

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transaction, isLoading: isTxLoading } =
    useBuyerTransactionDetailQuery(id);
  const { data: fullData, isLoading: isFullLoading } =
    useFulfillmentDetailQuery(id);

  const isLoading = isTxLoading || isFullLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h1>
          <p className="text-gray-500 mb-6 font-medium">
            Mã đơn hàng không hợp lệ hoặc bạn không có quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/don-mua')}
            className="w-full py-3 bg-[#f57224] text-white rounded-xl font-bold hover:bg-[#e0651a] transition-all"
          >
            Quay lại Đơn mua
          </button>
        </div>
      </div>
    );
  }

  const {
    bike,
    seller,
    status,
    shippingAddress,
    address,
    createdAt,
    amount,
    transactionType,
  } = transaction as any;

  const deliveryStatus = fullData?.data?.deliveryStatus;
  const deliveryNotes = fullData?.data?.deliveryNotes;

  const deliveryLine =
    (typeof address === 'string' && address.trim()) ||
    (typeof shippingAddress === 'string' && shippingAddress.trim()) ||
    '';

  const steps = [
    {
      id: 'pending',
      icon: Clock,
      label: 'Đã đặt hàng',
      description: 'Yêu cầu mua xe của bạn đã được gửi đi thành công.',
      isCompleted: [
        'pending',
        'approved',
        'completed',
        'paid',
        'shipping',
        'delivered',
      ].includes(status),
      isActive: status === 'pending',
    },
    {
      id: 'approved',
      icon: Package,
      label: 'Đã xác nhận',
      description: 'Người bán đã chấp nhận yêu cầu.',
      isCompleted: [
        'approved',
        'completed',
        'paid',
        'shipping',
        'delivered',
      ].includes(status),
      isActive: status === 'approved',
    },
    {
      id: 'paid',
      icon: CreditCard,
      label: 'Thanh toán',
      description: 'Giao dịch đã được thanh toán.',
      isCompleted: ['completed', 'paid', 'shipping', 'delivered'].includes(
        status,
      ),
      isActive: ['completed', 'paid'].includes(status) && !deliveryStatus,
    },
    {
      id: 'preparing',
      icon: Package,
      label: 'Đang chuẩn bị hàng',
      description: 'Người bán đang đóng gói xe để bàn giao.',
      isCompleted: ['delivering', 'delivered'].includes(deliveryStatus || ''),
      isActive: deliveryStatus === 'preparing',
      notes: deliveryNotes,
    },
    {
      id: 'shipping',
      icon: Truck,
      label: 'Đang vận chuyển',
      description: 'Xe đang trên đường đến với bạn.',
      isCompleted: deliveryStatus === 'delivered',
      isActive: deliveryStatus === 'delivering',
      notes: deliveryNotes,
    },
    {
      id: 'received',
      icon: CheckCircle2,
      label: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao đến địa chỉ của bạn.',
      isCompleted: status === 'completed',
      isActive: deliveryStatus === 'delivered' && status !== 'completed',
      isLast: true,
      notes: deliveryStatus === 'delivered' ? deliveryNotes : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans border-t-4 border-[#f57224]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#f57224] font-bold transition-colors group"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-[#f57224]">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span>Quay lại</span>
          </button>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Mã đơn hàng
            </p>
            <p className="text-sm font-black text-gray-900">
              #{(id || '').slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#f57224]" />
                </div>
                Tiến độ đơn hàng
              </h2>

              <div className="pl-2">
                {steps.map((step) => (
                  <StatusStep key={step.id} {...step} />
                ))}
              </div>
            </div>

            {/* User Info & Service Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Địa chỉ giao hàng
                </h3>
                {deliveryLine ? (
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">
                      Người nhận: {transaction.fullName || 'Người mua'}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      {deliveryLine}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Chưa cung cấp địa chỉ giao hàng.
                  </p>
                )}
              </div>
              <div className="space-y-4 pt-6 sm:pt-0 sm:border-l sm:pl-6 border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" /> Liên hệ hỗ trợ
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">
                      Hotline 24/7
                    </p>
                    <p className="text-base font-black text-emerald-600">
                      1900 8888
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info Section */}
          <div className="space-y-6">
            {/* Bike Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={getBikeImage(
                    bike?.image || bike?.images?.[0],
                    bike?.title,
                  )}
                  alt={bike?.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  onError={(e) => handleBikeImageError(e, bike?.title)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <p className="text-white font-bold line-clamp-1">
                    {bike?.title}
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-500">Giá niêm yết</span>
                  <span className="text-gray-900 font-bold">
                    {Number(bike?.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-gray-50">
                  <span className="text-gray-500">Loại giao dịch</span>
                  <span className="bg-orange-50 text-[#f57224] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-tighter">
                    {transactionType === 'deposit' ? 'Đặt cọc' : 'Mua đứt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Người bán
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xl shadow-inner border border-gray-50">
                  {seller?.avatar ? (
                    <img
                      src={seller.avatar}
                      alt="Seller"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    (seller?.name?.[0] || 'S').toUpperCase()
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-black text-gray-900 group-hover:text-[#f57224] transition-colors">
                    {seller?.name || 'Seller'}
                  </p>
                  <p className="text-xs text-gray-500 font-bold mt-0.5">
                    {seller?.phone || 'Chưa cung cấp SĐT'}
                  </p>
                  <Link
                    to={`/nhan-tin-seller?sellerId=${seller?.id}&bikeId=${bike?.id}`}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Nhắn tin cho người bán
                  </Link>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/don-mua/${id}`)}
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#f57224] hover:text-[#f57224] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Clock className="w-5 h-5" /> Xem chi tiết thanh toán
              </button>
              <button className="w-full py-4 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-2 border border-amber-100 shadow-sm">
                <Bike className="w-5 h-5" /> Hướng dẫn nhận xe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
