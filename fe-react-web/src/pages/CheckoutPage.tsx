import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Banknote,
  CreditCard,
  ChevronLeft,
  CheckCircle2,
  Info,
  MapPin,
} from 'lucide-react';
import {
  useBuyerCreateTransactionMutation,
  useBuyerBikeDetailsQuery,
} from '../hooks/buyer/useBuyerQueries';
import { getBikeImage, handleBikeImageError } from '../utils/bikeImage';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  note: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
};

type LocationItem = {
  code: number;
  name: string;
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bikeId, amount } = location.state || {};

  const { data: bike } = useBuyerBikeDetailsQuery(bikeId);

  const createTxMut = useBuyerCreateTransactionMutation();

  const [method, setMethod] = useState<'cod' | 'vnpay'>('vnpay');
  const [transactionType, setTransactionType] = useState<
    'full_payment' | 'deposit'
  >('full_payment');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    phone: '',
    email: '',
    note: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: '',
  });

  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');

  // Fetch Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          'https://provinces.open-api.vn/api/p/',
        );
        setProvinces(response.data);
      } catch (err) {
        console.error('Error fetching provinces:', err);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`,
        );
        setDistricts(response.data.districts);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`,
        );
        setWards(response.data.wards);
      } catch (err) {
        console.error('Error fetching wards:', err);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  if (!bikeId) {
    navigate('/');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalAmount =
    transactionType === 'full_payment'
      ? Number(amount || bike?.price || 0)
      : Number((amount || bike?.price || 0) * 0.3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;
    setError(null);
    try {
      const addressLine = `${formData.addressDetail}, ${formData.ward}, ${formData.district}, ${formData.province}`;
      await createTxMut.mutateAsync({
        bikeId,
        amount: finalAmount,
        notes: formData.note || `Yêu cầu mua xe ${bike?.title || ''}`,
        transactionType,
        paymentMethod: method === 'cod' ? null : 'vnpay',
        address: addressLine,
        shippingAddress: addressLine,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại sau.';

      setError(apiMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Yêu cầu mua xe đã được gửi!
          </h1>
          <p className="text-gray-600">
            Người bán sẽ xem xét và phản hồi yêu cầu của bạn.
            {method === 'vnpay' &&
              ' Sau khi người bán chấp nhận (Approved), bạn có thể thanh toán trực tuyến trong phần quản lý Đơn mua.'}
          </p>
          <div className="flex justify-center flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate('/don-mua')}
              className="px-6 py-2.5 rounded-xl bg-[#f57224] text-white font-medium hover:bg-[#e0651a] shadow-sm transition-colors"
            >
              Quản lý đơn mua
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:text-[#f57224] hover:border-[#f57224] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Gửi yêu cầu mua xe
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Điền thông tin và hình thức giao dịch để người bán tiện liên hệ.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Cột trái: Form thông tin & Phương thức thanh toán */}
          <div className="lg:col-span-8 space-y-6">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Thông tin liên hệ */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#f57224]/10 text-[#f57224] flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Thông tin liên hệ
                </h2>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all placeholder:text-gray-400 font-medium text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="VD: 0912 345 678"
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all placeholder:text-gray-400 font-medium text-gray-900"
                    />
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-semibold text-gray-700">
                    Email nhận thông báo <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="VD: nguyenvana@email.com"
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all placeholder:text-gray-400 font-medium text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Ghi chú cho người bán (Tuỳ chọn)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Nhập thời gian có thể xem xe, hoặc yêu cầu khác để gửi đến người bán..."
                    rows={3}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all placeholder:text-gray-400 resize-none font-medium text-gray-900"
                  ></textarea>
                </div>
              </div>

              {/* Địa chỉ nhận hàng - Shopee Style */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                {/* Dải màu Shopee đặc trưng ở mép trên */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,#f57224,#f57224_33px,#ffffff_33px,#ffffff_66px,#4080ff_66px,#4080ff_99px,#ffffff_99px,#ffffff_132px)]"></div>

                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-[#f57224]" />
                  Địa chỉ nhận hàng
                </h2>

                <div className="grid sm:grid-cols-3 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      name="province"
                      value={selectedProvinceCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const name =
                          provinces.find((p) => String(p.code) === code)
                            ?.name || '';
                        setSelectedProvinceCode(code);
                        setSelectedDistrictCode('');
                        setFormData((prev) => ({
                          ...prev,
                          province: name,
                          district: '',
                          ward: '',
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all font-medium text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      name="district"
                      value={selectedDistrictCode}
                      disabled={!selectedProvinceCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const name =
                          districts.find((d) => String(d.code) === code)
                            ?.name || '';
                        setSelectedDistrictCode(code);
                        setFormData((prev) => ({
                          ...prev,
                          district: name,
                          ward: '',
                        }));
                      }}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all font-medium text-gray-900 appearance-none disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      name="ward"
                      value={
                        formData.ward
                          ? wards.find((w) => w.name === formData.ward)?.code
                          : ''
                      }
                      disabled={!selectedDistrictCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const name =
                          wards.find((w) => String(w.code) === code)?.name ||
                          '';
                        setFormData((prev) => ({ ...prev, ward: name }));
                      }}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all font-medium text-gray-900 appearance-none disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="addressDetail"
                    value={formData.addressDetail}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường, tên tòa nhà..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#f57224]/20 focus:border-[#f57224] outline-none transition-all placeholder:text-gray-400 font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Loại giao dịch */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#f57224]/10 text-[#f57224] flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Hình thức thanh toán
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] ${transactionType === 'full_payment' ? 'border-[#f57224] bg-orange-50/40 shadow-md shadow-[#f57224]/10' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}
                  >
                    <input
                      type="radio"
                      name="transactionType"
                      value="full_payment"
                      className="sr-only"
                      checked={transactionType === 'full_payment'}
                      onChange={() => setTransactionType('full_payment')}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 text-base">
                        Thanh toán toàn bộ
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${transactionType === 'full_payment' ? 'border-[#f57224]' : 'border-gray-300'}`}
                      >
                        <div
                          className={`w-3 h-3 bg-[#f57224] rounded-full transition-transform ${transactionType === 'full_payment' ? 'scale-100' : 'scale-0'}`}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Thanh toán 100% giá trị xe để mua đứt
                    </p>
                  </label>

                  <label
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] ${transactionType === 'deposit' ? 'border-[#f57224] bg-orange-50/40 shadow-md shadow-[#f57224]/10' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}
                  >
                    <input
                      type="radio"
                      name="transactionType"
                      value="deposit"
                      className="sr-only"
                      checked={transactionType === 'deposit'}
                      onChange={() => setTransactionType('deposit')}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 text-base">
                        Đặt cọc trước (30%)
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${transactionType === 'deposit' ? 'border-[#f57224]' : 'border-gray-300'}`}
                      >
                        <div
                          className={`w-3 h-3 bg-[#f57224] rounded-full transition-transform ${transactionType === 'deposit' ? 'scale-100' : 'scale-0'}`}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      Thanh toán 30% trước để giữ chỗ, phần còn lại sẽ được
                      thanh toán sau.
                    </p>
                  </label>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#f57224]/10 text-[#f57224] flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Phương thức lựa chọn
                </h2>

                <div className="bg-[#f57224]/5 text-[#d05c19] p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-[#f57224]/20">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium">
                    <strong>Lưu ý:</strong> Mọi yêu cầu mua bán cần sự phản hồi
                    và <strong>đồng ý</strong> từ phía người bán, sau đó chức
                    năng thanh toán qua VNPay mới được kích hoạt trong trang
                    quản lý đơn trực tuyến.
                  </p>
                </div>

                <div className="space-y-4 md:space-y-5">
                  <label
                    className={`flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] ${method === 'vnpay' ? 'border-[#f57224] bg-orange-50/30 shadow-[0_0_0_1px_#f57224] shadow-[#f57224]/10' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value="vnpay"
                      checked={method === 'vnpay'}
                      onChange={() => setMethod('vnpay')}
                      className="sr-only"
                    />
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                      <CreditCard className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base">
                        Chuyển khoản / Quét QR (VNPay)
                      </p>
                      <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                        Hỗ trợ thanh toán nhanh, an toàn, có biên nhận rõ ràng
                        thông qua Cổng thanh toán quốc gia VNPay.
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-colors ${method === 'vnpay' ? 'border-[#f57224]' : 'border-gray-300'}`}
                    >
                      <div
                        className={`w-3 h-3 bg-[#f57224] rounded-full transition-transform ${method === 'vnpay' ? 'scale-100' : 'scale-0'}`}
                      />
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] ${method === 'cod' ? 'border-[#f57224] bg-orange-50/30 shadow-[0_0_0_1px_#f57224] shadow-[#f57224]/10' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value="cod"
                      checked={method === 'cod'}
                      onChange={() => setMethod('cod')}
                      className="sr-only"
                    />
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Banknote className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base">
                        Thỏa thuận trực tiếp
                      </p>
                      <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                        Người mua người bán tự thanh toán tiền mặt khi gặp nhau
                        và giao dịch chuyển nhượng xe.
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-colors ${method === 'cod' ? 'border-[#f57224]' : 'border-gray-300'}`}
                    >
                      <div
                        className={`w-3 h-3 bg-[#f57224] rounded-full transition-transform ${method === 'cod' ? 'scale-100' : 'scale-0'}`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Cột phải: Tổng kết đơn hàng */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 md:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Tóm tắt đơn hàng
              </h2>

              {/* Giới thiệu xe (nếu fetch được chi tiết) */}
              {bike ? (
                <div className="flex flex-col gap-4 mb-8">
                  <div className="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    {bike.images?.[0] || bike.image ? (
                      <img
                        src={getBikeImage(
                          bike.images?.[0] || bike.image,
                          bike.title,
                        )}
                        alt={bike.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        onError={(e) => handleBikeImageError(e, bike.title)}
                      />
                    ) : (
                      <img
                        src={getBikeImage(undefined, bike.title)}
                        alt="Xe"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2">
                      {bike.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-1 rounded capitalize">
                        {bike.condition || 'Đã sử dụng'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 animate-pulse flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-100 text-[15px]">
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Giá trị xe gốc</span>
                  <span className="text-gray-900 font-bold">
                    {Number(amount || bike?.price || 0).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>
                {transactionType === 'deposit' && (
                  <div className="flex justify-between items-center px-3 py-2 bg-orange-50 font-semibold text-[#f57224] rounded-lg mt-2 border border-orange-100">
                    <span className="flex items-center gap-1.5">
                      <ChevronLeft className="w-4 h-4" /> Đặt cọc 30%
                    </span>
                    <span>Còn lại 70%</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t-[1.5px] border-dashed border-gray-200">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-800 font-bold text-base">
                    Cần thanh toán
                  </span>
                  <span className="text-3xl font-extrabold text-[#f57224] tracking-tight">
                    {finalAmount > 0
                      ? finalAmount.toLocaleString('vi-VN')
                      : '---'}
                    <span className="text-xl inline-block ml-1">đ</span>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={createTxMut.isPending || !bike || finalAmount <= 0}
                className="w-full mt-8 px-6 py-4 bg-[#f57224] text-white rounded-xl font-bold text-base md:text-lg hover:bg-[#e0651a] shadow-[0_8px_20px_-6px_rgba(245,114,36,0.6)] hover:shadow-[0_12px_24px_-8px_rgba(245,114,36,0.8)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 flex justify-center items-center gap-3 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
              >
                {createTxMut.isPending ? (
                  <>
                    <span className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                      Gửi Yêu Cầu Mua
                    </span>
                    <div className="absolute inset-0 w-full h-full bg-white/[0.15] -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out skew-x-12"></div>
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-emerald-600 font-medium bg-emerald-50 py-2.5 rounded-lg border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                Duyệt nhanh, An toàn & Đảm bảo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
