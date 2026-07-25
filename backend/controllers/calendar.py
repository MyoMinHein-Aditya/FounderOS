from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.calendar import EventCreate
from services.calendar_service import CalendarService
from repositories.calendar import CalendarRepository

class CalendarController:
    def __init__(self):
        self.router = APIRouter(prefix="/calendar", tags=["Calendar"])
        self.router.add_api_route("/create", self.create_event, methods=["POST"])
        self.router.add_api_route("/get_events/{startup_id}", self.get_events, methods=["GET"])
        self.router.add_api_route("/{event_id}/delete", self.delete_event, methods=["DELETE"])

    def _get_service(self, db: Session) -> CalendarService:
        repo = CalendarRepository(db)
        return CalendarService(repo, db)

    def create_event(self, event: EventCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.create(current_user["user_id"], event.startup_id, event.title, event.description, event.date)

    def get_events(self, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_by_startup(current_user["user_id"], startup_id)

    def delete_event(self, event_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.delete(event_id, current_user["user_id"])
        return {"message": "Event deleted"}

calendar_controller = CalendarController()
router = calendar_controller.router
