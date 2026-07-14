from pydantic import BaseModel

class TaskCreate(BaseModel):
    title:str
    startup_id:int
    goal_id:int