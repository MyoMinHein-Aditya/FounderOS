from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.goal import GoalCreate
from utils.auth import get_current_user
from services.goal_service import GoalService
from repositories.goal import GoalRepository

class GoalController:
    def __init__(self):
        self.router = APIRouter(prefix="/goal", tags=["Goals"])
        self.router.add_api_route("/create", self.create_goal, methods=["POST"])
        self.router.add_api_route("/get_my_goals", self.get_my_goals, methods=["GET"])
        self.router.add_api_route("/{goal_id}/finish_goal", self.finish_goal, methods=["PATCH"])

    def _get_service(self, db: Session) -> GoalService:
        repo = GoalRepository(db)
        return GoalService(repo, db)

    def create_goal(self, goal: GoalCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        new_goal = service.create(goal, current_user["user_id"])
        return {"message": "Goal Created", "goal_id": new_goal.id}

    def get_my_goals(self, search: str = None, status: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_all_by_owner(current_user["user_id"], search, status, page, limit)

    def finish_goal(self, goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.complete(goal_id, current_user["user_id"])
        return {"message": "Goal Completed"}

goal_controller = GoalController()
router = goal_controller.router
