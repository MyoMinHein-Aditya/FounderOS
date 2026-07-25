from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models.base import Base
from controllers.auth import router as auth_router
from controllers.startup import router as startup_router
from controllers.goal import router as goal_router
from controllers.task import router as task_router
from controllers.note import router as note_router
from controllers.crm import router as crm_router
from controllers.calendar import router as calendar_router
from controllers.team import router as team_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"status": "success", "message": "FounderOs v2 backend running!"}

app.include_router(auth_router)
app.include_router(startup_router)
app.include_router(goal_router)
app.include_router(task_router)
app.include_router(note_router)
app.include_router(crm_router)
app.include_router(calendar_router)
app.include_router(team_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)
