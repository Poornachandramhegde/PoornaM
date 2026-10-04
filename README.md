# PoornaM — Personal Schedule & Work Manager

PoornaM is a calm, focused personal productivity platform designed for a single user to manage day-to-day commitments, unscheduled tasks, long-term aspirations, and synchronization with Google Calendar.

## Three Pillars of PoornaM

1. **What do I need to do?** → **To-Do** (Unscheduled backlog; easily convert items to scheduled blocks)
2. **When am I going to do it?** → **Schedule** (Daily vertical timeline and 7-day weekly grid with Google Calendar sync)
3. **What do I ultimately want to accomplish?** → **Bucket List** (Long-term goals, milestone tracking, and aspirations)

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS**
- **React Router**
- **Lucide React** (clean iconography)
- **date-fns** (date manipulation & calendar math)

### Backend & Database
- **Node.js** + **Express** + **TypeScript**
- **SQLite** (local, lightweight, zero-configuration database)
- **Prisma ORM**
- **Google Calendar API & OAuth 2.0** (`googleapis`)
- **Zod** (strict runtime validation)

---

## Features

- **Dashboard**: High-level focus view showing today's timeline, pending to-dos, upcoming commitments, and bucket list goals at a glance.
- **Schedule (Day & Week Views)**:
  - Vertical time-slot layout for daily planning.
  - 7-day weekly overview.
  - Date navigation: Previous, Next, and jump to Today.
  - Visual differentiation between PoornaM tasks and imported Google Calendar events.
- **To-Do Management**:
  - Add, edit, complete, and delete to-do items.
  - Filter by Pending, Completed, or All.
  - **Convert To-Do → Scheduled Task**: Instant transition from thought to scheduled calendar slot.
- **Bucket List**:
  - Simple card-based tracker for long-term aspirations.
  - Status progression: `Planned`, `In Progress`, `Completed`.
  - Target dates and categorized tagging.
- **Google Calendar Integration**:
  - OAuth 2.0 connection workflow.
  - Creating a scheduled task creates a corresponding event on your primary Google Calendar.
  - Updating or deleting a scheduled task automatically syncs with Google Calendar.
  - Existing Google Calendar events display alongside PoornaM tasks in the schedule.
  - Graceful fallback: If offline or API fails, local tasks remain safe and unaffected.

---

## Project Structure

```text
poornam/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # SQLite schema for User, ScheduledTask, Todo, BucketItem, GoogleCalendarConnection
│   ├── src/
│   │   ├── config/            # Prisma client & environment variables
│   │   ├── controllers/       # Task, Todo, Bucket, and Google controllers
│   │   ├── services/          # Business logic & Google Calendar API service
│   │   ├── routes/            # REST API route handlers
│   │   ├── middleware/        # Centralized error handler
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server bootstrap
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Header, Sidebar, Layout
│   │   │   ├── task/          # TaskModal, TaskItem
│   │   │   ├── todo/          # TodoItem, TodoModal, ScheduleTodoModal
│   │   │   ├── bucket/        # BucketCard, BucketModal
│   │   │   └── calendar/      # DayView, WeekView
│   │   ├── pages/             # Dashboard, Schedule, Todo, BucketList, Settings
│   │   ├── services/          # Frontend API client
│   │   ├── types/             # Strong TypeScript definitions
│   │   └── utils/             # Date & time formatting
│   └── package.json
│
├── package.json               # Root scripts to orchestrate frontend & backend
└── README.md
```

---

## Quickstart & Setup

### 1. Install Dependencies

In the root directory, install dependencies for root, backend, and frontend:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure Environment Variables

Backend environment configuration:

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:5000/api/google/callback"
FRONTEND_URL="http://localhost:5173"
TIMEZONE="Asia/Kolkata"
```

### 3. Initialize SQLite Database with Prisma

Generate the Prisma client and push the schema to SQLite:

```bash
npm run prisma:generate --prefix backend
npm run prisma:push --prefix backend
```

### 4. Run Locally

You can run both backend and frontend concurrently from the root:

```bash
npm run dev
```

Or start them individually in separate terminals:

```bash
# Terminal 1: Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend (http://localhost:5173)
npm run dev:frontend
```

---

## Google Calendar OAuth Setup

To enable Google Calendar synchronization:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Calendar API**.
3. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5000/api/google/callback`
4. Copy the generated **Client ID** and **Client Secret** into `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
5. Restart the backend server.
6. In PoornaM, open **Settings** (`/settings`) and click **Connect Google Calendar**.
