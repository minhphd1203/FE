import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  Printer,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  QrCode,
  Info,
} from 'lucide-react';
import {
  useFulfillmentDetailQuery,
  useUpdateDeliveryStatusMutation,
} from '../../hooks/useFulfillmentQueries';
import { getBikeImage, handleBikeImageError } from '../../utils/bikeImage';
import { toast } from 'sonner';

export const SellerDeliveryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use the specific fulfillment query for more accurate delivery data
  const { data, isLoading, error } = useFulfillmentDetailQuery(id);
  const deliveryMut = useUpdateDeliveryStatusMutation();

  const [shippingMethod, setShippingMethod] = useState<
    'pickup' | 'carrier' | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const transaction = data?.data;

  // Derive current step from deliveryStatus
  // null -> 1 (Packing)
  // preparing -> 2 (Shipping)
  // delivering/delivered -> 3 (Timeline/Done)
  const currentStatus = transaction?.deliveryStatus;
  const step = !currentStatus ? 1 : currentStatus === 'preparing' ? 2 : 3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f57224] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">
            Đang tải dữ liệu giao hàng...
          </p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            Có lỗi xảy ra khi lấy thông tin vận chuyển hoặc đơn hàng không tồn
            tại.
          </p>
          <button
            onClick={() => navigate('/seller/don-hang')}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Quay lại Đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const {
    bike,
    buyer,
    amount,
    address,
    shippingAddress,
    fullName: transactionFullName,
    createdAt,
    transactionType,
  } = transaction;

  // Only show delivery workflow for full_payment and remaining_payment
  // For deposits, bike is only 'reserved', not 'sold', so no delivery yet
  const isDeliveryEligible =
    transactionType === 'full_payment' ||
    transactionType === 'remaining_payment';

  if (!isDeliveryEligible) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Chưa thể xử lý giao hàng
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            {transactionType === 'deposit'
              ? 'Để bắt đầu giao hàng, người mua cần thanh toán phần còn lại để hoàn tất lần mua hàng.'
              : 'Đơn hàng này chưa sẵn sàng cho giao hàng.'}
          </p>
          <button
            onClick={() => navigate('/seller/don-hang')}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Quay lại Đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const fullName = transactionFullName || buyer.fullName || buyer.name;
  const deliveryAddress =
    (typeof address === 'string' && address.trim()) ||
    (typeof shippingAddress === 'string' && shippingAddress.trim()) ||
    '';

  const handleConfirmPacking = async () => {
    setIsProcessing(true);
    try {
      await deliveryMut.mutateAsync({
        transactionId: id!,
        body: {
          status: 'preparing',
          deliveryNotes: 'Người bán đã đóng gói xong. Đang chờ vận chuyển.',
        },
      });
      toast.success('Đã xác nhận đóng gói!');
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái đóng gói');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArrangeShipment = async () => {
    if (!shippingMethod) {
      toast.error('Vui lòng chọn phương thức giao hàng');
      return;
    }

    setIsProcessing(true);
    try {
      await deliveryMut.mutateAsync({
        transactionId: id!,
        body: {
          status: 'delivering',
          deliveryNotes: `Đang giao hàng. Phương thức: ${shippingMethod === 'pickup' ? 'Người mua tự lấy' : 'Đơn vị vận chuyển (Chợ Xe Đạp Express)'}.`,
        },
      });
      toast.success('Đã bắt đầu quy trình giao hàng!');
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái vận chuyển');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-gray-800 pb-20">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Quản lý Giao hàng
              </h1>
              <p className="text-xs font-bold text-gray-400">
                ĐƠN HÀNG: #{id?.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= i
                      ? 'bg-[#f57224] text-white shadow-md shadow-orange-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
                </div>
                <span
                  className={`text-xs font-bold ${step >= i ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {i === 1 ? 'Đóng gói' : i === 2 ? 'Vận chuyển' : 'Hoàn tất'}
                </span>
                {i < 3 && (
                  <div
                    className={`w-8 h-[2px] ${step > i ? 'bg-[#f57224]' : 'bg-gray-100'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-12 gap-8">
        {/* Left: Main Action Flow */}
        <div className="lg:col-span-8 space-y-6">
          {step === 1 && (
            <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-gray-100/50 border border-gray-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Package className="w-32 h-32 text-gray-900" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f57224]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Xác nhận Đóng gói
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Bắt đầu quy trình bàn giao xe cho đơn vị vận chuyển
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4">
                  <Info className="w-6 h-6 text-blue-600 shrink-0" />
                  <div className="text-sm text-blue-900/80 font-medium leading-relaxed">
                    <p className="font-bold text-blue-900 mb-1">
                      Mẹo từ Chợ Xe Đạp:
                    </p>
                    Hãy chụp ảnh xe kèm vận đơn trước khi đóng gói hoặc bàn
                    giao. Điều này sẽ giúp bảo vệ bạn trong các trường hợp có
                    khiếu nại về hư hỏng trong quá trình vận chuyển.
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/30">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse" />
                    <div>
                      <p className="font-bold text-gray-900">
                        Ảnh xác nhận đóng gói (Tùy chọn)
                      </p>
                      <p className="text-xs text-gray-500">
                        Tải lên tối đa 3 ảnh để làm bằng chứng
                      </p>
                    </div>
                    <button className="ml-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      Chọn tệp
                    </button>
                  </div>

                  <button
                    onClick={handleConfirmPacking}
                    className="w-full py-5 bg-[#f57224] text-white rounded-3xl font-black text-lg hover:bg-[#e0651a] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-3"
                  >
                    Xác nhận đã Đóng gói{' '}
                    <ChevronLeft className="w-6 h-6 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-gray-100/50 border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Phương thức Vận chuyển
                  </h2>
                  <p className="text-gray-500 font-medium">
                    Lựa chọn cách bạn sẽ đưa xe tới tay chủ mới
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setShippingMethod('carrier')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col items-start gap-4 ${
                    shippingMethod === 'carrier'
                      ? 'border-[#f57224] bg-orange-50/30 shadow-lg shadow-orange-100/50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      shippingMethod === 'carrier'
                        ? 'bg-[#f57224] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">
                      Đơn vị vận chuyển
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-snug">
                      Hệ thống tự động liên hệ xe tải chuyên dụng tới lấy xe.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col items-start gap-4 ${
                    shippingMethod === 'pickup'
                      ? 'border-[#f57224] bg-orange-50/30 shadow-lg shadow-orange-100/50'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      shippingMethod === 'pickup'
                        ? 'bg-[#f57224] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">
                      Người mua tự lấy
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-snug">
                      Giao trực tiếp cho người mua tại địa chỉ của bạn.
                    </p>
                  </div>
                </button>
              </div>

              {shippingMethod === 'carrier' && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Hãng vận chuyển
                    </span>
                    <span className="font-black text-gray-900 flex items-center gap-1">
                      Chợ Xe Đạp Express{' '}
                      <Info className="w-4 h-4 text-[#f57224]" />
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Ngày lấy hàng (Dự kiến)
                    </p>
                    <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between font-bold text-gray-900">
                      Tất cả buổi sáng ngày mai
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleArrangeShipment}
                  disabled={!shippingMethod || isProcessing}
                  className="flex-[2] py-4 px-6 bg-[#f57224] text-white rounded-2xl font-black hover:bg-[#e0651a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Giao hàng ngay <Truck className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-orange-100/50 border-2 border-emerald-50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-emerald-500 rounded-b-full shadow-lg shadow-emerald-200" />

                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  Xác nhận Thành công!
                </h2>
                <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
                  Quy trình chuẩn bị hàng đã hoàn tất. Đơn vị vận chuyển sẽ sớm
                  liên lạc với bạn.
                </p>

                <div className="bg-gray-50 border-2 border-gray-100 rounded-3xl p-8 mb-8 max-w-md mx-auto grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Mã vận đơn
                    </p>
                    <p className="text-lg font-black text-[#f57224]">
                      CXD2024{id?.slice(0, 4).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex justify-end items-center">
                    <QrCode className="w-12 h-12 text-gray-900 opacity-20" />
                  </div>
                  <div className="col-span-2 pt-4 border-t border-gray-200/50 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Ngày dự kiến lấy hàng
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Sáng mai, từ 08:00 - 11:30
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => window.print()}
                    className="py-4 px-6 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
                  >
                    <Printer className="w-5 h-5" /> In phiếu giao hàng
                  </button>
                  <button
                    onClick={() => navigate('/seller/don-hang')}
                    className="py-4 px-6 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    Xem đơn hàng mới
                  </button>
                </div>
              </div>

              {/* Summary for buyer view sync */}
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                <div className="text-sm text-amber-900/80 font-medium">
                  <p className="font-bold mb-1 uppercase tracking-tight">
                    Hệ thống đã cập nhật tới Người Mua:
                  </p>
                  Trạng thái đơn hàng trên trang của Buyer đã chuyển sang{' '}
                  <span className="font-black text-emerald-600">
                    "Đang chuẩn bị hàng"
                  </span>
                  . Họ sẽ nhận được thông báo khi mã vận đơn được kích hoạt.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Insight Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] shadow-xl shadow-gray-100/50 border border-gray-50 overflow-hidden sticky top-28">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[2px]">
                Tóm tắt đơn hàng
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Bike Mini Card */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                  <img
                    src={getBikeImage(bike?.images?.[0], bike?.title)}
                    alt={bike?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => handleBikeImageError(e, bike?.title)}
                  />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 leading-snug line-clamp-2 mb-1">
                    {bike?.title}
                  </h4>
                  <p className="text-sm font-bold text-[#f57224]">
                    {Number(bike?.price || 0).toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">
                    ID: {bike?.id?.slice(0, 6)}
                  </p>
                </div>
              </div>

              <div className="h-[2px] bg-gray-50" />

              {/* Buyer Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f57224]/10 text-[#f57224] flex items-center justify-center font-black">
                    {(buyer?.name?.[0] || 'B').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Người mua
                    </p>
                    <p className="font-bold text-gray-900">
                      {buyer?.name || 'Customer'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-1">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Địa chỉ nhận
                      </p>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">
                        {deliveryAddress ? (
                          <>
                            {fullName ? (
                              <>
                                <span className="text-gray-500 font-semibold">
                                  {fullName}
                                </span>
                                <br />
                              </>
                            ) : null}
                            {deliveryAddress}
                          </>
                        ) : (
                          <span className="text-gray-400 font-medium italic">
                            Chưa có địa chỉ giao hàng trên đơn.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-xs font-bold text-gray-700">
                      {buyer?.phone || '0901 234 567'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">
                    Tổng giá trị
                  </span>
                  <span className="text-gray-900">
                    {Number(bike?.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">
                    Thanh toán
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" /> Đã trả (VNPay)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Link
                to={`/tin-dang/${bike?.id}`}
                target="_blank"
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase"
              >
                Trang bài đăng <ExternalLink className="w-3 h-3" />
              </Link>
              <p className="text-[10px] font-bold text-gray-400 italic">
                Đặt lúc: {new Date(createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
