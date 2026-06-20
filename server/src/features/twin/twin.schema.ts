import { z } from 'zod';

export const simulateSchema = z.object({
  changes: z.array(z.object({
    type: z.string().min(1),
    from: z.string().optional(),
    to: z.string().optional(),
    value: z.number().optional(),
    description: z.string().optional(),
  })).min(1, 'At least one change is required'),
  scenario_name: z.string().min(1).max(100).optional(),
});

export type SimulateInput = z.infer<typeof simulateSchema>;
