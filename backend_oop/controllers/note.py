from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.note import NoteCreate, NoteResponse
from repositories.note import NoteRepository
from services.note import NoteService

class NoteController:
    def __init__(self):
        self.router = APIRouter(prefix="/notes", tags=["Note"])
        self.router.add_api_route("", self.create, methods=["POST"], response_model=NoteResponse)
        self.router.add_api_route("", self.get_all, methods=["GET"], response_model=List[NoteResponse])

    def _get_service(self, db: Session) -> NoteService:
        repo = NoteRepository(db)
        return NoteService(repo)

    def create(self, data: NoteCreate, db: Session = Depends(get_db)):
        return self._get_service(db).create(data)

    def get_all(self, db: Session = Depends(get_db)):
        return self._get_service(db).get_all()

note_controller = NoteController()
router = note_controller.router
