from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.calendar import EventCreate
from services.calendar_service import CalendarService

router = APIRouter()

@router.post("/create")
def create_event(event: EventCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CalendarService(db)
    return service.create(current_user["user_id"], event.startup_id, event.title, event.description, event.date)

@router.get("/get_events/{startup_id}")
def get_events(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CalendarService(db)
    return service.get_by_startup(current_user["user_id"], startup_id)

@router.delete("/{event_id}/delete")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CalendarService(db)
    service.delete(event_id, current_user["user_id"])
    return {"message": "Event deleted"}
