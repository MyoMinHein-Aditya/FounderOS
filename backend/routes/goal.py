from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from models.goal import Goal
from models.startup import Startup
from schemas.goal import GoalCreate
from utils.auth import get_current_user

router = APIRouter()

@router.post("/create")
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    startup = db.query(Startup).filter(Startup.id == goal.startup_id, Startup.owner_id == current_user["user_id"]).first()
    if not startup:
        raise HTTPException(status_code=403, detail="Startup not found or not owned by user")
    
    new_goal = Goal(
        title = goal.title,
        description = goal.description,
        startup_id = goal.startup_id
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return {
        "message": "Goal Created",
        "goal_id": new_goal.id
    }

@router.get("/get_my_goals")
def get_my_goals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    goals = db.query(Goal).join(Startup).filter(Startup.owner_id == current_user["user_id"]).all()
    return goals


@router.patch("/{goal_id}/finish_goal")
def finish_goal(goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    goal = db.query(Goal).join(Startup).filter(Goal.id == goal_id, Startup.owner_id == current_user["user_id"]).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.status = "Completed"
    db.commit()
    return {
        "message": "Goal Completed"
    }