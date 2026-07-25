from typing import List
from repositories.note import NoteRepository
from schemas.note import NoteCreate
from models.note import Note

class NoteService:
    def __init__(self, repo: NoteRepository):
        self.repo = repo

    def create(self, data: NoteCreate) -> Note:
        return self.repo.create(data.model_dump())

    def get_all(self) -> List[Note]:
        return self.repo.get_all()
