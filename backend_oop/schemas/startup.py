from pydantic import BaseModel

class StartupCreate(BaseModel):
    name: str
    description: str
    stage: str
    industry: str

class StartupResponse(BaseModel):
    id: int
    name: str
    description: str
    stage: str
    industry: str
    owner_id: int

    class Config:
        from_attributes = True
