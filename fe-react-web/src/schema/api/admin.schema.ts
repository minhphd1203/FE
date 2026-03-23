import { z } from 'zod';
import { apiEnvelopeSchema, dateTimeStringSchema } from './common.schema';

export const getAdminBikesQuerySchema = z
  .object({
    search: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    sort: z.enum(['newest', 'oldest']).optional(),
  })
  .passthrough();

export const getAdminUsersQuerySchema = z
  .object({
    search: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough();

export const adminUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
    role: z.string(),
    createdAt: dateTimeStringSchema,
    updatedAt: dateTimeStringSchema,
  })
  .passthrough();

export const adminBikeSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    brand: z.string(),
    model: z.string(),
    year: z.coerce.number(),
    price: z.coerce.number(),
    condition: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    images: z.array(z.string()),
    sellerId: z.string(),
    categoryId: z.string().nullable().optional(),
    createdAt: dateTimeStringSchema,
    updatedAt: dateTimeStringSchema,
  })
  .passthrough();

export const adminTransactionSchema = z
  .object({
    id: z.string(),
    status: z.enum(['pending', 'completed', 'cancelled']),
    amount: z.coerce.number(),
    createdAt: dateTimeStringSchema,
    updatedAt: dateTimeStringSchema,
    notes: z.string().nullable().optional(),
  })
  .passthrough();

export const adminReportSchema = z
  .object({
    id: z.string(),
    status: z.enum(['pending', 'resolved', 'closed']),
    reason: z.string(),
    resolution: z.string().nullable().optional(),
    createdAt: dateTimeStringSchema,
    updatedAt: dateTimeStringSchema,
    resolvedAt: z.string().nullable().optional(),
  })
  .passthrough();

export const adminCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    createdAt: dateTimeStringSchema,
    updatedAt: dateTimeStringSchema,
  })
  .passthrough();

export const adminCategoryCreateBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export const adminCategoryUpdateBodySchema =
  adminCategoryCreateBodySchema.partial();

export const adminBikeStatusBodySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export const adminApiEnvelope = <T extends z.ZodTypeAny>(s: T) =>
  apiEnvelopeSchema(s);
