import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

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

export const bicycleSchema = z.object({
  title: z.string().min(10, 'Tiêu đề phải có ít nhất 10 ký tự'),
  description: z.string().min(50, 'Mô tả phải có ít nhất 50 ký tự'),
  price: z.number().min(0, 'Giá phải lớn hơn 0'),
  brand: z.string().min(2, 'Thương hiệu phải có ít nhất 2 ký tự'),
  condition: z.enum(['new', 'like-new', 'good', 'fair']),
  type: z.enum(['road', 'mountain', 'hybrid', 'electric', 'folding', 'other']),
  frameSize: z.string().optional(),
  year: z.number().min(1990).max(new Date().getFullYear()).optional(),
  images: z.array(z.string()).min(1, 'Cần ít nhất 1 ảnh'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BicycleFormData = z.infer<typeof bicycleSchema>;
