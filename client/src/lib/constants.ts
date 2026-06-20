export const APP_NAME = 'EcoTwin AI';

export const CATEGORIES = [
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#0ea5e9' },
  { value: 'food', label: 'Food', icon: '🍽️', color: '#f59e0b' },
  { value: 'energy', label: 'Energy', icon: '⚡', color: '#f43f5e' },
  { value: 'waste', label: 'Waste', icon: '♻️', color: '#8b5cf6' },
] as const;

export const ACTIVITY_TYPES: Record<string, Array<{ value: string; label: string; unit: string }>> = {
  transport: [
    { value: 'car', label: 'Car', unit: 'km' },
    { value: 'bike', label: 'Bike', unit: 'km' },
    { value: 'bus', label: 'Bus', unit: 'km' },
    { value: 'metro', label: 'Metro', unit: 'km' },
    { value: 'walking', label: 'Walking', unit: 'km' },
    { value: 'train', label: 'Train', unit: 'km' },
    { value: 'flight_domestic', label: 'Domestic Flight', unit: 'km' },
  ],
  food: [
    { value: 'meat_meal', label: 'Meat Meal', unit: 'meals' },
    { value: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'meals' },
    { value: 'vegan_meal', label: 'Vegan Meal', unit: 'meals' },
    { value: 'dairy', label: 'Dairy', unit: 'servings' },
    { value: 'coffee', label: 'Coffee', unit: 'cups' },
  ],
  energy: [
    { value: 'electricity', label: 'Electricity', unit: 'kWh' },
    { value: 'ac_hour', label: 'AC Usage', unit: 'hours' },
    { value: 'natural_gas', label: 'Natural Gas', unit: 'm³' },
    { value: 'heating_hour', label: 'Heating', unit: 'hours' },
  ],
  waste: [
    { value: 'general_waste', label: 'General Waste', unit: 'kg' },
    { value: 'recycled', label: 'Recycled', unit: 'kg' },
    { value: 'plastic_bag', label: 'Plastic Bags', unit: 'bags' },
    { value: 'online_order', label: 'Online Order', unit: 'orders' },
  ],
};

export const CHART_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
