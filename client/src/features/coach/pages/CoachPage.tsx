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

      {planType === 'weekly' && data?.plan && (
        <div className="space-y-4 animate-slide-up">
          <Card>
            <CardHeader><CardTitle>Your 7-Day Action Plan</CardTitle></CardHeader>
            <CardContent>
              <p className="text-surface-200 mb-4">Potential Savings: <span className="text-eco-400 font-bold">{data.plan.total_potential_savings_kg} kg CO₂</span></p>
              <div className="space-y-3">
                {data.plan.days?.map((day: any, i: number) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-surface-800 border border-surface-700">
                    <div className="font-bold text-eco-400 min-w-[100px]">{day.day}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-surface-50">{day.action}</p>
                      <p className="text-sm text-surface-200/70 mt-1">{day.tip}</p>
                    </div>
                    <div className="text-sm text-accent-amber font-semibold whitespace-nowrap">
                      ↓ {day.impact_kg} kg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {planType === 'monthly' && data?.plan && (
        <div className="space-y-4 animate-slide-up">
          <Card>
            <CardHeader><CardTitle>4-Week Progressive Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-sm text-surface-200/70">Total Savings</p>
                  <p className="text-2xl font-bold text-eco-400">{data.plan.total_co2_savings_kg} kg CO₂</p>
                </div>
                <div>
                  <p className="text-sm text-surface-200/70">Money Saved</p>
                  <p className="text-2xl font-bold text-accent-amber">${data.plan.total_money_saved}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.plan.weeks?.map((week: any, i: number) => (
                  <Card key={i} className="bg-surface-800 border-surface-700">
                    <CardHeader><CardTitle className="text-base text-eco-300">Week {week.week}: {week.theme}</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-3">
                        {week.goals?.map((goal: string, j: number) => (
                          <li key={j} className="flex gap-2 text-sm text-surface-200">
                            <span className="text-eco-400">✓</span> {goal}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-surface-200/60 font-semibold border-t border-surface-700 pt-2 mt-2">
                        Expected: ↓ {week.expected_reduction_kg} kg
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
