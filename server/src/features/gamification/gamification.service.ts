import { supabase } from '../../config/database';
import { getLevelFromXP } from '../../shared/carbon';

export interface GamificationStats {
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  badges: Array<{ id: string; name: string; icon: string; description: string; earned_at: string }>;
}

export class GamificationService {
  async getStats(userId: string): Promise<GamificationStats> {
    const { data: gamification } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('earned_at, badge:badges(id, name, icon, description)')
      .eq('user_id', userId);

    const badges = (userBadges ?? []).map((ub: Record<string, unknown>) => {
      const badge = ub.badge as Record<string, unknown>;
      return {
        id: badge.id as string,
        name: badge.name as string,
        icon: badge.icon as string,
        description: badge.description as string,
        earned_at: ub.earned_at as string,
      };
    });

    return {
      xp: (gamification as Record<string, unknown>)?.xp as number ?? 0,
      level: (gamification as Record<string, unknown>)?.level as number ?? 1,
      streak_days: (gamification as Record<string, unknown>)?.streak_days as number ?? 0,
      longest_streak: (gamification as Record<string, unknown>)?.longest_streak as number ?? 0,
      badges,
    };
  }

  async addXP(userId: string, xpAmount: number): Promise<void> {
    const { data } = await supabase
      .from('user_gamification')
      .select('xp')
      .eq('user_id', userId)
      .single();

    const currentXP = (data as Record<string, unknown>)?.xp as number ?? 0;
    const newXP = currentXP + xpAmount;
    const newLevel = getLevelFromXP(newXP);

    await supabase
      .from('user_gamification')
      .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  async updateStreak(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;
    const { data } = await supabase
      .from('user_gamification')
      .select('streak_days, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();

    if (!data) return;

    const gData = data as { streak_days: number; longest_streak: number; last_activity_date: string | null };
    const lastDate = gData.last_activity_date;
    let newStreak = gData.streak_days;

    if (lastDate) {
      const last = new Date(lastDate);
      const diff = Math.floor((new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        newStreak += 1;
      } else if (diff > 1) {
        newStreak = 1;
      }
      // diff === 0 means same day, don't change
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, gData.longest_streak);

    await supabase
      .from('user_gamification')
      .update({
        streak_days: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  async getLeaderboard(): Promise<Array<{ name: string; xp: number; level: number }>> {
    const { data } = await supabase
      .from('user_gamification')
      .select('xp, level, user:users(name)')
      .order('xp', { ascending: false })
      .limit(20);

    return (data ?? []).map((entry: Record<string, unknown>) => ({
      name: ((entry.user as Record<string, unknown>)?.name as string) ?? 'Anonymous',
      xp: entry.xp as number,
      level: entry.level as number,
    }));
  }

  async getAllBadges(userId: string): Promise<{
    badges: Array<{ id: string; name: string; icon: string; description: string; category: string; requirement_type: string; requirement_value: number }>;
    earnedBadgeIds: string[];
  }> {
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value');

    const { data: earned } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    return {
      badges: (allBadges ?? []) as Array<{ id: string; name: string; icon: string; description: string; category: string; requirement_type: string; requirement_value: number }>,
      earnedBadgeIds: (earned ?? []).map((e: Record<string, unknown>) => e.badge_id as string),
    };
  }
}
