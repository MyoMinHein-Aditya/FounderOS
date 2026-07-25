from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.note import Note

class NoteRepository(BaseRepository[Note]):
    def __init__(self, db: Session):
        super().__init__(Note, db)
