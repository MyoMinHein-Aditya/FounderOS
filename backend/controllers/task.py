from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.task import TaskCreate
from utils.auth import get_current_user
from services.task_service import TaskService
from repositories.task import TaskRepository

class TaskController:
    def __init__(self):
        self.router = APIRouter(prefix="/task", tags=["Tasks"])
        self.router.add_api_route("/create", self.create_task, methods=["POST"])
        self.router.add_api_route("/get_tasks/{startup_id}", self.get_tasks, methods=["GET"])
        self.router.add_api_route("/{task_id}/finish_task", self.finish_task, methods=["PATCH"])
        self.router.add_api_route("/generate_from_goal/{goal_id}", self.generate_tasks_from_goal, methods=["POST"])

    def _get_service(self, db: Session) -> TaskService:
        repo = TaskRepository(db)
        return TaskService(repo, db)

    def create_task(self, task: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        new_task = service.create(task, current_user["user_id"])
        return {"message": "Task Created", "task_id": new_task.id}

    def get_tasks(self, startup_id: int, search: str = None, status: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_tasks_by_startup(startup_id, current_user["user_id"], search, status, page, limit)

    def finish_task(self, task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.complete(task_id, current_user["user_id"])
        return {"message": "Task Completed"}

    def generate_tasks_from_goal(self, goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        created_tasks = service.generate_from_goal(goal_id, current_user["user_id"])
        return {
            "message": f"Successfully generated {len(created_tasks)} tasks",
            "tasks": created_tasks
        }

task_controller = TaskController()
router = task_controller.router
