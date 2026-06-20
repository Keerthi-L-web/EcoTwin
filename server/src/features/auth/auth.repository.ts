import { supabase } from '../../config/database';
import { UserWithPassword, User } from './auth.types';

export class AuthRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as UserWithPassword;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  async create(email: string, passwordHash: string, name: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, name })
      .select('id, email, name, avatar_url, created_at, updated_at')
      .single();

    if (error || !data) throw new Error(`Failed to create user: ${error?.message}`);
    return data as User;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ refresh_token: refreshToken, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(`Failed to update refresh token: ${error.message}`);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('users')
      .select('refresh_token')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return (data as { refresh_token: string | null }).refresh_token;
  }

  async createGamificationProfile(userId: string): Promise<void> {
    await supabase
      .from('user_gamification')
      .insert({ user_id: userId });
  }

  async createLifestyleProfile(userId: string): Promise<void> {
    await supabase
      .from('lifestyle_profiles')
      .insert({ user_id: userId });
  }
}
