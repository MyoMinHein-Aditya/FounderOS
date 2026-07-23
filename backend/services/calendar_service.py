from sqlalchemy.orm import Session
from models.calendar_event import CalendarEvent
from fastapi import HTTPException

class CalendarService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, startup_id: int, title: str, description: str, date: str) -> CalendarEvent:
        event = CalendarEvent(user_id=user_id, startup_id=startup_id, title=title, description=description, date=date)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_startup(self, user_id: int, startup_id: int) -> list:
        return self.db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id, CalendarEvent.startup_id == startup_id).order_by(CalendarEvent.date.asc()).all()

    def delete(self, event_id: int, user_id: int) -> bool:
        event = self.db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == user_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        self.db.delete(event)
        self.db.commit()
        return True
