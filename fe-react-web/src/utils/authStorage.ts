/** Đồng bộ phiên đăng nhập với localStorage để F5 không mất Redux. */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ROLE_KEY = 'role';

export interface StoredAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

function ls(): Storage | null {
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

export function persistAuthSession(user: StoredAuthUser, token: string): void {
  const s = ls();
  if (!s) return;
  s.setItem(TOKEN_KEY, token);
  s.setItem(USER_KEY, JSON.stringify(user));
  s.setItem(ROLE_KEY, (user.role || 'buyer').toLowerCase());
}

export function clearAuthSession(): void {
  const s = ls();
  if (!s) return;
  s.removeItem(TOKEN_KEY);
  s.removeItem(USER_KEY);
  s.removeItem(ROLE_KEY);
}

export function readStoredAuth(): {
  user: StoredAuthUser;
  token: string;
} | null {
  const s = ls();
  if (!s) return null;
  const token = s.getItem(TOKEN_KEY);
  const raw = s.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    const user = JSON.parse(raw) as StoredAuthUser;
    if (user?.id && user?.email) {
      const role = user.role || 'buyer';
      return { user: { ...user, role }, token };
    }
  } catch {
    /* ignore */
  }
  return null;
}
