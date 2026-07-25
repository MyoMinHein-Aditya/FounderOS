from typing import List
from repositories.calendar import CalendarEventRepository
from schemas.calendar import CalendarEventCreate
from models.calendar import CalendarEvent

class CalendarEventService:
    def __init__(self, repo: CalendarEventRepository):
        self.repo = repo

    def create(self, data: CalendarEventCreate) -> CalendarEvent:
        return self.repo.create(data.model_dump())

    def get_all(self) -> List[CalendarEvent]:
        return self.repo.get_all()
