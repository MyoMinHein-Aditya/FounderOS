from sqlalchemy.orm import Session
from models.goal import Goal
from models.startup import Startup
from schemas.goal import GoalCreate
from fastapi import HTTPException
from repositories.goal import GoalRepository

class GoalService:
    def __init__(self, repo: GoalRepository, db: Session):
        self.repo = repo
        self.db = db

    def create(self, data: GoalCreate, owner_id: int) -> Goal:
        startup = self.db.query(Startup).filter(Startup.id == data.startup_id, Startup.owner_id == owner_id).first()
        if not startup:
            raise HTTPException(status_code=403, detail="Startup not found or not owned by user")
        
        goal = Goal(
            title=data.title,
            description=data.description,
            startup_id=data.startup_id
        )
        return self.repo.create(goal)

    def get_all_by_owner(self, owner_id: int, search: str = None, status: str = None, page: int = 1, limit: int = 10) -> list:
        query = self.db.query(Goal).join(Startup).filter(Startup.owner_id == owner_id)
        if search:
            query = query.filter(Goal.title.ilike(f"%{search}%") | Goal.description.ilike(f"%{search}%"))
        if status:
            query = query.filter(Goal.status == status)
        return query.offset((page - 1) * limit).limit(limit).all()

    def complete(self, goal_id: int, owner_id: int) -> bool:
        goal = self.db.query(Goal).join(Startup).filter(Goal.id == goal_id, Startup.owner_id == owner_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        goal.status = "Completed"
        self.db.commit()
        return True
