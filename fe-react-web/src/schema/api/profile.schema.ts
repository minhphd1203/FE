import { z } from 'zod';
import { apiEnvelopeSchema } from './common.schema';

export const profileUserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    role: z.string(),
  })
  .passthrough();

export const profileInfoResponseSchema = apiEnvelopeSchema(profileUserSchema);

/** PUT /profile/v1/info */
export const profileUpdateBodySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  })
  .passthrough();

/** POST /profile/v1/change-password */
export const profileChangePasswordBodySchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Mật khẩu mới ít nhất 6 ký tự'),
});
