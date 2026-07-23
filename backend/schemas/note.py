from pydantic import BaseModel

class NoteCreate(BaseModel):
    startup_id: int
    title: str
    content: str
    tags: str = ""

class NoteUpdate(BaseModel):
    title: str
    content: str
    tags: str = ""
