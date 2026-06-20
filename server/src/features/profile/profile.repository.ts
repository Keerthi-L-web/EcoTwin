import { supabase } from '../../config/database';

export interface LifestyleProfile {
  id: string;
  user_id: string;
  transport_mode: string;
  transport_distance_km: number;
  diet_type: string;
  ac_hours_daily: number;
  electricity_kwh_monthly: number;
  water_liters_daily: number;
  plastic_usage: string;
  online_orders_monthly: number;
  created_at: string;
  updated_at: string;
}

export class ProfileRepository {
  async findByUserId(userId: string): Promise<LifestyleProfile | null> {
    const { data, error } = await supabase
      .from('lifestyle_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as LifestyleProfile;
  }

  async update(userId: string, updates: Partial<LifestyleProfile>): Promise<LifestyleProfile> {
    const { data, error } = await supabase
      .from('lifestyle_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Failed to update profile: ${error?.message}`);
    return data as LifestyleProfile;
  }
}
