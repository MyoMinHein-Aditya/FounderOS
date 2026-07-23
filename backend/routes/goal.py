from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.goal import GoalCreate
from utils.auth import get_current_user
from services.goal_service import GoalService

router = APIRouter()

@router.post("/create")
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = GoalService(db)
    new_goal = service.create(goal, current_user["user_id"])
    return {"message": "Goal Created", "goal_id": new_goal.id}

@router.get("/get_my_goals")
def get_my_goals(search: str = None, status: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = GoalService(db)
    return service.get_all_by_owner(current_user["user_id"], search, status, page, limit)

@router.patch("/{goal_id}/finish_goal")
def finish_goal(goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = GoalService(db)
    service.complete(goal_id, current_user["user_id"])
    return {"message": "Goal Completed"}