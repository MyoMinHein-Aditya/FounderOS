from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.dashboard_service import DashboardService

class DashboardController:
    def __init__(self):
        self.router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
        self.router.add_api_route("/get_stats", self.get_stats, methods=["GET"])

    def _get_service(self, db: Session) -> DashboardService:
        return DashboardService(db)

    def get_stats(self, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_stats(current_user["user_id"])

dashboard_controller = DashboardController()
router = dashboard_controller.router
