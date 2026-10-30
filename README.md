# ☀️ Daylight — Modern Mindful Productivity

Daylight is an Apple-inspired, responsive productivity web application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It combines task management, daily time-blocking, habit tracking, and a 25-minute Pomodoro focus chamber into an elegant, distraction-free interface.

Designed for clarity and calm execution, Daylight features clean white surfaces, subtle borders, soft blue accents (`#0071e3`), rounded cards, smooth micro-interactions, synthesized audio feedback (via Web Audio API), and responsive layouts tailored for mobile, tablet, and desktop screens.

---

## ✨ Features

- **Apple-Inspired Design Language**:
  - Crisp typography and frosted glass navigation (`backdrop-blur-xl`).
  - Subtle shadows (`0 4px 20px -2px rgba(0,0,0,0.05)`), refined border radius (`rounded-2xl` & `rounded-3xl`), and responsive padding.
  - Native Web Audio chime effects on task completion and session end without external media dependencies.
- **Dynamic Dashboard (Overview)**:
  - **Dynamic Welcome Banner**: Contextual greeting based on time of day and pending priorities summary.
  - **Daily Statistics Cards**: Completed tasks, total focus minutes, active habit compliance, and overall Flow Score.
  - **Daily Momentum Card**: Real-time SVG circular activity ring tracking combined progress across tasks and habits.
  - **Priorities Task List**: Filter by All / Pending / Completed, quick inline task entry, priority badges, and toggle animations.
  - **Habit Consistency Tracker**: One-tap check-in buttons with live streaks and a 7-day consistency matrix.
  - **Working 25-Minute Focus Timer**: Pomodoro sprint countdown (25m), short breaks (5m), and long breaks (15m) directly on the dashboard.
- **Sidebar & Mobile Responsive Navigation**:
  - **Desktop**: Persistent frosted glass sidebar with active indicators, pending task count badges, quick timer controls, and Phase 2 Supabase badge.
  - **Mobile**: Ergonomic bottom navigation dock with badge counters + expandable drawer menu for all subpages.
- **Dedicated Application Pages (React Router)**:
  1. `Overview` (`/`): The central mission control dashboard.
  2. `My Tasks` (`/tasks`): Comprehensive task manager with search, category filters (Work, Design, Personal, Health, Learning), priority filters, and creation modal.
  3. `Planner` (`/planner`): Time-blocked daily agenda with morning, afternoon, and evening blocks.
  4. `Habits` (`/habits`): Habit tracker with streak statistics and 7-day adherence history.
  5. `Focus Chamber` (`/focus`): Immersive full-screen Pomodoro room with customizable white/pink noise audio generator.
  6. `Notes` (`/notes`): Quick-capture markdown-style cards with search, category tags, and pinning.
  7. `Insights` (`/insights`): Visual weekly velocity bar chart and focus distribution analytics.
  8. `Settings` (`/settings`): Audio and notification preferences, local data reset, and the Phase 2 Supabase roadmap.
- **Supabase Authentication**:
  - Secure end-to-end user authentication via `@supabase/supabase-js`.
  - Email & Password Signup (`signUp`), Login (`signInWithPassword`), and Password Recovery (`resetPasswordForEmail`).
  - Google OAuth one-click authentication ready (`signInWithOAuth`).
  - Real-time session synchronization and persistence across browser tabs with `onAuthStateChange`.
  - Route protection (`ProtectedRoute`): unauthenticated visitors are automatically routed to `/login`.
  - Profile area with user initials, name, and Sign Out action in Header, Sidebar, and Settings.
- **LocalStorage Persistence**:
  - Automatically saves tasks, habits, notes, and focus logs to the browser's local cache so your work persists across reloads.
- **Phase 2 Supabase Architecture**:
  - Clean TypeScript contracts ready for seamless Supabase authentication and PostgreSQL database connection.

---

## 📁 Project Structure

