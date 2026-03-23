import { z } from 'zod';
import { apiEnvelopeSchema } from './common.schema';

// --- Form: POST /auth/login ---
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// --- Form: POST /auth/register ---
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(8, 'Số điện thoại phải có ít nhất 8 ký tự')
      .max(15, 'Số điện thoại quá dài')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export const registerApiBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
});

// --- Response: user / login ---
export const authUserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
  })
  .passthrough();

export const authLoginInnerSchema = z
  .object({
    token: z.string(),
    user: authUserSchema,
  })
  .passthrough();

export const authLoginResponseSchema = apiEnvelopeSchema(authLoginInnerSchema);

export const authMeResponseSchema = z.union([
  apiEnvelopeSchema(authUserSchema),
  authUserSchema,
]);

export const authRefreshResponseSchema = z
  .object({ token: z.string() })
  .passthrough();

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
