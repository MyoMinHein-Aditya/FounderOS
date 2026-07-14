from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from models.task import Task
from models.startup import Startup
from models.goal import Goal
from schemas.task import TaskCreate
from utils.auth import get_current_user

router = APIRouter()

@router.post("/create")
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == task.startup_id, Startup.owner_id == current_user["user_id"]).first()
    if not startup:
        raise HTTPException(status_code=403, detail="Startup not found or not owned by user")
    
    goal = db.query(Goal).filter(Goal.id == task.goal_id, Goal.startup_id == task.startup_id).first()
    if not goal:
        raise HTTPException(status_code=400, detail="Goal not found for this startup")

    new_task = Task(
        title = task.title,
        startup_id = task.startup_id,
        goal_id = task.goal_id,
        status = "Pending"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task Created",
        "task_id": new_task.id
    }

@router.get("/get_tasks/{startup_id}")
def get_tasks(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == current_user["user_id"]).first()
    if not startup:
        raise HTTPException(status_code=403, detail="Startup not found or not owned by user")

    tasks = db.query(Task).filter(Task.startup_id == startup_id).all()
    return tasks

@router.patch("/{task_id}/finish_task")
def finish_task(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    task = db.query(Task).join(Startup).filter(Task.id == task_id, Startup.owner_id == current_user["user_id"]).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "Completed"
    db.commit()
    return {
        "message": "Task Completed"
    }