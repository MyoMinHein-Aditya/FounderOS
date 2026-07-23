from pydantic import BaseModel

class EventCreate(BaseModel):
    startup_id: int
    title: str
    description: str = ""
    date: str
