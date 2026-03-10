/**
 * Shared Zod schemas for sync engine Task validation.
 * Used on both server (push route) and client (SyncDemo).
 *
 * Limits:
 * - Max 75 chars per todo title (to avoid spam)
 * - Max 100 todos total (enforced server-side + client-side)
 */

import { z } from 'zod';

export const MAX_TODO_TITLE_LENGTH = 75;
export const MAX_TOTAL_TODOS = 100;

/** Task title - max 75 chars */
export const taskTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(
    MAX_TODO_TITLE_LENGTH,
    `Title must be at most ${MAX_TODO_TITLE_LENGTH} characters`
  );

/** Task create data - for new tasks */
export const taskCreateSchema = z.object({
  title: taskTitleSchema,
  description: z.string().max(200).optional().nullable(),
  status: z.string().optional(),
  priority: z.number().optional(),
  labels: z.string().optional().nullable(),
});

/** Task update data - partial, for edits (title optional but validated if present) */
export const taskUpdateSchema = z.object({
  title: taskTitleSchema.optional(),
  description: z.string().max(200).optional().nullable(),
  status: z.string().optional(),
  priority: z.number().optional(),
  labels: z.string().optional().nullable(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
