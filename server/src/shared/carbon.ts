/**
 * Carbon emission factors (kg CO2 per unit)
 * Sources: EPA, IPCC, various environmental agencies
 */
export const EMISSION_FACTORS = {
  transport: {
    car: 0.21,           // kg CO2 per km
    bike: 0.0,           // kg CO2 per km
    bus: 0.089,          // kg CO2 per km
    metro: 0.041,        // kg CO2 per km
    walking: 0.0,        // kg CO2 per km
    train: 0.041,        // kg CO2 per km
    flight_domestic: 0.255, // kg CO2 per km
    flight_international: 0.195, // kg CO2 per km
  },
  food: {
    meat_meal: 3.0,      // kg CO2 per meal
    vegetarian_meal: 1.0, // kg CO2 per meal
    vegan_meal: 0.7,     // kg CO2 per meal
    dairy: 1.5,          // kg CO2 per serving
    coffee: 0.21,        // kg CO2 per cup
  },
  energy: {
    electricity: 0.475,  // kg CO2 per kWh
    natural_gas: 2.0,    // kg CO2 per cubic meter
    ac_hour: 1.5,        // kg CO2 per hour
    heating_hour: 1.8,   // kg CO2 per hour
  },
  waste: {
    general_waste: 0.5,  // kg CO2 per kg waste
    recycled: 0.1,       // kg CO2 per kg recycled
    plastic_bag: 0.033,  // kg CO2 per bag
    online_order: 0.5,   // kg CO2 per delivery
  },
} as const;

export type TransportType = keyof typeof EMISSION_FACTORS.transport;
export type FoodType = keyof typeof EMISSION_FACTORS.food;
export type EnergyType = keyof typeof EMISSION_FACTORS.energy;
export type WasteType = keyof typeof EMISSION_FACTORS.waste;
export type Category = 'transport' | 'food' | 'energy' | 'waste';

/**
 * Calculate CO2 emissions for an activity
 */
export function calculateCO2(category: Category, activityType: string, value: number): number {
  const factors = EMISSION_FACTORS[category] as Record<string, number>;
  const factor = factors[activityType];

  if (factor === undefined) {
    throw new Error(`Unknown activity type: ${category}/${activityType}`);
  }

  return Math.round(value * factor * 10000) / 10000;
}

/**
 * Calculate daily emissions from lifestyle profile
 */
export function calculateDailyFromProfile(profile: {
  transport_mode: string;
  transport_distance_km: number;
  diet_type: string;
  ac_hours_daily: number;
  electricity_kwh_monthly: number;
  online_orders_monthly: number;
}): number {
  const transportFactors = EMISSION_FACTORS.transport as Record<string, number>;
  const transportFactor = transportFactors[profile.transport_mode] ?? 0.21;
  const transportCO2 = profile.transport_distance_km * transportFactor;

  const dietFactors: Record<string, number> = {
    'non-vegetarian': 3.0,
    'vegetarian': 1.0,
    'vegan': 0.7,
  };
  const foodCO2 = (dietFactors[profile.diet_type] ?? 3.0) * 3; // 3 meals

  const energyCO2 = (profile.electricity_kwh_monthly / 30) * EMISSION_FACTORS.energy.electricity
    + profile.ac_hours_daily * EMISSION_FACTORS.energy.ac_hour;

  const wasteCO2 = (profile.online_orders_monthly / 30) * EMISSION_FACTORS.waste.online_order;

  return Math.round((transportCO2 + foodCO2 + energyCO2 + wasteCO2) * 100) / 100;
}

/**
 * Get level from XP
 */
export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * 200;
}
