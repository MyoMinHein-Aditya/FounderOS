import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.goal_service import GoalService
from repositories.goal import GoalRepository

router = APIRouter(prefix="/export", tags=["Exports"])

def _get_goal_service(db: Session) -> GoalService:
    repo = GoalRepository(db)
    return GoalService(repo, db)

@router.get("/goals/csv")
def export_goals_csv(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = _get_goal_service(db)
    goals = service.get_all_by_owner(current_user["user_id"], limit=1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Description", "Status", "Startup ID"])
    
    for goal in goals:
        writer.writerow([goal.id, goal.title, goal.description, goal.status, goal.startup_id])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=goals_export.csv"}
    )
