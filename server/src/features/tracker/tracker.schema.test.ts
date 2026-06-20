import { describe, it, expect } from 'vitest';
import { createActivitySchema } from '../features/tracker/tracker.schema';
import { profileUpdateSchema } from '../features/profile/profile.schema';
import { simulateSchema } from '../features/twin/twin.schema';
import { scenarioSchema } from '../features/ai/ai.schema';

describe('Tracker Schema', () => {
  it('should accept valid activity', () => {
    const result = createActivitySchema.safeParse({
      category: 'transport',
      activity_type: 'car',
      value: 15,
      unit: 'km',
      date: '2024-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid category', () => {
    const result = createActivitySchema.safeParse({
      category: 'invalid',
      activity_type: 'car',
      value: 15,
      unit: 'km',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative value', () => {
    const result = createActivitySchema.safeParse({
      category: 'transport',
      activity_type: 'car',
      value: -5,
      unit: 'km',
    });
    expect(result.success).toBe(false);
  });
});

describe('Profile Schema', () => {
  it('should accept valid profile update', () => {
    const result = profileUpdateSchema.safeParse({
      transport_mode: 'bike',
      diet_type: 'vegan',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid transport mode', () => {
    const result = profileUpdateSchema.safeParse({
      transport_mode: 'helicopter',
    });
    expect(result.success).toBe(false);
  });
});

describe('Twin Schema', () => {
  it('should accept valid simulation', () => {
    const result = simulateSchema.safeParse({
      changes: [{ type: 'transport_mode', to: 'bike' }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty changes', () => {
    const result = simulateSchema.safeParse({
      changes: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('AI Schema', () => {
  it('should accept valid scenario', () => {
    const result = scenarioSchema.safeParse({
      question: 'What if I ride a bike to work?',
    });
    expect(result.success).toBe(true);
  });

  it('should reject too short question', () => {
    const result = scenarioSchema.safeParse({
      question: 'Hi',
    });
    expect(result.success).toBe(false);
  });
});
