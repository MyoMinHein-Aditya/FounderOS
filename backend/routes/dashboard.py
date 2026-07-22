from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/get_stats")
def get_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = DashboardService(db)
    return service.get_stats(current_user["user_id"])
