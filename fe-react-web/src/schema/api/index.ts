/**
 * Zod schemas cho body/query/response các API (và form trùng khớp) mà fe-react-web gọi.
 * Dùng: `safeParse` khi cần kiểm tra response lỏng; form với `zodResolver` import từ `schema/validation`.
 */
export * from './common.schema';
export * from './auth.schema';
export * from './buyer.schema';
export * from './seller.schema';
export * from './admin.schema';
export * from './inspector.schema';
export * from './profile.schema';
export * from './payment.schema';
