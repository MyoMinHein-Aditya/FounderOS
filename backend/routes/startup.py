from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.startup import StartupCreate
from models.startup import Startup
from models.goal import Goal
from models.task import Task
from utils.auth import get_current_user
from agents.analyst_agent import analyst_agent
from agents.strategy_agent import strategy_agent

router = APIRouter()

def calc_pct(completed: int, total: int) -> int:
    return int((completed / total) * 100) if total > 0 else 0

def compile_startup_data(startup_id: int, db: Session, user_id: int) -> dict:
    startup = db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == user_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    goals = db.query(Goal).filter(Goal.startup_id == startup.id).all()
    tasks = db.query(Task).filter(Task.startup_id == startup.id).all()
    return {
        "name": startup.name,
        "description": startup.description,
        "stage": startup.stage,
        "industry": startup.industry,
        "goals": [g.title for g in goals],
        "tasks": [{"title": t.title, "status": t.status} for t in tasks]
    }

@router.post("/create")
def create_startup(startup: StartupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    new_startup = Startup(
        name=startup.name,
        description=startup.description,
        stage=startup.stage,
        industry=startup.industry,
        owner_id=current_user["user_id"]
    )
    db.add(new_startup)
    db.commit()
    db.refresh(new_startup)
    return {"message": "Startup Created", "startup_id": new_startup.id}

@router.get("/get_startups")
def get_startups(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startups = db.query(Startup).filter(Startup.owner_id == current_user["user_id"]).all()
    result = []
    for s in startups:
        total_goals = db.query(Goal).filter(Goal.startup_id == s.id).count()
        completed_goals = db.query(Goal).filter(Goal.startup_id == s.id, Goal.status == "Completed").count()
        total_tasks = db.query(Task).filter(Task.startup_id == s.id).count()
        completed_tasks = db.query(Task).filter(Task.startup_id == s.id, Task.status == "Completed").count()
        
        result.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "stage": s.stage,
            "industry": s.industry,
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "goal_pct": calc_pct(completed_goals, total_goals),
            "task_pct": calc_pct(completed_tasks, total_tasks)
        })
    return result

@router.get("/{startup_id}/analyze")
def analyze_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    data = compile_startup_data(startup_id, db, current_user["user_id"])
    return {"analysis": analyst_agent.analyze(str(data))}

@router.get("/{startup_id}/strategy")
def strategy_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    data = compile_startup_data(startup_id, db, current_user["user_id"])
    return {"strategy": strategy_agent.analyze(str(data))}