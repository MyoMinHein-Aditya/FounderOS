from pydantic import BaseModel

class CalendarEventCreate(BaseModel):
    name: str

class CalendarEventResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