```
Daylight/
├── public/                     # Static assets & web manifest
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── Badge.tsx       # Soft status and priority badges
│   │   │   ├── Button.tsx      # Apple-styled primary, secondary, and ghost buttons
│   │   │   ├── Card.tsx        # White rounded surface container
│   │   │   ├── Modal.tsx       # Accessible dialog sheet with frosted backdrop
│   │   │   └── ProgressBar.tsx # Animated rounded progress indicators
│   │   ├── dashboard/          # Dashboard modular widgets
│   │   │   ├── WelcomeSection.tsx       # Dynamic greeting & daily summary
│   │   │   ├── DailyStatsGrid.tsx       # 4 key performance metrics
│   │   │   ├── DailyProgressCard.tsx    # SVG circular momentum ring
│   │   │   ├── DashboardTaskList.tsx    # Filterable priority task card
│   │   │   ├── DashboardHabitTracker.tsx# Interactive habit check-in card
│   │   │   └── MiniFocusTimer.tsx       # 25-minute Pomodoro widget
│   │   ├── layout/             # Navigation and layout
│   │   │   ├── Header.tsx      # Top bar with date & quick task trigger
│   │   │   ├── Sidebar.tsx     # Desktop sidebar with live indicators
│   │   │   ├── MobileNav.tsx   # Mobile bottom dock & menu drawer
│   │   │   ├── MainLayout.tsx  # Master shell wrapping pages
│   │   │   └── navigationItems.ts # Route definitions
│   │   ├── tasks/              # Task domain components
│   │   │   ├── TaskItem.tsx    # Individual task row with circular checkbox
│   │   │   └── TaskCreateModal.tsx # Full task creation form
│   │   └── habits/             # Habit domain components
│   │       └── HabitCreateModal.tsx# Custom habit creator
│   ├── context/                # React state management
│   │   ├── TaskContext.tsx     # Tasks state, CRUD, & dynamic progress
│   │   ├── HabitContext.tsx    # Habit state & streak calculations
│   │   └── TimerContext.tsx    # 25-minute Pomodoro timer countdown & modes
│   ├── pages/                  # Route views
│   │   ├── Overview.tsx        # Dashboard
│   │   ├── Tasks.tsx           # My Tasks page
│   │   ├── Planner.tsx         # Daily schedule timeline
│   │   ├── Habits.tsx          # Habit tracker & weekly matrix
│   │   ├── Focus.tsx           # Immersive Focus Chamber & Pink Noise
│   │   ├── Notes.tsx           # Quick thought capture & search
│   │   ├── Insights.tsx        # Visual velocity bar chart
│   │   └── Settings.tsx        # Preferences & Supabase roadmap
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & types
│   ├── utils/
│   │   ├── date.ts             # Date formatting & greetings
│   │   ├── mockData.ts         # Realistic sample data
│   │   ├── sound.ts            # Web Audio API synthesizers (chimes/clicks)
│   │   └── storage.ts          # Safe LocalStorage wrapper
│   ├── App.tsx                 # Router & Context provider setup
│   ├── index.css               # Tailwind directives & Apple custom styles
│   └── main.tsx                # Application entry point
├── index.html                  # HTML template with Plus Jakarta Sans / SF Pro
├── package.json                # Project dependencies & scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Apple design system theme extensions
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

---

## 🚀 Getting Started

Follow these simple steps to run Daylight on your computer:

### 1. Prerequisites
Ensure you have **Node.js** (v18.0 or newer) and **npm** installed.

### 2. Install Dependencies
Open your terminal inside the project directory (`Daylight`) and run:
```bash
npm install
```

### 3. Start the Development Server
Launch the application locally with hot-module reloading:
```bash
npm run dev
```
The terminal will display the local development URL, usually:
```
  VITE v5.4.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```
Open **`http://localhost:3000`** in your browser to view Daylight!

### 4. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
This compiles TypeScript (`tsc -b`) and bundles assets into the `dist/` directory.

### 5. Preview Production Build
To preview the production bundle locally:
```bash
npm run preview
```

---

## 🛠️ Commands Explained for Beginners

- `npm install`: Reads `package.json` and downloads the necessary libraries (React, Vite, Tailwind CSS, Lucide icons) into the `node_modules` folder.
- `npm run dev`: Starts Vite's lightning-fast local development server with Hot Module Replacement (HMR). Any edits you save in your code will instantly reflect in the browser without reloading the page.
- `npm run build`: Compiles TypeScript files to check for type errors and creates a minified, high-performance static build in the `dist` folder ready to be deployed to Netlify, Vercel, or GitHub Pages.

---

## 🔐 Authentication & Google OAuth Configuration

Daylight is configured to connect to Supabase Auth using the credentials in `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### To Enable Google OAuth Sign-In:
1. Go to your [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized redirect URIs**, add your Supabase Auth callback URL:
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. Copy the generated **Client ID** and **Client Secret**.
5. Open your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your Project -> **Authentication** -> **Providers** -> **Google**.
6. Toggle **Enable Google provider**, paste your **Client ID** and **Client Secret**, and click **Save**.
7. In Daylight, clicking **Continue with Google** will now seamlessly authenticate your users!

---

## 🔮 Phase 2: Connecting Supabase

In Phase 2, we will integrate Supabase for user accounts and cloud syncing:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Add your environment variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Swap the `loadFromStorage` and `saveToStorage` methods in `TaskContext` and `HabitContext` with Supabase client calls (`supabase.from('tasks').select('*')`).
