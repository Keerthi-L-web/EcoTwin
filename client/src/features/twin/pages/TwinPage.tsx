import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatCO2 } from '../../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';

const SCENARIOS = [
  { label: 'Bike instead of car', changes: [{ type: 'transport_mode', to: 'bike' }] },
  { label: 'Public transport commute', changes: [{ type: 'transport_mode', to: 'metro' }] },
  { label: 'Go vegetarian', changes: [{ type: 'diet_type', to: 'vegetarian' }] },
  { label: 'Go vegan', changes: [{ type: 'diet_type', to: 'vegan' }] },
  { label: 'Reduce AC to 2h/day', changes: [{ type: 'ac_hours', value: 2 }] },
  { label: 'Halve electricity usage', changes: [{ type: 'electricity', value: 100 }] },
  { label: 'Zero online orders', changes: [{ type: 'online_orders', value: 0 }] },
];

export default function TwinPage() {
  const queryClient = useQueryClient();
  const [selectedScenario, setSelectedScenario] = useState(0);

  const { data: comparison } = useQuery({
    queryKey: ['twinComparison'],
    queryFn: () => api.get('/twin/comparison').then((r) => r.data),
  });

  const simulateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/twin/simulate', body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twinHistory'] });
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['twinHistory'],
    queryFn: () => api.get('/twin/history').then((r) => r.data),
  });

  const comparisonData = comparison ? [
    { name: 'Daily', current: comparison.currentYou?.daily ?? 0, eco: comparison.ecoYou?.daily ?? 0 },
    { name: 'Weekly', current: comparison.currentYou?.weekly ?? 0, eco: comparison.ecoYou?.weekly ?? 0 },
    { name: 'Monthly', current: comparison.currentYou?.monthly ?? 0, eco: comparison.ecoYou?.monthly ?? 0 },
  ] : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">Future Carbon Twin</h1>
        <p className="text-surface-200/70 mt-1">Compare your current self with your future eco self</p>
      </section>

      {/* Current vs Eco comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-accent-rose/20">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🧑</span>
            <h2 className="text-xl font-bold text-surface-50 mt-2">Current You</h2>
            <p className="text-3xl font-bold text-accent-rose mt-4">{formatCO2(comparison?.currentYou?.monthly ?? 0)}</p>
            <p className="text-sm text-surface-200/60">per month</p>
            <p className="text-lg font-semibold text-surface-200 mt-2">{formatCO2(comparison?.currentYou?.yearly ?? 0)}/year</p>
          </div>
        </Card>

        <Card className="border-eco-500/20" glow>
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🌱</span>
            <h2 className="text-xl font-bold text-surface-50 mt-2">Future Eco You</h2>
            <p className="text-3xl font-bold text-eco-400 mt-4">{formatCO2(comparison?.ecoYou?.monthly ?? 0)}</p>
            <p className="text-sm text-surface-200/60">per month</p>
            <p className="text-lg font-semibold text-eco-300 mt-2">↓ {comparison?.potential_reduction ?? 0}% reduction</p>
          </div>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader><CardTitle>Current vs Eco Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }} />
              <Legend />
              <Bar dataKey="current" fill="#f43f5e" name="Current You" radius={[4, 4, 0, 0]} />
              <Bar dataKey="eco" fill="#10b981" name="Eco You" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Simulations */}
      <Card>
        <CardHeader><CardTitle>Quick Simulations</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedScenario(i)}
                className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${
                  selectedScenario === i
                    ? 'bg-eco-500/20 border border-eco-500/40 text-eco-400'
                    : 'bg-surface-700/40 border border-surface-700/50 text-surface-200 hover:bg-surface-700/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              const scenario = SCENARIOS[selectedScenario];
              if (scenario) {
                simulateMutation.mutate({
                  changes: scenario.changes,
                  scenario_name: scenario.label,
                });
              }
            }}
            isLoading={simulateMutation.isPending}
          >
            Run Simulation
          </Button>

          {simulateMutation.data && (
            <div className="mt-6 p-4 rounded-xl bg-eco-500/10 border border-eco-500/20" role="alert">
              <p className="font-semibold text-eco-400">Simulation Result</p>
              <p className="text-surface-200 mt-2">
                Current: <span className="font-bold">{formatCO2(simulateMutation.data.current_co2_kg)}/month</span> →
                Predicted: <span className="font-bold text-eco-400">{formatCO2(simulateMutation.data.predicted_co2_kg)}/month</span>
              </p>
              <p className="text-eco-300 font-semibold mt-1">
                ↓ {simulateMutation.data.reduction_percent}% reduction
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle>Simulation History</CardTitle></CardHeader>
        <CardContent>
          {(historyData?.simulations ?? []).length === 0 ? (
            <p className="text-center py-6 text-surface-200/40">No simulations yet</p>
          ) : (
            <ul className="space-y-3">
              {(historyData?.simulations as Array<{ id: string; scenario_name: string; current_co2_kg: number; predicted_co2_kg: number; reduction_percent: number }>)?.map((sim) => (
                <li key={sim.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-700/30">
                  <span className="text-sm font-medium">{sim.scenario_name}</span>
                  <span className="text-sm text-eco-400 font-semibold">↓ {sim.reduction_percent}%</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
