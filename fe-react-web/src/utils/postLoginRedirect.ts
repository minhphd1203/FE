/** Trang mặc định sau đăng nhập / khi user đã auth mở /auth/*. */
export function getDefaultRouteForRole(
  role: string | undefined | null,
): string {
  const r = String(role || 'buyer')
    .trim()
    .toLowerCase();
  if (r === 'admin') return '/admin';
  if (r === 'inspector') return '/inspector/dashboard';
  if (r === 'seller') return '/seller';
  return '/';
}
