-- ============================================
-- EcoTwin AI — Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users & Authentication
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- Lifestyle Profiles (Module 2)
-- ============================================
CREATE TABLE lifestyle_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  transport_mode VARCHAR(20) DEFAULT 'car',
  transport_distance_km DECIMAL(8,2) DEFAULT 10,
  diet_type VARCHAR(20) DEFAULT 'non-vegetarian',
  ac_hours_daily DECIMAL(4,1) DEFAULT 4,
  electricity_kwh_monthly DECIMAL(8,2) DEFAULT 200,
  water_liters_daily DECIMAL(8,2) DEFAULT 150,
  plastic_usage VARCHAR(20) DEFAULT 'moderate',
  online_orders_monthly INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Carbon Activities (Module 3)
-- ============================================
CREATE TABLE carbon_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('transport', 'food', 'energy', 'waste')),
  activity_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  co2_kg DECIMAL(10,4) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_user_date ON carbon_activities(user_id, date DESC);
CREATE INDEX idx_activities_category ON carbon_activities(user_id, category);

-- ============================================
-- Twin Simulations (Module 4)
-- ============================================
CREATE TABLE twin_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_name VARCHAR(100) NOT NULL,
  current_co2_kg DECIMAL(10,2) NOT NULL,
  predicted_co2_kg DECIMAL(10,2) NOT NULL,
  reduction_percent DECIMAL(5,2) NOT NULL,
  changes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_twin_user ON twin_simulations(user_id, created_at DESC);

-- ============================================
-- AI Recommendations (Module 5 & 6)
-- ============================================
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('scenario', 'daily', 'weekly', 'monthly')),
  prompt TEXT NOT NULL,
  response JSONB NOT NULL DEFAULT '{}',
  co2_reduction_kg DECIMAL(10,2),
  money_saved DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON ai_recommendations(user_id, type, created_at DESC);

-- ============================================
-- Forecasts (Module 7)
-- ============================================
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL CHECK (period IN ('week', 'month', 'year')),
  predicted_co2_kg DECIMAL(10,2) NOT NULL,
  trend VARCHAR(20) NOT NULL CHECK (trend IN ('increasing', 'decreasing', 'stable')),
  data_points JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecasts_user ON forecasts(user_id, period, created_at DESC);

-- ============================================
-- Challenges (Module 8)
-- ============================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL,
  duration_days INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  badge_name VARCHAR(50),
  icon VARCHAR(10) DEFAULT '🌿',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, challenge_id)
);

-- ============================================
-- Gamification (Module 9)
-- ============================================
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL DEFAULT '🏆',
  category VARCHAR(30) NOT NULL,
  requirement_type VARCHAR(30) NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- Notifications (Module 11)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('goal', 'challenge', 'achievement', 'tip', 'system')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- Seed Data: Challenges
-- ============================================
INSERT INTO challenges (name, description, category, duration_days, xp_reward, badge_name, icon) VALUES
  ('Plastic-Free Week', 'Avoid single-use plastics for 7 days. Bring reusable bags, bottles, and containers.', 'waste', 7, 200, 'Plastic Warrior', '♻️'),
  ('Green Commute', 'Use public transport, bike, or walk for your daily commute for 5 days.', 'transport', 5, 150, 'Green Commuter', '🚲'),
  ('Energy Saver', 'Reduce electricity usage by 20% this week. Turn off lights, unplug devices.', 'energy', 7, 175, 'Energy Guardian', '⚡'),
  ('Veggie Week', 'Go vegetarian for 7 consecutive days. Discover delicious plant-based meals.', 'food', 7, 200, 'Plant Pioneer', '🥗'),
  ('Zero Waste Day', 'Produce zero waste for a full day. Compost, recycle, and reuse everything.', 'waste', 1, 100, 'Zero Hero', '🌍'),
  ('Car-Free Weekend', 'Don not use a car for the entire weekend. Walk, bike, or use public transit.', 'transport', 2, 125, 'Weekend Walker', '🚶'),
  ('Cool It Down', 'Reduce AC usage by 2 hours daily for a week. Use fans and natural ventilation.', 'energy', 7, 175, 'Cool Crusader', '❄️'),
  ('Local Food Week', 'Eat only locally sourced food for a week. Support local farmers and reduce food miles.', 'food', 7, 200, 'Local Legend', '🌾');

-- ============================================
-- Seed Data: Badges
-- ============================================
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
  ('First Steps', 'Log your first carbon activity', '👣', 'milestone', 'activities_logged', 1, 25),
  ('Week Warrior', 'Log activities for 7 consecutive days', '🔥', 'streak', 'streak_days', 7, 100),
  ('Month Master', 'Log activities for 30 consecutive days', '⭐', 'streak', 'streak_days', 30, 300),
  ('Carbon Cutter', 'Reduce your weekly emissions by 10%', '✂️', 'reduction', 'reduction_percent', 10, 150),
  ('Eco Explorer', 'Complete your first challenge', '🗺️', 'challenge', 'challenges_completed', 1, 75),
  ('Challenge Champion', 'Complete 5 challenges', '🏆', 'challenge', 'challenges_completed', 5, 250),
  ('Green Guru', 'Reach Level 10', '🧘', 'level', 'level_reached', 10, 500),
  ('Planet Protector', 'Save 100kg of CO2 emissions', '🛡️', 'reduction', 'co2_saved_kg', 100, 400),
  ('Data Driven', 'Log 50 carbon activities', '📊', 'milestone', 'activities_logged', 50, 200),
  ('Century Club', 'Log 100 carbon activities', '💯', 'milestone', 'activities_logged', 100, 350),
  ('AI Apprentice', 'Use the AI scenario engine 5 times', '🤖', 'usage', 'ai_queries', 5, 100),
  ('Twin Maker', 'Create your first Future Carbon Twin simulation', '👥', 'usage', 'twin_simulations', 1, 75);
