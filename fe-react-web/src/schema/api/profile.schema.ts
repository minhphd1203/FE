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
