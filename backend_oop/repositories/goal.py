from typing import List
from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.goal import Goal

class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

    def get_by_startup_id(self, startup_id: int) -> List[Goal]:
        return self.db.query(Goal).filter(Goal.startup_id == startup_id).all()
