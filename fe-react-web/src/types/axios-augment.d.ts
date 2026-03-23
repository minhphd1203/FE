import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Không gửi Bearer — dùng cho đọc tin đăng công khai (tránh token cũ gây 401). */
    skipAuth?: boolean;
  }
}
