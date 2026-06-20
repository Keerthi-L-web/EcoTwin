# 🌱 EcoTwin AI

> **Your Future Sustainable Self** — An AI-powered Carbon Footprint Awareness Platform

[![CI/CD](https://github.com/YOUR_USERNAME/ecotwin-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/ecotwin-ai/actions)

## Overview

EcoTwin AI is an intelligent platform that creates a **digital sustainability twin** and predicts the impact of lifestyle changes through AI-powered (Gemini) recommendations and simulations. It goes far beyond a simple carbon calculator — it's a living, predictive, gamified sustainability coach.

## Features

| Module | Description |
|--------|------------|
| 🔐 Authentication | JWT + Refresh Tokens + bcrypt |
| 👤 Lifestyle Profiler | Transport, Food, Home, Shopping habits |
| 📊 Carbon Tracker | Log & track daily/weekly/monthly emissions |
| 👥 Future Carbon Twin | Compare current vs eco-friendly lifestyle |
| 🤖 AI Scenario Engine | "What if" questions powered by Gemini AI |
| 🧘 AI Sustainability Coach | Daily/weekly/monthly personalized plans |
| 📈 Forecast Engine | Predict future emissions with trend analysis |
| 🏆 Challenges | Eco challenges with progress tracking |
| ⭐ Gamification | XP, Levels, Badges, Streaks, Leaderboard |
| 📄 Reports | PDF report generation |
| 🔔 Notifications | In-app alerts and reminders |
| 📊 Dashboard | Unified view with Pie/Bar/Line charts |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 + React Query + Recharts
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: Supabase PostgreSQL
- **AI**: Google Gemini API
- **Auth**: JWT + bcrypt + Refresh Tokens
- **Testing**: Vitest + React Testing Library + Supertest
- **Deploy**: Vercel (frontend) + Render (backend)

## Architecture

- Feature-based architecture with Clean Architecture principles
- SOLID principles throughout
- Strict TypeScript (`strict: true`)
- Zod validation on all endpoints
- OWASP security best practices

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Gemini API key

### Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/ecotwin-ai.git
cd ecotwin-ai

# Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# Configure environment
cp .env.example server/.env
cp .env.example client/.env
# Edit both .env files with your credentials

# Run database migration
# Paste supabase/migrations/001_initial_schema.sql into Supabase SQL Editor

# Start development
cd server && npm run dev &
cd client && npm run dev
```

### Testing

```bash
cd server && npm test
cd client && npm test
```

## Security

- ✅ JWT with 15-minute expiry + 7-day refresh rotation
- ✅ bcrypt (12 rounds)
- ✅ Helmet security headers
- ✅ Rate limiting (general, auth, AI)
- ✅ CORS origin whitelist
- ✅ Zod input validation
- ✅ XSS sanitization
- ✅ SQL injection protection (parameterized queries)
- ✅ Environment validation at startup

## Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Semantic HTML with proper landmarks
- ✅ Keyboard navigation + focus indicators
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader support
- ✅ Color contrast (4.5:1 minimum)
- ✅ Reduced motion support
- ✅ Skip-to-content link

## License

MIT
