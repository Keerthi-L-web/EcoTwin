import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export default function LeaderboardPage() {
  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => api.get('/gamification/stats').then((r) => r.data),
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/gamification/leaderboard').then((r) => r.data),
  });

  const { data: badgesData } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.get('/gamification/badges').then((r) => r.data),
  });

  const leaderboard = (leaderboardData?.leaderboard ?? []) as Array<{ name: string; xp: number; level: number }>;
  const allBadges = (badgesData?.badges ?? []) as Array<{ id: string; name: string; icon: string; description: string; category: string }>;
  const earnedIds = new Set((badgesData?.earnedBadgeIds ?? []) as string[]);

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">Leaderboard & Badges</h1>
        <p className="text-surface-200/70 mt-1">Compete, earn badges, and climb the ranks</p>
      </section>

      {/* Your Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card hover className="text-center">
          <p className="text-3xl font-bold text-eco-400">{gamification?.level ?? 1}</p>
          <p className="text-sm text-surface-200/60">Level</p>
        </Card>
        <Card hover className="text-center">
          <p className="text-3xl font-bold text-accent-amber">{gamification?.xp ?? 0}</p>
          <p className="text-sm text-surface-200/60">XP</p>
        </Card>
        <Card hover className="text-center">
          <p className="text-3xl font-bold text-accent-rose">{gamification?.streak_days ?? 0}</p>
          <p className="text-sm text-surface-200/60">Day Streak</p>
        </Card>
        <Card hover className="text-center">
          <p className="text-3xl font-bold text-accent-violet">{gamification?.badges?.length ?? 0}</p>
          <p className="text-sm text-surface-200/60">Badges</p>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader><CardTitle>🏅 Top Players</CardTitle></CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center py-6 text-surface-200/40">No players yet</p>
          ) : (
            <ul className="space-y-2">
              {leaderboard.map((player, i) => (
                <li key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-700/30">
                  <span className={`text-lg font-bold w-8 text-center ${
                    i === 0 ? 'text-accent-amber' : i === 1 ? 'text-surface-200' : i === 2 ? 'text-accent-amber/60' : 'text-surface-200/60'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-surface-50">{player.name}</p>
                    <p className="text-xs text-surface-200/60">Level {player.level}</p>
                  </div>
                  <span className="font-bold text-eco-400">{player.xp} XP</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* All Badges */}
      <Card>
        <CardHeader><CardTitle>🏆 All Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  earnedIds.has(badge.id)
                    ? 'bg-eco-500/10 border border-eco-500/30'
                    : 'bg-surface-700/30 opacity-50 border border-surface-700/50'
                }`}
              >
                <span className="text-3xl block" aria-hidden="true">{badge.icon}</span>
                <p className="font-semibold text-sm text-surface-50 mt-2">{badge.name}</p>
                <p className="text-xs text-surface-200/60 mt-1">{badge.description}</p>
                {earnedIds.has(badge.id) && (
                  <span className="inline-block mt-2 text-xs text-eco-400 font-medium">✓ Earned</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
