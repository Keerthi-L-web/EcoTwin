import { z } from 'zod';

export const scenarioSchema = z.object({
  question: z.string().min(5, 'Question too short').max(500),
});

export type ScenarioInput = z.infer<typeof scenarioSchema>;
