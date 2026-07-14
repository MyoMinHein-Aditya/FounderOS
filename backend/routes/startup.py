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

    return {
        "message": "Startup Created",
        "startup_id": new_startup.id
    }

@router.get("/get_startups")
def get_startups(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startups = db.query(Startup).filter(Startup.owner_id == current_user["user_id"]).all()

    result = []
    for s in startups:
        total_goals = db.query(Goal).filter(Goal.startup_id == s.id).count()
        completed_goals = db.query(Goal).filter(Goal.startup_id == s.id, Goal.status == "Completed").count()
        
        total_tasks = db.query(Task).filter(Task.startup_id == s.id).count()
        completed_tasks = db.query(Task).filter(Task.startup_id == s.id, Task.status == "Completed").count()
        
        goal_pct = int((completed_goals / total_goals) * 100) if total_goals > 0 else 0
        task_pct = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
        
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
            "goal_pct": goal_pct,
            "task_pct": task_pct
        })

    return result

@router.get("/{startup_id}/analyze")
def analyze_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == current_user["user_id"]).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    
    # Compile details
    goals = db.query(Goal).filter(Goal.startup_id == startup.id).all()
    tasks = db.query(Task).filter(Task.startup_id == startup.id).all()
    
    data = {
        "name": startup.name,
        "description": startup.description,
        "stage": startup.stage,
        "industry": startup.industry,
        "goals": [g.title for g in goals],
        "tasks": [{"title": t.title, "status": t.status} for t in tasks]
    }
    
    analysis = analyst_agent.analyze(str(data))
    return {"analysis": analysis}

@router.get("/{startup_id}/strategy")
def strategy_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == current_user["user_id"]).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
        
    goals = db.query(Goal).filter(Goal.startup_id == startup.id).all()
    tasks = db.query(Task).filter(Task.startup_id == startup.id).all()
    
    data = {
        "name": startup.name,
        "description": startup.description,
        "stage": startup.stage,
        "industry": startup.industry,
        "goals": [g.title for g in goals],
        "tasks": [{"title": t.title, "status": t.status} for t in tasks]
    }
    
    strategy = strategy_agent.analyze(str(data))
    return {"strategy": strategy}