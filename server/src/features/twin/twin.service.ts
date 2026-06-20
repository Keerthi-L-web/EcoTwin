import { TwinRepository, TwinSimulation } from './twin.repository';
import { SimulateInput } from './twin.schema';
import { calculateDailyFromProfile } from '../../shared/carbon';
import { NotFoundError } from '../../shared/errors';

export class TwinService {
  private repository: TwinRepository;

  constructor() {
    this.repository = new TwinRepository();
  }

  async simulate(userId: string, input: SimulateInput): Promise<TwinSimulation> {
    const profile = await this.repository.getProfile(userId);
    if (!profile) throw new NotFoundError('Lifestyle profile');

    const currentDaily = calculateDailyFromProfile(profile);
    const currentMonthly = currentDaily * 30;

    // Apply changes to create predicted profile
    const modifiedProfile = { ...profile };

    for (const change of input.changes) {
      switch (change.type) {
        case 'transport_mode':
          if (change.to) modifiedProfile.transport_mode = change.to;
          break;
        case 'transport_distance':
          if (change.value !== undefined) modifiedProfile.transport_distance_km = change.value;
          break;
        case 'diet_type':
          if (change.to) modifiedProfile.diet_type = change.to;
          break;
        case 'ac_hours':
          if (change.value !== undefined) modifiedProfile.ac_hours_daily = change.value;
          break;
        case 'electricity':
          if (change.value !== undefined) modifiedProfile.electricity_kwh_monthly = change.value;
          break;
        case 'online_orders':
          if (change.value !== undefined) modifiedProfile.online_orders_monthly = change.value;
          break;
      }
    }

    const predictedDaily = calculateDailyFromProfile(modifiedProfile);
    const predictedMonthly = predictedDaily * 30;

    const reductionPercent = currentMonthly > 0
      ? Math.round(((currentMonthly - predictedMonthly) / currentMonthly) * 10000) / 100
      : 0;

    return this.repository.saveSimulation({
      user_id: userId,
      scenario_name: input.scenario_name ?? `Simulation ${new Date().toLocaleDateString()}`,
      current_co2_kg: Math.round(currentMonthly * 100) / 100,
      predicted_co2_kg: Math.round(predictedMonthly * 100) / 100,
      reduction_percent: reductionPercent,
      changes: input.changes,
    });
  }

  async getHistory(userId: string): Promise<TwinSimulation[]> {
    return this.repository.getHistory(userId);
  }

  async getComparison(userId: string): Promise<{
    currentYou: { daily: number; weekly: number; monthly: number; yearly: number };
    ecoYou: { daily: number; weekly: number; monthly: number; yearly: number };
    potential_reduction: number;
  }> {
    const profile = await this.repository.getProfile(userId);
    if (!profile) throw new NotFoundError('Lifestyle profile');

    const currentDaily = calculateDailyFromProfile(profile);

    // Ideal eco profile: bike, vegan, no AC, low electricity
    const ecoProfile = {
      transport_mode: 'bike',
      transport_distance_km: profile.transport_distance_km,
      diet_type: 'vegan',
      ac_hours_daily: 1,
      electricity_kwh_monthly: 100,
      online_orders_monthly: 1,
    };

    const ecoDaily = calculateDailyFromProfile(ecoProfile);

    return {
      currentYou: {
        daily: Math.round(currentDaily * 100) / 100,
        weekly: Math.round(currentDaily * 7 * 100) / 100,
        monthly: Math.round(currentDaily * 30 * 100) / 100,
        yearly: Math.round(currentDaily * 365 * 100) / 100,
      },
      ecoYou: {
        daily: Math.round(ecoDaily * 100) / 100,
        weekly: Math.round(ecoDaily * 7 * 100) / 100,
        monthly: Math.round(ecoDaily * 30 * 100) / 100,
        yearly: Math.round(ecoDaily * 365 * 100) / 100,
      },
      potential_reduction: Math.round(((currentDaily - ecoDaily) / currentDaily) * 10000) / 100,
    };
  }
}
