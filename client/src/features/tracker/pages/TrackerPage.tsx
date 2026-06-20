import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { CATEGORIES, ACTIVITY_TYPES } from '../../../lib/constants';
import { formatCO2, formatDate } from '../../../lib/utils';

export default function TrackerPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('transport');
  const [activityType, setActivityType] = useState('car');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]!);

  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'week'],
    queryFn: () => api.get('/activities?range=week').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/activities', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['dailyTotals'] });
      setValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/activities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const types = ACTIVITY_TYPES[category];
    const unit = types?.find((t) => t.value === activityType)?.unit ?? 'units';

    createMutation.mutate({
      category,
      activity_type: activityType,
      value: parseFloat(value),
      unit,
      date,
    });
  };

  const activities = data?.activities ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      <section aria-label="Page header">
        <h1 className="text-2xl font-bold text-surface-50">Carbon Tracker</h1>
        <p className="text-surface-200/70 mt-1">Log your daily activities and track emissions</p>
      </section>

      {/* Log Activity Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                const types = ACTIVITY_TYPES[e.target.value];
                if (types?.[0]) setActivityType(types[0].value);
              }}
              options={CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            />
            <Select
              label="Activity"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              options={ACTIVITY_TYPES[category]?.map((t) => ({ value: t.value, label: t.label })) ?? []}
            />
            <Input
              label={`Value (${ACTIVITY_TYPES[category]?.find((t) => t.value === activityType)?.unit ?? 'units'})`}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 15"
              min="0"
              step="0.1"
              required
            />
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button type="submit" isLoading={createMutation.isPending}>
              Log Activity
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <section aria-label="Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover>
          <p className="text-sm text-surface-200/70">Daily</p>
          <p className="text-2xl font-bold text-eco-400">{formatCO2(data?.summary?.daily ?? 0)}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-surface-200/70">Weekly</p>
          <p className="text-2xl font-bold text-accent-sky">{formatCO2(data?.summary?.weekly ?? 0)}</p>
        </Card>
        <Card hover>
          <p className="text-sm text-surface-200/70">Monthly</p>
          <p className="text-2xl font-bold text-accent-amber">{formatCO2(data?.summary?.monthly ?? 0)}</p>
        </Card>
      </section>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-surface-200/40">Loading...</p>
          ) : activities.length === 0 ? (
            <p className="text-center py-8 text-surface-200/40">No activities logged yet. Start tracking!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-surface-700/50">
                    <th className="text-left py-3 px-2 text-surface-200/70 font-medium" scope="col">Date</th>
                    <th className="text-left py-3 px-2 text-surface-200/70 font-medium" scope="col">Category</th>
                    <th className="text-left py-3 px-2 text-surface-200/70 font-medium" scope="col">Activity</th>
                    <th className="text-right py-3 px-2 text-surface-200/70 font-medium" scope="col">Value</th>
                    <th className="text-right py-3 px-2 text-surface-200/70 font-medium" scope="col">CO₂</th>
                    <th className="text-right py-3 px-2 text-surface-200/70 font-medium" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activities as Array<{ id: string; date: string; category: string; activity_type: string; value: number; unit: string; co2_kg: number }>).map((a) => (
                    <tr key={a.id} className="border-b border-surface-700/30 hover:bg-surface-700/20">
                      <td className="py-3 px-2">{formatDate(a.date)}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1.5">
                          {CATEGORIES.find((c) => c.value === a.category)?.icon}
                          {CATEGORIES.find((c) => c.value === a.category)?.label}
                        </span>
                      </td>
                      <td className="py-3 px-2">{a.activity_type.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-2 text-right">{a.value} {a.unit}</td>
                      <td className="py-3 px-2 text-right font-medium text-eco-400">{formatCO2(a.co2_kg)}</td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => deleteMutation.mutate(a.id)}
                          className="text-accent-rose/60 hover:text-accent-rose text-xs"
                          aria-label={`Delete ${a.activity_type} activity`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
