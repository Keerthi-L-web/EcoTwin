import { supabase } from '../../config/database';

export class ReportsService {
  async getReportData(userId: string): Promise<{
    user: { name: string; email: string };
    footprint: { daily: number; weekly: number; monthly: number; yearly: number };
    byCategory: Record<string, number>;
    predictions: { nextMonth: number; endOfYear: number; trend: string };
    achievements: Array<{ name: string; icon: string; earned_at: string }>;
    recommendations: Array<{ type: string; response: unknown; created_at: string }>;
    challenges: Array<{ name: string; status: string; progress: number }>;
  }> {
    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    // Get activities summary (last 30 days)
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const { data: activities } = await supabase
      .from('carbon_activities')
      .select('co2_kg, category')
      .eq('user_id', userId)
      .gte('date', monthAgo.toISOString().split('T')[0]!)
      .lte('date', today.toISOString().split('T')[0]!);

    const monthlyTotal = (activities ?? []).reduce((s, a: Record<string, unknown>) => s + Number(a.co2_kg), 0);
    const byCategory: Record<string, number> = {};
    for (const a of (activities ?? []) as Array<{ co2_kg: number; category: string }>) {
      byCategory[a.category] = (byCategory[a.category] ?? 0) + Number(a.co2_kg);
    }

    // Get badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select('earned_at, badge:badges(name, icon)')
      .eq('user_id', userId);

    // Get latest recommendations
    const { data: recs } = await supabase
      .from('ai_recommendations')
      .select('type, response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get challenges
    const { data: challenges } = await supabase
      .from('user_challenges')
      .select('status, progress, challenge:challenges(name)')
      .eq('user_id', userId);

    const userData = user as { name: string; email: string } ?? { name: 'User', email: '' };

    return {
      user: userData,
      footprint: {
        daily: Math.round((monthlyTotal / 30) * 100) / 100,
        weekly: Math.round((monthlyTotal / 4.3) * 100) / 100,
        monthly: Math.round(monthlyTotal * 100) / 100,
        yearly: Math.round(monthlyTotal * 12 * 100) / 100,
      },
      byCategory,
      predictions: {
        nextMonth: Math.round(monthlyTotal * 0.95 * 100) / 100,
        endOfYear: Math.round(monthlyTotal * 12 * 100) / 100,
        trend: monthlyTotal > 200 ? 'high' : monthlyTotal > 100 ? 'moderate' : 'low',
      },
      achievements: (badges ?? []).map((b: Record<string, unknown>) => ({
        name: ((b.badge as Record<string, unknown>)?.name as string) ?? '',
        icon: ((b.badge as Record<string, unknown>)?.icon as string) ?? '🏆',
        earned_at: b.earned_at as string,
      })),
      recommendations: (recs ?? []) as Array<{ type: string; response: unknown; created_at: string }>,
      challenges: (challenges ?? []).map((c: Record<string, unknown>) => ({
        name: ((c.challenge as Record<string, unknown>)?.name as string) ?? '',
        status: c.status as string,
        progress: c.progress as number,
      })),
    };
  }
}
