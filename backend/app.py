from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine
from database.base import Base
import models.users
import models.startup
import models.goal
import models.task
from routes.auth import router as auth_router
from routes.startup import router as startup_router
from routes.goal import router as goal_router
from routes.task import router as task_router
from routes.dashboard import router as dashboard_router
from routes.ai import router as agent_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {
        "message":"FounderOs backend running"
    }

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    startup_router,
    prefix="/startup",
    tags=["Startup"]
)

app.include_router(
    goal_router,
    prefix="/goal",
    tags=["Goals"]
)

app.include_router(
    task_router,
    prefix="/task",
    tags=["Tasks"]
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    agent_router,
    prefix="/chat",
    tags=["AI"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)