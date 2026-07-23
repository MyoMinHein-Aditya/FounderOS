from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.notification_service import NotificationService

router = APIRouter()

@router.get("/get_unread")
def get_unread(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NotificationService(db)
    return service.get_unread(current_user["user_id"])

@router.post("/read_all")
def read_all(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NotificationService(db)
    service.mark_all_read(current_user["user_id"])
    return {"message": "All notifications marked as read"}
