import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatCO2, getGreeting } from '../../../lib/utils';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_COLORS, CATEGORIES } from '../../../lib/constants';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => api.get('/activities/summary').then((r) => r.data),
  });

  const { data: dailyData } = useQuery({
    queryKey: ['dailyTotals'],
    queryFn: () => api.get('/activities/daily-totals?days=30').then((r) => r.data),
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => api.get('/gamification/stats').then((r) => r.data),
  });

  const { data: twin } = useQuery({
    queryKey: ['twinComparison'],
    queryFn: () => api.get('/twin/comparison').then((r) => r.data),
  });

  const { data: challengesData } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: () => api.get('/challenges/active').then((r) => r.data),
  });

  const pieData = summary?.byCategory
    ? Object.entries(summary.byCategory as Record<string, number>).map(([key, value]) => ({
        name: CATEGORIES.find((c) => c.value === key)?.label ?? key,
        value: Math.round(value * 100) / 100,
      }))
    : [];

  const lineData = dailyData?.totals?.slice(-14) ?? [];

  const barData = [
    { name: 'Transport', value: (summary?.byCategory as Record<string, number>)?.transport ?? 0, fill: '#0ea5e9' },
    { name: 'Food', value: (summary?.byCategory as Record<string, number>)?.food ?? 0, fill: '#f59e0b' },
    { name: 'Energy', value: (summary?.byCategory as Record<string, number>)?.energy ?? 0, fill: '#f43f5e' },
    { name: 'Waste', value: (summary?.byCategory as Record<string, number>)?.waste ?? 0, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section aria-label="Welcome">
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-50">
          {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-200/70 mt-1">Here&apos;s your sustainability overview</p>
      </section>

      {/* Stats Cards */}
      <section aria-label="Emission statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <CardContent>
            <p className="text-sm text-surface-200/70">Today&apos;s Emissions</p>
            <p className="text-2xl font-bold text-eco-400 mt-1">{formatCO2(summary?.daily ?? 0)}</p>
            <p className="text-xs text-surface-200/50 mt-1">CO₂</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <p className="text-sm text-surface-200/70">Weekly Emissions</p>
            <p className="text-2xl font-bold text-accent-sky mt-1">{formatCO2(summary?.weekly ?? 0)}</p>
            <p className="text-xs text-surface-200/50 mt-1">CO₂</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <p className="text-sm text-surface-200/70">Monthly Emissions</p>
            <p className="text-2xl font-bold text-accent-amber mt-1">{formatCO2(summary?.monthly ?? 0)}</p>
            <p className="text-xs text-surface-200/50 mt-1">CO₂</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent>
            <p className="text-sm text-surface-200/70">Potential Reduction</p>
            <p className="text-2xl font-bold text-eco-300 mt-1">{twin?.potential_reduction ?? 0}%</p>
            <p className="text-xs text-surface-200/50 mt-1">with eco lifestyle</p>
          </CardContent>
        </Card>
      </section>

      {/* Gamification bar */}
      <section aria-label="Gamification" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="text-center">
          <span className="text-3xl" aria-hidden="true">⭐</span>
          <p className="text-xl font-bold text-eco-400 mt-2">Level {gamification?.level ?? 1}</p>
          <p className="text-sm text-surface-200/60">{gamification?.xp ?? 0} XP</p>
        </Card>
        <Card hover className="text-center">
          <span className="text-3xl" aria-hidden="true">🔥</span>
          <p className="text-xl font-bold text-accent-amber mt-2">{gamification?.streak_days ?? 0} Days</p>
          <p className="text-sm text-surface-200/60">Current Streak</p>
        </Card>
        <Card hover className="text-center">
          <span className="text-3xl" aria-hidden="true">🏆</span>
          <p className="text-xl font-bold text-accent-violet mt-2">{gamification?.badges?.length ?? 0}</p>
          <p className="text-sm text-surface-200/60">Badges Earned</p>
        </Card>
      </section>

      {/* Charts */}
      <section aria-label="Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-200/40">
                <p>Log activities to see your breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Emissions (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="co2_kg" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="CO₂ (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="CO₂ (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {(challengesData?.userChallenges ?? []).length > 0 ? (
              <ul className="space-y-3">
                {(challengesData?.userChallenges as Array<{ id: string; progress: number; status: string; challenge?: { name: string; icon: string } }>)?.slice(0, 4).map((uc) => (
                  <li key={uc.id} className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{uc.challenge?.icon ?? '🌿'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-50">{uc.challenge?.name}</p>
                      <div className="w-full bg-surface-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-eco-500 h-2 rounded-full transition-all"
                          style={{ width: `${uc.progress}%` }}
                          role="progressbar"
                          aria-valuenow={uc.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-eco-400 font-medium">{uc.progress}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-surface-200/40 text-center py-8">No active challenges. Start one!</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
