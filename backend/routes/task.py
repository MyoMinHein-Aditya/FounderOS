from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.task import TaskCreate
from utils.auth import get_current_user
from services.task_service import TaskService

router = APIRouter()

@router.post("/create")
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = TaskService(db)
    new_task = service.create(task, current_user["user_id"])
    return {"message": "Task Created", "task_id": new_task.id}

@router.get("/get_tasks/{startup_id}")
def get_tasks(startup_id: int, search: str = None, status: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = TaskService(db)
    return service.get_tasks_by_startup(startup_id, current_user["user_id"], search, status, page, limit)

@router.patch("/{task_id}/finish_task")
def finish_task(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = TaskService(db)
    service.complete(task_id, current_user["user_id"])
    return {"message": "Task Completed"}

@router.post("/generate_from_goal/{goal_id}")
def generate_tasks_from_goal(goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = TaskService(db)
    created_tasks = service.generate_from_goal(goal_id, current_user["user_id"])
    return {
        "message": f"Successfully generated {len(created_tasks)} tasks",
        "tasks": created_tasks
    }