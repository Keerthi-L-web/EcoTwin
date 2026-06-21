// EcoTwin AI - Database Setup Script
// Run with: node setup_db.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyrfhqmlqtbeeycggugr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cmZocW1scXRiZWV5Y2dndWdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg4MjcyNSwiZXhwIjoyMDk3NDU4NzI1fQ.qS2v8XiFdsfFPRPSTAtl6335suLDtEGmNUcYI6jpf-o';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runSQL(sql, label) {
  console.log(`\n⏳ Running: ${label}...`);
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    // Try via REST direct
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`⚠️  ${label}: ${body}`);
    } else {
      console.log(`✅ ${label}: done`);
    }
  } else {
    console.log(`✅ ${label}: done`);
  }
}

// Test connection first
async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('count').limit(1).maybeSingle();
  if (error?.code === '42P01') {
    console.log('📋 Tables not found — will create them now.\n');
    return false; // tables don't exist yet
  } else if (error) {
    console.error('❌ Connection error:', error.message);
    return null;
  } else {
    console.log('✅ Connection OK. Tables already exist!');
    return true;
  }
}

// Try direct SQL via Supabase management API
async function runMgmtSQL(sql) {
  const projectRef = 'nyrfhqmlqtbeeycggugr';
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

async function main() {
  console.log('🌱 EcoTwin AI - Database Setup\n');
  
  const tablesExist = await testConnection();
  
  if (tablesExist === true) {
    console.log('\n✨ All tables already exist. Your database is ready!');
    return;
  }
  
  if (tablesExist === null) {
    console.log('\n❌ Could not connect. Please check credentials.');
    return;
  }

  // Tables don't exist - let's try to create via management API
  console.log('🔧 Attempting to create tables via Management API...');
  
  const setupSQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  refresh_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS lifestyle_profiles (
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

CREATE TABLE IF NOT EXISTS carbon_activities (
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

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON carbon_activities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_category ON carbon_activities(user_id, category);

CREATE TABLE IF NOT EXISTS twin_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_name VARCHAR(100) NOT NULL,
  current_co2_kg DECIMAL(10,2) NOT NULL,
  predicted_co2_kg DECIMAL(10,2) NOT NULL,
  reduction_percent DECIMAL(5,2) NOT NULL,
  changes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twin_user ON twin_simulations(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('scenario', 'daily', 'weekly', 'monthly')),
  prompt TEXT NOT NULL,
  response JSONB NOT NULL DEFAULT '{}',
  co2_reduction_kg DECIMAL(10,2),
  money_saved DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON ai_recommendations(user_id, type, created_at DESC);

CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL CHECK (period IN ('week', 'month', 'year')),
  predicted_co2_kg DECIMAL(10,2) NOT NULL,
  trend VARCHAR(20) NOT NULL CHECK (trend IN ('increasing', 'decreasing', 'stable')),
  data_points JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecasts_user ON forecasts(user_id, period, created_at DESC);

CREATE TABLE IF NOT EXISTS challenges (
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

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS user_gamification (
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

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL DEFAULT '🏆',
  category VARCHAR(30) NOT NULL,
  requirement_type VARCHAR(30) NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('goal', 'challenge', 'achievement', 'tip', 'system')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  target_co2_kg DECIMAL(10,2) NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id, status);

INSERT INTO challenges (name, description, category, duration_days, xp_reward, badge_name, icon)
SELECT * FROM (VALUES
  ('Plastic-Free Week', 'Avoid single-use plastics for 7 days.', 'waste', 7, 200, 'Plastic Warrior', '♻️'),
  ('Green Commute', 'Use public transport, bike, or walk for 5 days.', 'transport', 5, 150, 'Green Commuter', '🚲'),
  ('Energy Saver', 'Reduce electricity usage by 20% this week.', 'energy', 7, 175, 'Energy Guardian', '⚡'),
  ('Veggie Week', 'Go vegetarian for 7 consecutive days.', 'food', 7, 200, 'Plant Pioneer', '🥗'),
  ('Zero Waste Day', 'Produce zero waste for a full day.', 'waste', 1, 100, 'Zero Hero', '🌍'),
  ('Car-Free Weekend', 'Do not use a car for the entire weekend.', 'transport', 2, 125, 'Weekend Walker', '🚶'),
  ('Cool It Down', 'Reduce AC usage by 2 hours daily for a week.', 'energy', 7, 175, 'Cool Crusader', '❄️'),
  ('Local Food Week', 'Eat only locally sourced food for a week.', 'food', 7, 200, 'Local Legend', '🌾')
) AS v(name, description, category, duration_days, xp_reward, badge_name, icon)
WHERE NOT EXISTS (SELECT 1 FROM challenges LIMIT 1);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, xp_reward)
SELECT * FROM (VALUES
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
  ('Twin Maker', 'Create your first Future Carbon Twin simulation', '👥', 'usage', 'twin_simulations', 1, 75)
) AS v(name, description, icon, category, requirement_type, requirement_value, xp_reward)
WHERE NOT EXISTS (SELECT 1 FROM badges LIMIT 1);
  `;

  const res = await runMgmtSQL(setupSQL);
  
  if (res.ok) {
    console.log('✅ Database setup complete! All tables created.\n');
  } else {
    const body = await res.text();
    console.log(`\n📋 Management API response (${res.status}): ${body}`);
    console.log('\n⚠️  Auto-setup via API not available (needs Supabase Personal Access Token).');
    console.log('\n✅ MANUAL STEPS (takes 30 seconds):');
    console.log('1. Open this URL in your browser:');
    console.log('   https://supabase.com/dashboard/project/nyrfhqmlqtbeeycggugr/sql/new');
    console.log('2. Copy the contents of: d:\\promptwars\\supabase\\setup_all.sql');
    console.log('3. Paste into the SQL editor and click "Run"');
    console.log('4. Done! Signup will work immediately after.\n');
  }
}

main().catch(console.error);
