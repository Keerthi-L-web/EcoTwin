import { describe, it, expect } from 'vitest';
import { calculateCO2, calculateDailyFromProfile, getLevelFromXP, getXPForNextLevel, EMISSION_FACTORS } from '../shared/carbon';

describe('Carbon Calculations', () => {
  describe('calculateCO2', () => {
    it('should calculate car CO2 correctly', () => {
      const result = calculateCO2('transport', 'car', 10);
      expect(result).toBe(2.1); // 10km * 0.21
    });

    it('should return 0 for bike', () => {
      const result = calculateCO2('transport', 'bike', 100);
      expect(result).toBe(0);
    });

    it('should calculate food emissions', () => {
      const result = calculateCO2('food', 'meat_meal', 2);
      expect(result).toBe(6); // 2 meals * 3.0
    });

    it('should calculate energy emissions', () => {
      const result = calculateCO2('energy', 'electricity', 10);
      expect(result).toBe(4.75); // 10kWh * 0.475
    });

    it('should calculate waste emissions', () => {
      const result = calculateCO2('waste', 'online_order', 3);
      expect(result).toBe(1.5); // 3 * 0.5
    });

    it('should throw for unknown activity type', () => {
      expect(() => calculateCO2('transport', 'unknown_vehicle', 10)).toThrow('Unknown activity type');
    });
  });

  describe('calculateDailyFromProfile', () => {
    it('should calculate daily emissions from profile', () => {
      const profile = {
        transport_mode: 'car',
        transport_distance_km: 20,
        diet_type: 'non-vegetarian',
        ac_hours_daily: 4,
        electricity_kwh_monthly: 300,
        online_orders_monthly: 10,
      };

      const result = calculateDailyFromProfile(profile);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should return lower emissions for eco lifestyle', () => {
      const normalProfile = {
        transport_mode: 'car',
        transport_distance_km: 20,
        diet_type: 'non-vegetarian',
        ac_hours_daily: 8,
        electricity_kwh_monthly: 300,
        online_orders_monthly: 10,
      };

      const ecoProfile = {
        transport_mode: 'bike',
        transport_distance_km: 20,
        diet_type: 'vegan',
        ac_hours_daily: 1,
        electricity_kwh_monthly: 100,
        online_orders_monthly: 0,
      };

      const normalResult = calculateDailyFromProfile(normalProfile);
      const ecoResult = calculateDailyFromProfile(ecoProfile);

      expect(ecoResult).toBeLessThan(normalResult);
    });
  });

  describe('Gamification helpers', () => {
    it('should calculate level from XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
      expect(getLevelFromXP(199)).toBe(1);
      expect(getLevelFromXP(200)).toBe(2);
      expect(getLevelFromXP(1000)).toBe(6);
    });

    it('should calculate XP for next level', () => {
      expect(getXPForNextLevel(1)).toBe(200);
      expect(getXPForNextLevel(5)).toBe(1000);
    });
  });

  describe('EMISSION_FACTORS', () => {
    it('should have all transport types', () => {
      expect(EMISSION_FACTORS.transport.car).toBeDefined();
      expect(EMISSION_FACTORS.transport.bike).toBe(0);
      expect(EMISSION_FACTORS.transport.bus).toBeDefined();
      expect(EMISSION_FACTORS.transport.metro).toBeDefined();
      expect(EMISSION_FACTORS.transport.walking).toBe(0);
    });

    it('should have all food types', () => {
      expect(EMISSION_FACTORS.food.meat_meal).toBeGreaterThan(0);
      expect(EMISSION_FACTORS.food.vegan_meal).toBeLessThan(EMISSION_FACTORS.food.meat_meal);
    });
  });
});
