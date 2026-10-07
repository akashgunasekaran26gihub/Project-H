# AI-Assisted Habit Tracker

A production-quality, information-dense, modern habit tracker web application inspired by high-productivity spreadsheet dashboards and enhanced with an intelligent AI coaching layer.

---

## 🌟 Key Features

1. **Spreadsheet-Dense Monthly Habit Grid**
   - Frozen sticky columns for habit title, category, and target metrics.
   - 28/29/30/31-day auto-adapting calendar grid with pastel-coded weekly grouping bands (Week 1 through Week 5).
   - High-contrast completion indicators: Completed (`✓`), Partial (`◐`), Missed (`✕`), and Unmarked (`○`).
   - Optimistic, zero-latency UI updates with automatic background cloud synchronization and acoustic chime audio feedback.
   - Mobile-adaptive view toggling between full scrollable grid and a clean *Today's Focus List*.

2. **Gamification & Daily / Weekly Achievements System**
   - **XP & Level Progression**: Earn +50 XP per habit completion, level up from *Novice Tracker* to *Atomic Titan*.
   - **Daily Quests**: Real-time progress on *Morning Catalyst*, *Triple Threat*, and *Daily Mastery (100%)*.
   - **Milestone Trophy Cabinet**: Interactive badges including *Century Club (100+ completions)*, *Iron Will (7d streak)*, *Zen Practitioner*, *Atomic Architect*, and *Consistency Titan*.

3. **Mind-Relaxing "Zen Zone" Games & Mindfulness Suite**
   - **Breathing Orb**: Animated visual breath guide with *Box Focus (4-4-4-4)* and *4-7-8 Sleep & Anxiety Calm* modes.
   - **Tactile Bubble Popper**: 36-bubble silicone wrap with synthesized acoustic pops via Web Audio API.
   - **Celestial Thought Release**: Type any anxious thoughts and watch them float into the cosmos as glowing lanterns.
   - **Procedural Ambient Soundscapes**: Native Web Audio generation of *Gentle Rain* and *432Hz Sacred Binaural Drone* with volume control.

4. **SaaS-Ready Architecture & Subscription Tiers**
   - **Pro Subscription Modal**: Monthly ($9/mo) and Annual ($7/mo) billing switcher with feature comparison table.
   - **Data Backup & Export**: 1-click export to CSV (spreadsheet format) or JSON, with file restore.
   - **Share Accountability Card**: Generates an aesthetic branded summary card with streaks and consistency rates.
   - **Audio Synthesizer Engine**: Zero-asset, offline native acoustic sound effects.

5. **Upgraded AI Habit Coach & Multi-Domain Advisor**
   - Answers **ANY** productivity or habit question: behavioral loops, Atomic Habits concepts, procrastination antidotes, 2-minute rule, morning/evening routine design, and deep work intervals.
   - Conversational persistence with real-time sync indicator and quick-action prompt chips.
   - Natural language habit creator with structured pre-confirmation preview.

6. **Offline First & PWA Foundation**
   - Offline mutation queue stored in local browser cache.
   - Automatic background replay and conflict resolution when connection is restored.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti
- **Backend**: Node.js, Express, Prisma ORM, SQLite (`dev.db`), Zod, JWT, bcryptjs
- **AI Engine**: Contextual statistical reasoning engine + optional Google Gemini / OpenAI LLM integration

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed    # Seeds demo data for October 2026
npm run dev            # Starts backend on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts frontend on http://localhost:5174
```

Visit **`http://localhost:5174`** in your browser.

---

## ⚙️ Environment Configuration

### `backend/.env`
```env
PORT=5001
DATABASE_URL="file:./dev.db"
JWT_SECRET="habit-tracker-super-secret-jwt-key-2026"
NODE_ENV=development

# Optional external LLM API key (works out of the box with heuristic engine if left blank)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in with email and password
- `POST /api/auth/demo` — 1-click test login with pre-seeded data
- `GET /api/auth/me` — Get authenticated user details

### Habits & Completions
- `GET /api/habits` — List all user habits
- `POST /api/habits` — Create new habit
- `PUT /api/habits/:id` — Update habit details
- `PATCH /api/habits/:id/archive` — Toggle archive state
- `DELETE /api/habits/:id` — Delete habit
- `POST /api/completions/toggle` — Toggle status on a specific date (cycles states)

### Dashboard & Analytics
- `GET /api/dashboard?year=YYYY&month=MM` — Monthly grid data, streaks, and weekly summaries
- `GET /api/analytics/lifetime` — Lifetime aggregate statistics
- `GET /api/analytics/trends` — Recharts trend series

### AI Intelligence
- `POST /api/ai/habit-parser` — Natural language text to structured habit specification
- `GET /api/ai/daily-summary` — Real tracker data daily briefing
- `GET /api/ai/weekly-summary` — Weekly performance review
- `GET /api/ai/insights` — Statistical habit patterns
- `POST /api/ai/chat` — Context-aware AI coach conversation
