from typing import List
from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.task import Task

class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def get_by_startup_id(self, startup_id: int) -> List[Task]:
        return self.db.query(Task).filter(Task.startup_id == startup_id).all()
