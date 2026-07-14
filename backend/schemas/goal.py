from pydantic import BaseModel
class GoalCreate(BaseModel):
    title:str
    description : str
    startup_id : int