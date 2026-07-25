from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.calendar import CalendarEventCreate, CalendarEventResponse
from repositories.calendar import CalendarEventRepository
from services.calendar import CalendarEventService

class CalendarEventController:
    def __init__(self):
        self.router = APIRouter(prefix="/calendar_events", tags=["CalendarEvent"])
        self.router.add_api_route("", self.create, methods=["POST"], response_model=CalendarEventResponse)
        self.router.add_api_route("", self.get_all, methods=["GET"], response_model=List[CalendarEventResponse])

    def _get_service(self, db: Session) -> CalendarEventService:
        repo = CalendarEventRepository(db)
        return CalendarEventService(repo)

    def create(self, data: CalendarEventCreate, db: Session = Depends(get_db)):
        return self._get_service(db).create(data)

    def get_all(self, db: Session = Depends(get_db)):
        return self._get_service(db).get_all()

calendar_controller = CalendarEventController()
router = calendar_controller.router
