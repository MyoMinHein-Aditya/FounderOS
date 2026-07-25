from typing import List
from repositories.task import TaskRepository
from schemas.task import TaskCreate
from models.task import Task

class TaskService:
    def __init__(self, repo: TaskRepository):
        self.repo = repo

    def create_task(self, data: TaskCreate) -> Task:
        return self.repo.create(data.model_dump())

    def get_tasks(self) -> List[Task]:
        return self.repo.get_all()

    def update_status(self, task_id: int, status: str) -> Task:
        task = self.repo.get_by_id(task_id)
        if task:
            return self.repo.update(task, {"status": status})
        return None
