import { z } from 'zod';

export const profileUpdateSchema = z.object({
  transport_mode: z.enum(['car', 'bike', 'bus', 'metro', 'walking']).optional(),
  transport_distance_km: z.number().min(0).max(500).optional(),
  diet_type: z.enum(['vegetarian', 'non-vegetarian', 'vegan']).optional(),
  ac_hours_daily: z.number().min(0).max(24).optional(),
  electricity_kwh_monthly: z.number().min(0).max(10000).optional(),
  water_liters_daily: z.number().min(0).max(5000).optional(),
  plastic_usage: z.enum(['low', 'moderate', 'high']).optional(),
  online_orders_monthly: z.number().int().min(0).max(200).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
