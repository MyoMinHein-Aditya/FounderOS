from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from models.startup import Startup
from models.goal import Goal
from models.task import Task
from utils.auth import get_current_user

router = APIRouter()

@router.get("/get_stats")
def get_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user["user_id"]
    total_startups = db.query(Startup).filter(Startup.owner_id == user_id).count()
    total_goals = db.query(Goal).join(Startup).filter(Startup.owner_id == user_id).count()
    completed_goals = db.query(Goal).join(Startup).filter(Startup.owner_id == user_id, Goal.status == "Completed").count()
    total_tasks = db.query(Task).join(Startup).filter(Startup.owner_id == user_id).count()
    completed_tasks = db.query(Task).join(Startup).filter(Startup.owner_id == user_id, Task.status == "Completed").count()

    recent_goals = db.query(Goal).join(Startup).filter(Startup.owner_id == user_id).order_by(Goal.id.desc()).limit(5).all()
    recent_goals_list = [{
        "id": g.id,
        "title": g.title,
        "status": g.status,
        "type": "goal"
    } for g in recent_goals]

    recent_tasks = db.query(Task).join(Startup).filter(Startup.owner_id == user_id).order_by(Task.id.desc()).limit(5).all()
    recent_tasks_list = [{
        "id": t.id,
        "title": t.title,
        "status": t.status,
        "type": "task"
    } for t in recent_tasks]

    recent_stuff = sorted(
        recent_goals_list + recent_tasks_list,
        key=lambda x: x["id"],
        reverse=True
    )[:5]

    upcoming_tasks = db.query(Task).join(Startup).filter(Startup.owner_id == user_id, Task.status == "Pending").order_by(Task.id.asc()).limit(5).all()
    todos = [{
        "id": t.id,
        "title": t.title,
        "status": t.status
    } for t in upcoming_tasks]

    return {
        "total_startups": total_startups,
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "recent_stuff": recent_stuff,
        "todos": todos
    }
