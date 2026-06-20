import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useState } from 'react';

export default function CoachPage() {
  const [planType, setPlanType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['coach', planType],
    queryFn: () => api.get(`/ai/coach/${planType}`).then((r) => r.data),
    enabled: false,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">AI Sustainability Coach</h1>
        <p className="text-surface-200/70 mt-1">Get personalized advice from your AI coach</p>
      </section>

      <div className="flex gap-3">
        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
          <Button
            key={type}
            variant={planType === type ? 'primary' : 'secondary'}
            onClick={() => setPlanType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
        <Button onClick={() => refetch()} isLoading={isLoading} variant="outline">
          🤖 Generate Advice
        </Button>
      </div>

      {planType === 'daily' && data?.recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          {(data.recommendations as Array<{ title: string; advice: string; impact: string; category: string }>).map((rec, i) => (
            <Card key={i} hover>
              <CardHeader><CardTitle>{rec.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-surface-200 text-sm">{rec.advice}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-eco-500/15 text-eco-400">{rec.category}</span>
                  <span className="text-xs text-surface-200/60">{rec.impact}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(planType === 'weekly' || planType === 'monthly') && data?.plan && (
        <Card className="animate-slide-up">
          <CardHeader><CardTitle>{planType === 'weekly' ? '7-Day' : '4-Week'} Plan</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-sm text-surface-200 whitespace-pre-wrap bg-surface-900 rounded-xl p-4 overflow-auto max-h-96">
              {JSON.stringify(data.plan, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {!data && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <span className="text-5xl block mb-4" aria-hidden="true">🧘</span>
            <p className="text-surface-200/60">Select a plan type and click Generate to get AI-powered advice</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
