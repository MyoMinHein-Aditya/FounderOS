from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.goal import GoalCreate, GoalResponse
from repositories.goal import GoalRepository
from services.goal import GoalService
from utils.auth import AuthDependency

class GoalController:
    def __init__(self):
        self.router = APIRouter(prefix="/goals", tags=["Goals"])
        self.router.add_api_route("", self.create_goal, methods=["POST"], response_model=GoalResponse)
        self.router.add_api_route("", self.get_goals, methods=["GET"], response_model=List[GoalResponse])
        self.router.add_api_route("/{goal_id}/complete", self.complete_goal, methods=["PUT"], response_model=GoalResponse)

    def _get_service(self, db: Session) -> GoalService:
        repo = GoalRepository(db)
        return GoalService(repo)

    def create_goal(self, data: GoalCreate, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).create_goal(data)

    def get_goals(self, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).get_goals()

    def complete_goal(self, goal_id: int, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        goal = self._get_service(db).mark_completed(goal_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        return goal

goal_controller = GoalController()
router = goal_controller.router
