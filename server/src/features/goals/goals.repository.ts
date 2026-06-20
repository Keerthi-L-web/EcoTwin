import { supabase } from '../../config/database';
import { Goal } from './goals.types';
import { CreateGoalInput, UpdateGoalInput } from './goals.schema';

export class GoalsRepository {
  async findByUserId(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Goal[];
  }

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: input.title,
        target_co2_kg: input.target_co2_kg,
        deadline: input.deadline,
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data as Goal;
  }

  async update(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data as Goal;
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }
}
