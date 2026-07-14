# FounderOS 🚀

FounderOS is an all-in-one startup operating workspace designed for founders to manage venture portfolios, track strategic goals, execute tactical milestone tasks, and consult with specialized AI agents including a strategic AI Co-Founder.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Python 3.14, [FastAPI](https://fastapi.tiangolo.com/)
- **ORM & Database**: [SQLAlchemy](https://www.sqlalchemy.org/), PostgreSQL
- **Security**: JWT (Jose), Passlib (Bcrypt)
- **AI Integrations**: Groq

### Frontend
- **Core**: React 18, [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with custom glassmorphism design variables
- **Networking**: Axios

---

## 📂 Repository Structure

```bash
FounderOS/
├── backend/                  # FastAPI Application
│   ├── agents/               # Specialized AI Agents (Founder, Analyst, Strategy, Task)
│   ├── ai/                   # OpenAI client and memory integrations
│   ├── database/             # SQLAlchemy database setup and dependency sessions
│   ├── models/               # DB schemas (User, Startup, Goal, Task, AIMessage)
│   ├── routes/               # API endpoint routers (Auth, Startup, Goal, Task, AI, Dashboard)
│   ├── schemas/              # Pydantic validation schemas
│   ├── scripts/              # Migration scripts (schema updating)
│   ├── requirements.txt      # Python dependencies
│   └── app.py                # Server entrypoint
├── frontend/                 # React Frontend App
│   ├── src/
│   │   ├── api/              # Axios instance configuration
│   │   ├── components/       # Shared layout and badge components
│   │   ├── pages/            # Core views (Dashboard, Startup, Goals, Tasks, AI, Settings)
│   │   ├── App.jsx           # App routes and auth guards
│   │   └── index.css         # Custom global styles and tokens
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite config
└── Screenshots/              # UI references
```

---

## 🤖 Specialized AI Agents

FounderOS includes several specialized, autonomous AI agents to guide your startup journey:
1. **AI Co-Founder (`founder_agent.py`)**: Chats with the user, incorporating database history and startup context to provide actionable strategic advice.
2. **AI Analyst (`analyst_agent.py`)**: Analyzes financial data and key metrics (MRR, Churn, CAC, LTV) to discover growth opportunities.
3. **Strategy Agent (`strategy_agent.py`)**: Guides strategic positioning, SWOT metrics, and funding roadmaps.
4. **Task Agent (`task_agent.py`)**: Dynamically breaks down high-level startup goals into practical, sequential milestone checklists.

---

## 🚀 Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/founderos
   OPENAI_API_KEY=your-api-key-here
   ```
5. Run the migrations to update the database schema:
   ```bash
   python -m scripts.add_startup_id_to_tasks
   python -m scripts.add_goal_id_to_tasks
   ```
6. Start the FastAPI development server:
   ```bash
   python -m uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🌐 Deployment Guide

### 1. Database Setup (Supabase)
FounderOS uses PostgreSQL as its database. You can host this easily on [Supabase](https://supabase.com/):
1. Sign up for a free Supabase account and create a new project.
2. Once the project is provisioned, go to **Project Settings** > **Database** > **Connection string** > **URI**.
3. Copy the URI connection string. It will look like this:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` with the database password you chose during setup.
5. In your production backend deployment environment, set this connection string as the value of the `DATABASE_URL` environment variable.
6. Optional: You can paste the contents of [schema.sql](file:///d:/Projects/FounderOS/backend/database/schema.sql) directly into the Supabase SQL Editor and run it to pre-configure all database tables. (Otherwise, SQLAlchemy's ORM will automatically create the tables on the first backend API call).

### 2. Frontend Deployment (Vercel)
You can deploy the React Vite frontend directly to [Vercel](https://vercel.com/):
1. Create a free Vercel account and connect your GitHub repository.
2. Click **Add New** > **Project** and import the `FounderOS` repository.
3. In the project configuration:
   - Set the **Root Directory** to `frontend`.
   - Ensure the framework preset is set to **Vite** (build command: `npm run build`, output directory: `dist`).
4. Click **Deploy**. Vercel will build and host your frontend.
5. Vercel will automatically detect and apply the [vercel.json](file:///d:/Projects/FounderOS/frontend/vercel.json) configuration to route all client-side page requests (like `/dashboard`, `/ai`) to `/index.html` preventing 404 errors.
