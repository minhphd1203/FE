import {
  Mountain,
  Bike,
  Battery,
  Baby,
  Package,
  Heart,
  Bookmark,
  Clock,
  Star,
  History,
  Sparkles,
  Percent,
  Settings,
  Headset,
  LayoutDashboard,
  UserCircle,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 1, label: 'Xe đạp địa hình', icon: Mountain, slug: 'xe-dap-dia-hinh' },
  { id: 2, label: 'Xe đạp đường phố', icon: Bike, slug: 'xe-dap-duong-pho' },
  { id: 3, label: 'Xe đạp điện', icon: Battery, slug: 'xe-dap-dien' },
  { id: 4, label: 'Xe đạp trẻ em', icon: Baby, slug: 'xe-dap-tre-em' },
  { id: 5, label: 'Phụ kiện', icon: Package, slug: 'phu-kien' },
];

export const MOCK_LISTINGS = [
  {
    id: 1,
    title: 'Xe đạp địa hình Giant Talon 3 size M',
    price: '8.500.000 đ',
    location: 'Quận 1, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop',
    categoryId: 1, // Xe đạp địa hình
  },
  {
    id: 2,
    title: 'Xe đạp đường phố Trinx 2024 mới 99%',
    price: '3.200.000 đ',
    location: 'Quận 7, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop',
    categoryId: 2, // Xe đạp đường phố
  },
  {
    id: 3,
    title: 'Xe đạp điện Nijia inox bình mới',
    price: '12.000.000 đ',
    location: 'Quận Bình Thạnh, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    categoryId: 3, // Xe đạp điện
  },
  {
    id: 4,
    title: 'Xe đạp đua carbon 9.5kg full shimano',
    price: '25.000.000 đ',
    location: 'Quận 3, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=300&fit=crop',
    categoryId: 2, // Xe đạp đường phố / đua (map to street for now)
  },
  {
    id: 5,
    title: 'Bộ đồ bảo hộ xe đạp thể thao',
    price: '450.000 đ',
    location: 'Quận 10, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop',
    categoryId: 5, // Phụ kiện
  },
  {
    id: 6,
    title: 'Xe đạp gấp Dahon Mariner D8',
    price: '15.000.000 đ',
    location: 'Quận Phú Nhuận, Hồ Chí Minh',
    image:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop',
    categoryId: 5, // Xe đạp gấp (map to phụ kiện or make a new one? user listed 5 cats from homepage. "Xe đạp gấp" is not in top 5 list but commonly exists. I will map it to Category 2 for now or leave undefined)
  },
];

export const UTILITIES = [
  { id: 1, label: 'Tin đăng đã lưu', icon: Heart, href: '/tin-dang-da-luu' },
  { id: 2, label: 'Tìm kiếm đã lưu', icon: Bookmark, href: '/tim-kiem-da-luu' },
  { id: 3, label: 'Lịch sử xem tin', icon: Clock, href: '/lich-su-xem-tin' },
  { id: 4, label: 'Đánh giá từ tôi', icon: Star, href: '/danh-gia-tu-toi' },
];

export const ACCOUNT_MENU_TOP = [
  {
    id: 1,
    label: 'Lịch sử giao dịch',
    icon: History,
    href: '/lich-su-giao-dich',
  },
];

/** Chỉ hiển thị khi user có role seller */
export const ACCOUNT_MENU_SELLER = [
  {
    id: 1,
    label: 'Tổng quan kênh bán',
    icon: LayoutDashboard,
    href: '/seller',
  },
  {
    id: 2,
    label: 'Hồ sơ người bán',
    icon: UserCircle,
    href: '/seller/ho-so',
  },
];

export const ACCOUNT_MENU_OFFERS = [
  { id: 1, label: 'Chợ Xe Đạp ưu đãi', icon: Sparkles, href: '/uu-dai' },
  { id: 2, label: 'Ưu đãi của tôi', icon: Percent, href: '/uu-dai-cua-toi' },
];

export const ACCOUNT_MENU_OTHER = [
  { id: 1, label: 'Cài đặt tài khoản', icon: Settings, href: '/cai-dat' },
  { id: 2, label: 'Trợ giúp', icon: Headset, href: '/tro-giup' },
];
