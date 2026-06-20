import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { formatCO2, formatShortDate } from '../../../lib/utils';

export default function ForecastPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['forecast', period],
    queryFn: () => api.get(`/forecast?period=${period}`).then((r) => r.data),
  });

  const forecast = data?.forecast;

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">Forecast Engine</h1>
        <p className="text-surface-200/70 mt-1">Predict your future carbon emissions</p>
      </section>

      <div className="flex gap-3">
        {(['week', 'month', 'year'] as const).map((p) => (
          <Button key={p} variant={period === p ? 'primary' : 'secondary'} onClick={() => { setPeriod(p); }}>
            {p === 'week' ? 'Next Week' : p === 'month' ? 'Next Month' : 'End of Year'}
          </Button>
        ))}
        <Button onClick={() => refetch()} isLoading={isLoading} variant="outline">Refresh</Button>
      </div>

      {forecast && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card hover>
              <p className="text-sm text-surface-200/70">Predicted Total</p>
              <p className="text-2xl font-bold text-eco-400">{formatCO2(forecast.predicted_co2_kg)}</p>
              <p className="text-xs text-surface-200/50">{period}</p>
            </Card>
            <Card hover>
              <p className="text-sm text-surface-200/70">Average Daily</p>
              <p className="text-2xl font-bold text-accent-sky">{formatCO2(forecast.current_avg_daily)}</p>
            </Card>
            <Card hover>
              <p className="text-sm text-surface-200/70">Trend</p>
              <p className={`text-2xl font-bold ${
                forecast.trend === 'decreasing' ? 'text-eco-400' :
                forecast.trend === 'increasing' ? 'text-accent-rose' : 'text-accent-amber'
              }`}>
                {forecast.trend === 'decreasing' ? '↓ Decreasing' :
                 forecast.trend === 'increasing' ? '↑ Increasing' : '→ Stable'}
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Forecast Chart</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecast.data_points?.slice(0, 30) ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: string) => formatShortDate(v)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                  <Line type="monotone" dataKey="co2_kg" stroke="#10b981" strokeWidth={2} dot={false} name="Predicted CO₂ (kg)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
