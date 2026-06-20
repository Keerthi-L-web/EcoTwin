import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function AIEnginePage() {
  const [question, setQuestion] = useState('');

  const scenarioMutation = useMutation({
    mutationFn: (q: string) => api.post('/ai/scenario', { question: q }).then((r) => r.data),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim().length < 5) return;
    scenarioMutation.mutate(question);
  };

  const suggestions = [
    'What if I bike to work three days a week?',
    'What if I reduce AC usage to 2 hours daily?',
    'What if I switch to public transport?',
    'What if I go vegetarian for a month?',
    'What if I eliminate online shopping?',
    'What if I switch to renewable energy?',
  ];

  const result = scenarioMutation.data as {
    co2_reduction_kg: number;
    money_saved: number;
    annual_impact: string;
    health_benefits: string[];
    recommendation: string;
    difficulty: string;
  } | undefined;

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">AI Scenario Engine</h1>
        <p className="text-surface-200/70 mt-1">Ask &quot;what if&quot; questions and see the impact powered by Gemini AI</p>
      </section>

      <Card>
        <CardHeader><CardTitle>Ask a Scenario</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What if I bike to work three days a week?"
              className="flex-1"
              aria-label="Scenario question"
            />
            <Button type="submit" isLoading={scenarioMutation.isPending}>
              Analyze
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuestion(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-700/50 text-surface-200 hover:bg-eco-500/20 hover:text-eco-400 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          <Card hover>
            <div className="text-center">
              <span className="text-3xl" aria-hidden="true">🌿</span>
              <p className="text-sm text-surface-200/70 mt-2">CO₂ Reduction</p>
              <p className="text-2xl font-bold text-eco-400">{result.co2_reduction_kg} kg/month</p>
            </div>
          </Card>
          <Card hover>
            <div className="text-center">
              <span className="text-3xl" aria-hidden="true">💰</span>
              <p className="text-sm text-surface-200/70 mt-2">Money Saved</p>
              <p className="text-2xl font-bold text-accent-amber">${result.money_saved}/month</p>
            </div>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Annual Impact</CardTitle></CardHeader>
            <CardContent>
              <p className="text-surface-200">{result.annual_impact}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Health Benefits</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.health_benefits?.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-surface-200">
                    <span className="text-eco-400" aria-hidden="true">✓</span> {b}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommendation</CardTitle></CardHeader>
            <CardContent>
              <p className="text-surface-200">{result.recommendation}</p>
              <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full font-medium ${
                result.difficulty === 'easy' ? 'bg-eco-500/20 text-eco-400' :
                result.difficulty === 'moderate' ? 'bg-accent-amber/20 text-accent-amber' :
                'bg-accent-rose/20 text-accent-rose'
              }`}>
                {result.difficulty} difficulty
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
