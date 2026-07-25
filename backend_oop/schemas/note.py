from pydantic import BaseModel

class NoteCreate(BaseModel):
    name: str

class NoteResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
