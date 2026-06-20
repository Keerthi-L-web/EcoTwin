import { supabase } from '../../config/database';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export class NotificationsService {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data ?? []) as Notification[];
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  async createNotification(userId: string, type: string, title: string, message: string): Promise<void> {
    await supabase
      .from('notifications')
      .insert({ user_id: userId, type, title, message });
  }
}
