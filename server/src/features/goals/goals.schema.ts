import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  target_co2_kg: z.number().positive('Target must be positive'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date string',
  }),
});

export const updateGoalSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  target_co2_kg: z.number().positive().optional(),
  deadline: z.string().optional(),
  status: z.enum(['in_progress', 'completed', 'failed']).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
