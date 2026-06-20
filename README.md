# CarbonWise-AI
> **Your Future Sustainable Self**

CarbonWise-AI is a competition-grade, AI-powered sustainability platform designed to help individuals track, understand, and optimize their carbon footprint through personalized lifestyle coaching.

## Problem Statement
Climate change requires systemic shifts, but individual actions account for nearly 70% of global greenhouse gas emissions. Most people lack the data, motivation, or actionable knowledge required to make sustainable lifestyle choices. 

## Solution Overview
CarbonWise-AI bridges this gap by creating a "digital twin" of a user's carbon footprint. It analyzes daily habits—from transportation to diet—and uses advanced AI (Google Gemini) to forecast future emissions, generate personalized reduction strategies, and offer daily eco-coaching.

---

## Architecture
The application uses a modern, serverless-ready architecture combining a robust Node.js/Express backend with a highly interactive React/Vite frontend.

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4, React Query, Lucide React
- **Backend**: Node.js, Express.js, TypeScript, Zod Validation
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini API

## Key Features
- **Carbon Tracking**: Log daily activities (travel, diet, energy).
- **Twin Simulation**: AI forecasts how lifestyle changes (e.g., going vegan) impact long-term emissions.
- **Goals Module**: Set actionable targets with deadlines and track completion.
- **AI Coach**: Graceful, robust daily eco-tips and weekly sustainability action plans.
- **Gamification**: Earn XP, level up, and compete on the global leaderboard.

---

## Engineering Standards

### Security Features
- Strict JWT authentication with HttpOnly cookies/local storage.
- Request rate-limiting and robust CORS policies.
- Comprehensive `Zod` schema validation on all incoming API requests.
- Mutex-locked token refresh mechanism to prevent race conditions during `401 Unauthorized` responses.

### Performance
- Heavy React components (Cards, Buttons, Charts) are optimized using `React.memo` and `useCallback`.
- Lazy-loaded routing ensures a minimal initial bundle size.

### Testing Strategy
- Core carbon calculation utilities are fully unit-tested via `Vitest`.
- Zod schemas are rigorously validated against edge cases.

### Accessibility (a11y)
- Strict ARIA label compliance across interactive elements.
- Keyboard navigation support and focus management.
- High-contrast UI theme designed for readability.

---

## Setup Instructions

### Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GEMINI_API_KEY=your_gemini_key
CORS_ORIGIN=http://localhost:5173
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Installation
```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

---

## API Documentation
Core endpoints include:
- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/profile`: Retrieve lifestyle profile and twin data.
- `POST /api/goals`: Create a new sustainability goal.
- `POST /api/ai/scenario`: Run a Gemini-powered impact simulation.

## Future Improvements
- Native iOS/Android apps built with React Native.
- Direct integration with smart home APIs (e.g., Google Nest) for real-time electricity tracking.
- Social sharing and team-based sustainability challenges.

*Designed & engineered for maximum impact.*
