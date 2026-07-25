from pydantic import BaseModel

class CRMLeadCreate(BaseModel):
    name: str

class CRMLeadResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
