from pydantic import BaseModel
from typing import Optional

class GoalCreate(BaseModel):
    title: str
    description: str
    startup_id: int

class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    startup_id: int

    class Config:
        from_attributes = True