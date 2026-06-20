import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Leaf, Target, Calendar, Plus, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target_co2_kg: number;
  deadline: string;
  status: 'in_progress' | 'completed' | 'failed';
}

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [targetCo2, setTargetCo2] = useState('');
  const [deadline, setDeadline] = useState('');

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data.goals;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newGoal: Partial<Goal>) => {
      await api.post('/goals', newGoal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setTitle('');
      setTargetCo2('');
      setDeadline('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Goal['status'] }) => {
      await api.put(`/goals/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetCo2 || !deadline) return;
    createMutation.mutate({
      title,
      target_co2_kg: Number(targetCo2),
      deadline,
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          Your Sustainability Goals
        </h1>
        <p className="text-slate-400 mt-2">Set and track long-term carbon reduction targets.</p>
      </header>

      <Card className="p-6 border-emerald-500/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          Create New Goal
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <Input
              label="Goal Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Go Vegan"
              required
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Target CO2 (kg)"
              type="number"
              value={targetCo2}
              onChange={(e) => setTargetCo2(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-1">
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-1">
            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              disabled={createMutation.isPending}
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-slate-400">Loading goals...</p>
        ) : goals.length === 0 ? (
          <p className="text-slate-400 col-span-2 text-center py-10">No goals found. Create one above!</p>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    goal.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    goal.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {goal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" /> Target: {goal.target_co2_kg} kg CO₂
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="flex gap-2">
                  {goal.status === 'in_progress' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: goal.id, status: 'completed' })}
                        disabled={updateMutation.isPending}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: goal.id, status: 'failed' })}
                        disabled={updateMutation.isPending}
                      >
                        Fail
                      </Button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(goal.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  aria-label="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
