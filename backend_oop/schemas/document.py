from pydantic import BaseModel

class DocumentSave(BaseModel):
    startup_id: int
    type: str
    content: str
