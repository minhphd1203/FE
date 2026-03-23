import {
  Mountain,
  Bike,
  Battery,
  Baby,
  Package,
  Heart,
  History,
  ShoppingBag,
  LayoutDashboard,
  UserCircle,
  Settings,
  Headset,
  Handshake,
  MessageCircle,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 1, label: 'Xe đạp địa hình', icon: Mountain, slug: 'xe-dap-dia-hinh' },
  { id: 2, label: 'Xe đạp đường phố', icon: Bike, slug: 'xe-dap-duong-pho' },
  { id: 3, label: 'Xe đạp điện', icon: Battery, slug: 'xe-dap-dien' },
  { id: 4, label: 'Xe đạp trẻ em', icon: Baby, slug: 'xe-dap-tre-em' },
  { id: 5, label: 'Phụ kiện', icon: Package, slug: 'phu-kien' },
];

/** Mục dưới header / menu — chỉ đường dẫn đã nối API thật. */
export const HEADER_QUICK_LINKS = [
  { id: 1, label: 'Yêu thích', icon: Heart, href: '/yeu-thich' },
  { id: 2, label: 'Đơn mua', icon: ShoppingBag, href: '/don-mua' },
];

export const ACCOUNT_MENU_TOP = [
  {
    id: 1,
    label: 'Lịch sử giao dịch',
    icon: History,
    href: '/lich-su-giao-dich',
  },
];

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
  {
    id: 3,
    label: 'Đề nghị mua (trả giá)',
    icon: Handshake,
    href: '/seller/tra-gia',
  },
  { id: 4, label: 'Đơn hàng', icon: ShoppingBag, href: '/seller/don-hang' },
  {
    id: 5,
    label: 'Tin nhắn',
    icon: MessageCircle,
    href: '/seller/tin-nhan',
  },
];

export const ACCOUNT_MENU_OTHER = [
  { id: 1, label: 'Cài đặt tài khoản', icon: Settings, href: '/cai-dat' },
  { id: 2, label: 'Trợ giúp', icon: Headset, href: '/tro-giup' },
];
