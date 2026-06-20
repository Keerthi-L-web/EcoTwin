import { supabase } from '../../config/database';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_days: number;
  xp_reward: number;
  badge_name: string | null;
  icon: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  progress: number;
  challenge?: Challenge;
}

export class ChallengesService {
  async getAllChallenges(): Promise<Challenge[]> {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    return (data ?? []) as Challenge[];
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const { data, error } = await supabase
      .from('user_challenges')
      .insert({ user_id: userId, challenge_id: challengeId })
      .select('*, challenge:challenges(*)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Already joined this challenge');
      }
      throw new Error(`Failed to join challenge: ${error.message}`);
    }

    return data as UserChallenge;
  }

  async updateProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge> {
    const updates: Record<string, unknown> = { progress };

    if (progress >= 100) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();

      // Award XP
      const { data: challenge } = await supabase
        .from('challenges')
        .select('xp_reward')
        .eq('id', challengeId)
        .single();

      if (challenge) {
        await supabase.rpc('increment_xp', {
          p_user_id: userId,
          p_xp: (challenge as { xp_reward: number }).xp_reward,
        }).then(({ error }) => {
          // Fallback if RPC doesn't exist
          if (error) {
            supabase
              .from('user_gamification')
              .select('xp')
              .eq('user_id', userId)
              .single()
              .then(({ data: gData }) => {
                if (gData) {
                  const newXP = (gData as { xp: number }).xp + (challenge as { xp_reward: number }).xp_reward;
                  supabase
                    .from('user_gamification')
                    .update({ xp: newXP, level: Math.floor(newXP / 200) + 1, updated_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .then(() => {});
                }
              });
          }
        });
      }
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .update(updates)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select('*, challenge:challenges(*)')
      .single();

    if (error || !data) throw new Error(`Failed to update progress: ${error?.message}`);
    return data as UserChallenge;
  }

  async getActiveUserChallenges(userId: string): Promise<UserChallenge[]> {
    const { data } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    return (data ?? []) as UserChallenge[];
  }
}
