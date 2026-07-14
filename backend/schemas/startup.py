from pydantic import BaseModel

class StartupCreate(BaseModel):
    name : str
    description: str
    stage:str
    industry:str