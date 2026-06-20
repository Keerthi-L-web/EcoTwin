import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function ChallengesPage() {
  const queryClient = useQueryClient();

  const { data: challengesData } = useQuery({
    queryKey: ['allChallenges'],
    queryFn: () => api.get('/challenges').then((r) => r.data),
  });

  const { data: activeData } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: () => api.get('/challenges/active').then((r) => r.data),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => api.post(`/challenges/${id}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      api.put(`/challenges/${id}/progress`, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });

  const challenges = (challengesData?.challenges ?? []) as Array<{
    id: string; name: string; description: string; category: string;
    duration_days: number; xp_reward: number; icon: string;
  }>;

  const active = (activeData?.userChallenges ?? []) as Array<{
    id: string; challenge_id: string; status: string; progress: number;
    challenge?: { name: string; icon: string; xp_reward: number };
  }>;

  const activeIds = new Set(active.map((a) => a.challenge_id));

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">Challenges</h1>
        <p className="text-surface-200/70 mt-1">Take on eco challenges and earn XP</p>
      </section>

      {/* Active Challenges */}
      {active.length > 0 && (
        <section aria-label="Active challenges">
          <h2 className="text-lg font-semibold text-surface-50 mb-4">Your Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.filter((a) => a.status === 'active').map((uc) => (
              <Card key={uc.id} className="border-eco-500/20">
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" aria-hidden="true">{uc.challenge?.icon}</span>
                    <div>
                      <p className="font-semibold text-surface-50">{uc.challenge?.name}</p>
                      <p className="text-xs text-surface-200/60">{uc.challenge?.xp_reward} XP reward</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-700 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-eco-500 to-eco-300 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${uc.progress}%` }}
                      role="progressbar"
                      aria-valuenow={uc.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-eco-400 font-medium">{uc.progress}%</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => progressMutation.mutate({ id: uc.challenge_id, progress: Math.min(uc.progress + 25, 100) })}
                      >
                        +25%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => progressMutation.mutate({ id: uc.challenge_id, progress: 100 })}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Available Challenges */}
      <section aria-label="Available challenges">
        <h2 className="text-lg font-semibold text-surface-50 mb-4">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c) => (
            <Card key={c.id} hover>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" aria-hidden="true">{c.icon}</span>
                  <div>
                    <p className="font-semibold text-surface-50">{c.name}</p>
                    <p className="text-xs text-surface-200/60">{c.duration_days} days · {c.xp_reward} XP</p>
                  </div>
                </div>
                <p className="text-sm text-surface-200/70 mb-4">{c.description}</p>
                <Button
                  size="sm"
                  className="w-full"
                  variant={activeIds.has(c.id) ? 'secondary' : 'primary'}
                  disabled={activeIds.has(c.id)}
                  onClick={() => joinMutation.mutate(c.id)}
                  isLoading={joinMutation.isPending}
                >
                  {activeIds.has(c.id) ? 'Joined' : 'Join Challenge'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
