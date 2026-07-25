from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.calendar import CalendarEvent

class CalendarEventRepository(BaseRepository[CalendarEvent]):
    def __init__(self, db: Session):
        super().__init__(CalendarEvent, db)
