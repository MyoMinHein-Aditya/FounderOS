from sqlalchemy.orm import Session
from models.calendar_event import CalendarEvent
from fastapi import HTTPException
from repositories.calendar import CalendarRepository

class CalendarService:
    def __init__(self, repo: CalendarRepository, db: Session):
        self.repo = repo
        self.db = db

    def create(self, user_id: int, startup_id: int, title: str, description: str, date: str) -> CalendarEvent:
        event = CalendarEvent(user_id=user_id, startup_id=startup_id, title=title, description=description, date=date)
        return self.repo.create(event)

    def get_by_startup(self, user_id: int, startup_id: int) -> list:
        return self.db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id, CalendarEvent.startup_id == startup_id).order_by(CalendarEvent.date.asc()).all()

    def delete(self, event_id: int, user_id: int) -> bool:
        event = self.repo.get_by_id(event_id)
        if not event or event.user_id != user_id:
            raise HTTPException(status_code=404, detail="Event not found")
        self.repo.delete(event_id)
        return True
