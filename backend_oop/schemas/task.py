from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    startup_id: int
    goal_id: int

class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    startup_id: int
    goal_id: int

    class Config:
        from_attributes = True
