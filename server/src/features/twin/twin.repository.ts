import { supabase } from '../../config/database';
import { LifestyleProfile } from '../profile/profile.repository';

export interface TwinSimulation {
  id: string;
  user_id: string;
  scenario_name: string;
  current_co2_kg: number;
  predicted_co2_kg: number;
  reduction_percent: number;
  changes: unknown;
  created_at: string;
}

export class TwinRepository {
  async getProfile(userId: string): Promise<LifestyleProfile | null> {
    const { data } = await supabase
      .from('lifestyle_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data as LifestyleProfile | null;
  }

  async saveSimulation(sim: Omit<TwinSimulation, 'id' | 'created_at'>): Promise<TwinSimulation> {
    const { data, error } = await supabase
      .from('twin_simulations')
      .insert(sim)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Failed to save simulation: ${error?.message}`);
    return data as TwinSimulation;
  }

  async getHistory(userId: string): Promise<TwinSimulation[]> {
    const { data } = await supabase
      .from('twin_simulations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return (data ?? []) as TwinSimulation[];
  }
}
