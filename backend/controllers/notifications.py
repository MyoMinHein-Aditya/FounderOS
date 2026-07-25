from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.notification_service import NotificationService

class NotificationsController:
    def __init__(self):
        self.router = APIRouter(prefix="/notifications", tags=["Notifications"])
        self.router.add_api_route("/get_unread", self.get_unread, methods=["GET"])
        self.router.add_api_route("/read_all", self.read_all, methods=["POST"])

    def _get_service(self, db: Session) -> NotificationService:
        # Repositories can be injected here as we refactor NotificationService
        return NotificationService(db)

    def get_unread(self, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_unread(current_user["user_id"])

    def read_all(self, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.mark_all_read(current_user["user_id"])
        return {"message": "All notifications marked as read"}

notifications_controller = NotificationsController()
router = notifications_controller.router
