import { supabase } from '../../config/database';
import { TrackerRepository } from '../tracker/tracker.repository';
import { calculateDailyFromProfile } from '../../shared/carbon';

export class ForecastService {
  private trackerRepo: TrackerRepository;

  constructor() {
    this.trackerRepo = new TrackerRepository();
  }

  async getForecast(userId: string, period: string): Promise<{
    predicted_co2_kg: number;
    trend: string;
    data_points: Array<{ date: string; co2_kg: number }>;
    current_avg_daily: number;
  }> {
    // Get historical data
    const dailyTotals = await this.trackerRepo.getDailyTotals(userId, 30);

    const activeDays = dailyTotals.filter((d) => d.co2_kg > 0);
    const avgDaily = activeDays.length > 0
      ? activeDays.reduce((sum, d) => sum + d.co2_kg, 0) / activeDays.length
      : 0;

    // If no activity data, use profile for estimation
    let baseDaily = avgDaily;
    if (baseDaily === 0) {
      const { data: profile } = await supabase
        .from('lifestyle_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        baseDaily = calculateDailyFromProfile(profile);
      }
    }

    // Calculate trend from recent data
    const recentWeek = dailyTotals.slice(-7);
    const previousWeek = dailyTotals.slice(-14, -7);

    const recentAvg = recentWeek.length > 0
      ? recentWeek.reduce((s, d) => s + d.co2_kg, 0) / recentWeek.length
      : baseDaily;
    const previousAvg = previousWeek.length > 0
      ? previousWeek.reduce((s, d) => s + d.co2_kg, 0) / previousWeek.length
      : baseDaily;

    let trend = 'stable';
    if (recentAvg < previousAvg * 0.95) trend = 'decreasing';
    else if (recentAvg > previousAvg * 1.05) trend = 'increasing';

    // Generate forecast data points
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const trendFactor = trend === 'decreasing' ? -0.002 : trend === 'increasing' ? 0.001 : 0;

    const dataPoints: Array<{ date: string; co2_kg: number }> = [];
    const today = new Date();

    for (let i = 1; i <= Math.min(days, 90); i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + i);
      const predicted = Math.max(0, baseDaily * (1 + trendFactor * i));
      dataPoints.push({
        date: futureDate.toISOString().split('T')[0]!,
        co2_kg: Math.round(predicted * 100) / 100,
      });
    }

    const totalPredicted = Math.round(baseDaily * days * 100) / 100;

    // Save forecast
    await supabase.from('forecasts').insert({
      user_id: userId,
      period,
      predicted_co2_kg: totalPredicted,
      trend,
      data_points: dataPoints,
    });

    return {
      predicted_co2_kg: totalPredicted,
      trend,
      data_points: dataPoints,
      current_avg_daily: Math.round(baseDaily * 100) / 100,
    };
  }
}
