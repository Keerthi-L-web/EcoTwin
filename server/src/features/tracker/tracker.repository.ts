import { supabase } from '../../config/database';

export interface CarbonActivity {
  id: string;
  user_id: string;
  category: string;
  activity_type: string;
  value: number;
  unit: string;
  co2_kg: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface EmissionsSummary {
  daily: number;
  weekly: number;
  monthly: number;
  byCategory: Record<string, number>;
}

export class TrackerRepository {
  async create(activity: Omit<CarbonActivity, 'id' | 'created_at'>): Promise<CarbonActivity> {
    const { data, error } = await supabase
      .from('carbon_activities')
      .insert(activity)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Failed to create activity: ${error?.message}`);
    return data as CarbonActivity;
  }

  async findByUserAndRange(userId: string, startDate: string, endDate: string): Promise<CarbonActivity[]> {
    const { data, error } = await supabase
      .from('carbon_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .limit(200);

    if (error) throw new Error(`Failed to fetch activities: ${error.message}`);
    return (data ?? []) as CarbonActivity[];
  }

  async getSummary(userId: string): Promise<EmissionsSummary> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]!;

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0]!;

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthStr = monthAgo.toISOString().split('T')[0]!;

    // Get all activities from the last 30 days
    const activities = await this.findByUserAndRange(userId, monthStr, todayStr);

    const daily = activities
      .filter((a) => a.date === todayStr)
      .reduce((sum, a) => sum + Number(a.co2_kg), 0);

    const weekly = activities
      .filter((a) => a.date >= weekStr)
      .reduce((sum, a) => sum + Number(a.co2_kg), 0);

    const monthly = activities.reduce((sum, a) => sum + Number(a.co2_kg), 0);

    const byCategory: Record<string, number> = {};
    for (const activity of activities) {
      byCategory[activity.category] = (byCategory[activity.category] ?? 0) + Number(activity.co2_kg);
    }

    return {
      daily: Math.round(daily * 100) / 100,
      weekly: Math.round(weekly * 100) / 100,
      monthly: Math.round(monthly * 100) / 100,
      byCategory,
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('carbon_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete activity: ${error.message}`);
  }

  async getDailyTotals(userId: string, days: number): Promise<Array<{ date: string; co2_kg: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.findByUserAndRange(
      userId,
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );

    const dailyMap = new Map<string, number>();
    for (const a of activities) {
      dailyMap.set(a.date, (dailyMap.get(a.date) ?? 0) + Number(a.co2_kg));
    }

    const result: Array<{ date: string; co2_kg: number }> = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]!;
      result.push({ date: dateStr, co2_kg: Math.round((dailyMap.get(dateStr) ?? 0) * 100) / 100 });
    }

    return result;
  }
}
