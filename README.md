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

## Live Demo Guide
Click the link down below:-
1. https://founder-os-frontend-kappa.vercel.app
2. Sign Up
3. Manage
