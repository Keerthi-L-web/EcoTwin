import { z } from 'zod';

export const createActivitySchema = z.object({
  category: z.enum(['transport', 'food', 'energy', 'waste']),
  activity_type: z.string().min(1).max(50),
  value: z.number().positive(),
  unit: z.string().min(1).max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  notes: z.string().max(500).optional(),
});

export const activityQuerySchema = z.object({
  range: z.enum(['day', 'week', 'month']).default('week'),
  date: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
