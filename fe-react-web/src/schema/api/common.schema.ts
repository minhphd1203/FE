import { z } from 'zod';

/** Chuỗi ngày từ BE (ISO hoặc bất kỳ chuỗi không rỗng). */
export const dateTimeStringSchema = z.string().min(1);

/** Envelope JSON thường gặp: `{ success, data, message? }`. */
export function apiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z
    .object({
      success: z.boolean().optional(),
      data: dataSchema,
      message: z.string().optional(),
    })
    .passthrough();
}

/** Meta phân trang (seller bikes, messages, …). */
export const listMetaSchema = z
  .object({
    total: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    totalPages: z.coerce.number().optional(),
  })
  .passthrough();

/** Id dạng chuỗi (UUID, CUID, số string…). */
export const idStringSchema = z.string().min(1);
