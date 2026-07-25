from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.calendar_event import CalendarEvent

class CalendarRepository(BaseRepository[CalendarEvent]):
    def __init__(self, db: Session):
        super().__init__(CalendarEvent, db)
