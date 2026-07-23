from pydantic import BaseModel

class LeadCreate(BaseModel):
    startup_id: int
    name: str
    stage: str = "Lead"
    amount: float = 0.0

class LeadStageUpdate(BaseModel):
    stage: str
