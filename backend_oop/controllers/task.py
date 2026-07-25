from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from schemas.task import TaskCreate, TaskResponse
from repositories.task import TaskRepository
from services.task import TaskService
from utils.auth import AuthDependency

class TaskStatusUpdate(BaseModel):
    status: str

class TaskController:
    def __init__(self):
        self.router = APIRouter(prefix="/tasks", tags=["Tasks"])
        self.router.add_api_route("", self.create_task, methods=["POST"], response_model=TaskResponse)
        self.router.add_api_route("", self.get_tasks, methods=["GET"], response_model=List[TaskResponse])
        self.router.add_api_route("/{task_id}/status", self.update_status, methods=["PUT"], response_model=TaskResponse)

    def _get_service(self, db: Session) -> TaskService:
        repo = TaskRepository(db)
        return TaskService(repo)

    def create_task(self, data: TaskCreate, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).create_task(data)

    def get_tasks(self, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).get_tasks()

    def update_status(self, task_id: int, data: TaskStatusUpdate, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        task = self._get_service(db).update_status(task_id, data.status)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

task_controller = TaskController()
router = task_controller.router
