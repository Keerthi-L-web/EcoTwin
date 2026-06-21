import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = (data?.notifications ?? []) as Array<{
    id: string; type: string; title: string; message: string;
    is_read: boolean; created_at: string;
  }>;

  const typeIcons: Record<string, string> = {
    goal: '🎯', challenge: '🏆', achievement: '⭐', tip: '💡', system: '📢',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Notifications</h1>
          <p className="text-surface-200/70 mt-1">{notifications.filter((n) => !n.is_read).length} unread</p>
        </div>
        <Button variant="outline" onClick={() => markAllMutation.mutate()} size="sm">
          Mark All Read
        </Button>
      </section>

      <Card>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center py-12 text-surface-200/40">No notifications yet</p>
          ) : (
            <ul className="divide-y divide-surface-700/30">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`py-4 px-2 flex items-start gap-3 ${!n.is_read ? 'bg-eco-500/5' : ''}`}
                >
                  <span className="text-xl mt-0.5" aria-hidden="true">{typeIcons[n.type] ?? '📌'}</span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${!n.is_read ? 'text-surface-50' : 'text-surface-200/70'}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-surface-200/60 mt-0.5">{n.message}</p>
                    <p className="text-xs text-surface-200/40 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="text-xs text-eco-400 hover:text-eco-300 font-medium whitespace-nowrap"
                      aria-label={`Mark "${n.title}" as read`}
                    >
                      Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
