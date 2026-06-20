import { generateJSONResponse } from '../../shared/gemini';
import { supabase } from '../../config/database';
import { LifestyleProfile } from '../profile/profile.repository';

interface ScenarioResult {
  co2_reduction_kg: number;
  money_saved: number;
  annual_impact: string;
  health_benefits: string[];
  recommendation: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

interface CoachAdvice {
  title: string;
  advice: string;
  impact: string;
  category: string;
}

export class AIService {
  private async getUserProfile(userId: string): Promise<LifestyleProfile | null> {
    const { data } = await supabase
      .from('lifestyle_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data as LifestyleProfile | null;
  }

  async analyzeScenario(userId: string, question: string): Promise<ScenarioResult> {
    const profile = await this.getUserProfile(userId);

    const prompt = `You are an environmental sustainability expert. A user asks: "${question}"

User's current lifestyle:
- Transport: ${profile?.transport_mode ?? 'car'}, ${profile?.transport_distance_km ?? 10}km daily
- Diet: ${profile?.diet_type ?? 'non-vegetarian'}
- AC usage: ${profile?.ac_hours_daily ?? 4} hours/day
- Electricity: ${profile?.electricity_kwh_monthly ?? 200} kWh/month
- Online orders: ${profile?.online_orders_monthly ?? 5}/month

Calculate the environmental impact of this lifestyle change. Return JSON with:
{
  "co2_reduction_kg": <monthly CO2 reduction in kg, number>,
  "money_saved": <monthly money saved in USD, number>,
  "annual_impact": "<description of yearly impact>",
  "health_benefits": ["<benefit 1>", "<benefit 2>", "<benefit 3>"],
  "recommendation": "<actionable advice>",
  "difficulty": "<easy|moderate|challenging>"
}`;

    try {
      const result = await generateJSONResponse<ScenarioResult>(prompt);

      // Save to DB
      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'scenario',
        prompt: question,
        response: result,
        co2_reduction_kg: result.co2_reduction_kg,
        money_saved: result.money_saved,
      });

      return result;
    } catch (error) {
      console.error('AI Generation Failed:', error);
      return {
        co2_reduction_kg: 5.0,
        money_saved: 10.0,
        annual_impact: "Reduce emissions by approx 60kg annually.",
        health_benefits: ["Improved air quality", "Better mental wellbeing"],
        recommendation: "Try implementing this change gradually over the next month.",
        difficulty: "moderate"
      };
    }
  }

  async getDailyAdvice(userId: string): Promise<CoachAdvice[]> {
    const profile = await this.getUserProfile(userId);

    const prompt = `You are a sustainability coach. Generate 3 personalized daily eco-tips.

User profile:
- Transport: ${profile?.transport_mode ?? 'car'}
- Diet: ${profile?.diet_type ?? 'non-vegetarian'}
- AC: ${profile?.ac_hours_daily ?? 4}h/day
- Plastic usage: ${profile?.plastic_usage ?? 'moderate'}

Return JSON array:
[{
  "title": "<short title>",
  "advice": "<2-3 sentence actionable advice>",
  "impact": "<estimated CO2 savings>",
  "category": "<transport|food|energy|waste>"
}]`;

    try {
      const result = await generateJSONResponse<CoachAdvice[]>(prompt);

      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'daily',
        prompt: 'Daily advice request',
        response: result,
      });

      return result;
    } catch (error) {
      console.error('AI Generation Failed:', error);
      return [
        { title: "Reduce Idle Time", advice: "Turn off your engine if parked for more than 1 minute.", impact: "Saves 1kg CO2/hr", category: "transport" },
        { title: "Meatless Monday", advice: "Swap one meat-based meal for a plant-based alternative today.", impact: "Saves 2.5kg CO2", category: "food" },
        { title: "Smart Cooling", advice: "Set your AC 1 degree higher to save significant energy.", impact: "Saves 0.5kg CO2", category: "energy" }
      ];
    }
  }

  async getWeeklyPlan(userId: string): Promise<unknown> {
    const profile = await this.getUserProfile(userId);

    const prompt = `Create a 7-day sustainability action plan for this user.

Profile:
- Transport: ${profile?.transport_mode ?? 'car'}, ${profile?.transport_distance_km ?? 10}km/day
- Diet: ${profile?.diet_type ?? 'non-vegetarian'}
- AC: ${profile?.ac_hours_daily ?? 4}h/day
- Electricity: ${profile?.electricity_kwh_monthly ?? 200} kWh/month

Return JSON:
{
  "total_potential_savings_kg": <number>,
  "days": [
    {
      "day": "Monday",
      "focus": "<category>",
      "action": "<specific action>",
      "impact_kg": <number>,
      "tip": "<motivational tip>"
    }
  ]
}`;

    try {
      const result = await generateJSONResponse(prompt);

      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'weekly',
        prompt: 'Weekly plan request',
        response: result,
      });

      return result;
    } catch (error) {
      console.error('AI Generation Failed:', error);
      return {
        total_potential_savings_kg: 10.5,
        days: [
          { day: "Monday", focus: "energy", action: "Turn off standby appliances", impact_kg: 1.5, tip: "Unplug chargers when not in use!" }
        ]
      };
    }
  }

  async getMonthlyPlan(userId: string): Promise<unknown> {
    const profile = await this.getUserProfile(userId);

    const prompt = `Create a 4-week progressive sustainability plan.

Profile:
- Transport: ${profile?.transport_mode ?? 'car'}, ${profile?.transport_distance_km ?? 10}km/day
- Diet: ${profile?.diet_type ?? 'non-vegetarian'}
- AC: ${profile?.ac_hours_daily ?? 4}h/day
- Electricity: ${profile?.electricity_kwh_monthly ?? 200} kWh/month
- Plastic: ${profile?.plastic_usage ?? 'moderate'}

Return JSON:
{
  "total_co2_savings_kg": <number>,
  "total_money_saved": <number>,
  "weeks": [
    {
      "week": 1,
      "theme": "<theme>",
      "goals": ["<goal 1>", "<goal 2>"],
      "expected_reduction_kg": <number>
    }
  ]
}`;

    try {
      const result = await generateJSONResponse(prompt);

      await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'monthly',
        prompt: 'Monthly plan request',
        response: result,
      });

      return result;
    } catch (error) {
      console.error('AI Generation Failed:', error);
      return {
        total_co2_savings_kg: 45,
        total_money_saved: 50,
        weeks: [
          { week: 1, theme: "Energy Awareness", goals: ["Audit home energy", "Switch to LED"], expected_reduction_kg: 10 }
        ]
      };
    }
  }
}
