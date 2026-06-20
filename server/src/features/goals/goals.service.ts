import { GoalsRepository } from './goals.repository';
import { Goal } from './goals.types';
import { CreateGoalInput, UpdateGoalInput } from './goals.schema';

export class GoalsService {
  private repository: GoalsRepository;

  constructor() {
    this.repository = new GoalsRepository();
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return this.repository.findByUserId(userId);
  }

  async createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
    return this.repository.create(userId, input);
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput): Promise<Goal> {
    return this.repository.update(id, userId, input);
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    return this.repository.delete(id, userId);
  }
}
