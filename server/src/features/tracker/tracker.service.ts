import { TrackerRepository, CarbonActivity, EmissionsSummary } from './tracker.repository';
import { CreateActivityInput } from './tracker.schema';
import { calculateCO2, Category } from '../../shared/carbon';

export class TrackerService {
  private repository: TrackerRepository;

  constructor() {
    this.repository = new TrackerRepository();
  }

  async createActivity(userId: string, input: CreateActivityInput): Promise<CarbonActivity> {
    const co2_kg = calculateCO2(input.category as Category, input.activity_type, input.value);

    return this.repository.create({
      user_id: userId,
      category: input.category,
      activity_type: input.activity_type,
      value: input.value,
      unit: input.unit,
      co2_kg,
      date: input.date ?? new Date().toISOString().split('T')[0]!,
      notes: input.notes ?? null,
    });
  }

  async getActivities(userId: string, range: string): Promise<{ activities: CarbonActivity[]; summary: EmissionsSummary }> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]!;

    let startDate: string;
    const start = new Date(today);

    switch (range) {
      case 'day':
        startDate = todayStr;
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        startDate = start.toISOString().split('T')[0]!;
        break;
      default: // week
        start.setDate(start.getDate() - 7);
        startDate = start.toISOString().split('T')[0]!;
    }

    const activities = await this.repository.findByUserAndRange(userId, startDate, todayStr);
    const summary = await this.repository.getSummary(userId);

    return { activities, summary };
  }

  async getSummary(userId: string): Promise<EmissionsSummary> {
    return this.repository.getSummary(userId);
  }

  async deleteActivity(id: string, userId: string): Promise<void> {
    await this.repository.delete(id, userId);
  }

  async getDailyTotals(userId: string, days: number): Promise<Array<{ date: string; co2_kg: number }>> {
    return this.repository.getDailyTotals(userId, days);
  }
}
