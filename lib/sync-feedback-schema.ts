import { z } from 'zod';

export const syncFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(200, 'Message must be at most 200 characters'),
});

export type SyncFeedbackInput = z.infer<typeof syncFeedbackSchema>;
