import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then((r) => r.data),
  });

  const [form, setForm] = useState({
    transport_mode: 'car',
    transport_distance_km: '10',
    diet_type: 'non-vegetarian',
    ac_hours_daily: '4',
    electricity_kwh_monthly: '200',
    water_liters_daily: '150',
    plastic_usage: 'moderate',
    online_orders_monthly: '5',
  });

  useEffect(() => {
    if (data?.profile) {
      const p = data.profile;
      setForm({
        transport_mode: p.transport_mode,
        transport_distance_km: String(p.transport_distance_km),
        diet_type: p.diet_type,
        ac_hours_daily: String(p.ac_hours_daily),
        electricity_kwh_monthly: String(p.electricity_kwh_monthly),
        water_liters_daily: String(p.water_liters_daily),
        plastic_usage: p.plastic_usage,
        online_orders_monthly: String(p.online_orders_monthly),
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.put('/profile', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['twinComparison'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      transport_mode: form.transport_mode,
      transport_distance_km: parseFloat(form.transport_distance_km),
      diet_type: form.diet_type,
      ac_hours_daily: parseFloat(form.ac_hours_daily),
      electricity_kwh_monthly: parseFloat(form.electricity_kwh_monthly),
      water_liters_daily: parseFloat(form.water_liters_daily),
      plastic_usage: form.plastic_usage,
      online_orders_monthly: parseInt(form.online_orders_monthly),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <section>
        <h1 className="text-2xl font-bold text-surface-50">Lifestyle Profile</h1>
        <p className="text-surface-200/70 mt-1">Tell us about your lifestyle so we can calculate your carbon footprint</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transportation */}
        <Card>
          <CardHeader><CardTitle>🚗 Transportation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Transport"
              value={form.transport_mode}
              onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}
              options={[
                { value: 'car', label: 'Car' },
                { value: 'bike', label: 'Bike' },
                { value: 'bus', label: 'Bus' },
                { value: 'metro', label: 'Metro' },
                { value: 'walking', label: 'Walking' },
              ]}
            />
            <Input
              label="Daily Distance (km)"
              type="number"
              value={form.transport_distance_km}
              onChange={(e) => setForm({ ...form, transport_distance_km: e.target.value })}
              min="0"
              step="0.5"
            />
          </CardContent>
        </Card>

        {/* Food */}
        <Card>
          <CardHeader><CardTitle>🍽️ Food</CardTitle></CardHeader>
          <CardContent>
            <Select
              label="Diet Type"
              value={form.diet_type}
              onChange={(e) => setForm({ ...form, diet_type: e.target.value })}
              options={[
                { value: 'non-vegetarian', label: 'Non-Vegetarian' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Home */}
        <Card>
          <CardHeader><CardTitle>🏠 Home</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="AC Hours/Day"
              type="number"
              value={form.ac_hours_daily}
              onChange={(e) => setForm({ ...form, ac_hours_daily: e.target.value })}
              min="0"
              max="24"
              step="0.5"
            />
            <Input
              label="Electricity (kWh/month)"
              type="number"
              value={form.electricity_kwh_monthly}
              onChange={(e) => setForm({ ...form, electricity_kwh_monthly: e.target.value })}
              min="0"
            />
            <Input
              label="Water (liters/day)"
              type="number"
              value={form.water_liters_daily}
              onChange={(e) => setForm({ ...form, water_liters_daily: e.target.value })}
              min="0"
            />
          </CardContent>
        </Card>

        {/* Shopping */}
        <Card>
          <CardHeader><CardTitle>🛒 Shopping</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Plastic Usage"
              value={form.plastic_usage}
              onChange={(e) => setForm({ ...form, plastic_usage: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'high', label: 'High' },
              ]}
            />
            <Input
              label="Online Orders/Month"
              type="number"
              value={form.online_orders_monthly}
              onChange={(e) => setForm({ ...form, online_orders_monthly: e.target.value })}
              min="0"
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" isLoading={updateMutation.isPending}>
          Save Profile
        </Button>

        {updateMutation.isSuccess && (
          <p className="text-eco-400 text-sm" role="alert">✓ Profile updated successfully!</p>
        )}
      </form>
    </div>
  );
}
