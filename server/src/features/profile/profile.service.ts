import { ProfileRepository, LifestyleProfile } from './profile.repository';
import { NotFoundError } from '../../shared/errors';
import { ProfileUpdateInput } from './profile.schema';

export class ProfileService {
  private repository: ProfileRepository;

  constructor() {
    this.repository = new ProfileRepository();
  }

  async getProfile(userId: string): Promise<LifestyleProfile> {
    const profile = await this.repository.findByUserId(userId);
    if (!profile) throw new NotFoundError('Lifestyle profile');
    return profile;
  }

  async updateProfile(userId: string, updates: ProfileUpdateInput): Promise<LifestyleProfile> {
    return this.repository.update(userId, updates);
  }
}
