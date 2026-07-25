from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.note import NoteCreate, NoteUpdate
from services.note_service import NoteService
from agents.strategy_agent import strategy_agent
from repositories.note import NoteRepository

class NotesController:
    def __init__(self):
        self.router = APIRouter(prefix="/notes", tags=["Notes"])
        self.router.add_api_route("/create", self.create_note, methods=["POST"])
        self.router.add_api_route("/get_notes/{startup_id}", self.get_notes, methods=["GET"])
        self.router.add_api_route("/{note_id}/update", self.update_note, methods=["PUT"])
        self.router.add_api_route("/{note_id}/toggle_pin", self.toggle_pin, methods=["PATCH"])
        self.router.add_api_route("/{note_id}/delete", self.delete_note, methods=["DELETE"])
        self.router.add_api_route("/{note_id}/summarize", self.summarize_note, methods=["POST"])

    def _get_service(self, db: Session) -> NoteService:
        repo = NoteRepository(db)
        return NoteService(repo, db)

    def create_note(self, note: NoteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.create(current_user["user_id"], note.startup_id, note.title, note.content, note.tags)

    def get_notes(self, startup_id: int, search: str = None, tag: str = None, page: int = 1, limit: int = 20, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_by_startup(current_user["user_id"], startup_id, search, tag, page, limit)

    def update_note(self, note_id: int, note: NoteUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.update(note_id, current_user["user_id"], note.title, note.content, note.tags)

    def toggle_pin(self, note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.toggle_pin(note_id, current_user["user_id"])
        return {"message": "Pin toggled"}

    def delete_note(self, note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.delete(note_id, current_user["user_id"])
        return {"message": "Note deleted"}

    def summarize_note(self, note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        n = service.repo.get_by_id(note_id)
        if not n or n.user_id != current_user["user_id"]:
            raise HTTPException(status_code=404, detail="Note not found")
        
        prompt = f"Summarize this note:\nTitle: {n.title}\nContent:\n{n.content}"
        summary = strategy_agent.analyze(prompt)
        return {"summary": summary}

notes_controller = NotesController()
router = notes_controller.router
