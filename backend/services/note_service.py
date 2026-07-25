from sqlalchemy.orm import Session
from models.note import Note
from fastapi import HTTPException
from repositories.note import NoteRepository

class NoteService:
    def __init__(self, repo: NoteRepository, db: Session):
        self.repo = repo
        self.db = db

    def create(self, user_id: int, startup_id: int, title: str, content: str, tags: list = None) -> Note:
        note = Note(user_id=user_id, startup_id=startup_id, title=title, content=content, tags=tags)
        return self.repo.create(note)

    def get_by_startup(self, user_id: int, startup_id: int, search: str = None, tag: str = None, page: int = 1, limit: int = 20) -> list:
        query = self.db.query(Note).filter(Note.user_id == user_id, Note.startup_id == startup_id)
        if search:
            query = query.filter(Note.title.ilike(f"%{search}%") | Note.content.ilike(f"%{search}%"))
        if tag:
            # Simple list contains string for tags array in postgres
            query = query.filter(Note.tags.contains([tag]))
            
        return query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).offset((page - 1) * limit).limit(limit).all()

    def update(self, note_id: int, user_id: int, title: str = None, content: str = None, tags: list = None) -> Note:
        note = self.repo.get_by_id(note_id)
        if not note or note.user_id != user_id:
            raise HTTPException(status_code=404, detail="Note not found")
        if title:
            note.title = title
        if content:
            note.content = content
        if tags is not None:
            note.tags = tags
        self.db.commit()
        self.db.refresh(note)
        return note

    def toggle_pin(self, note_id: int, user_id: int) -> bool:
        note = self.repo.get_by_id(note_id)
        if not note or note.user_id != user_id:
            raise HTTPException(status_code=404, detail="Note not found")
        note.is_pinned = not note.is_pinned
        self.db.commit()
        return True

    def delete(self, note_id: int, user_id: int) -> bool:
        note = self.repo.get_by_id(note_id)
        if not note or note.user_id != user_id:
            raise HTTPException(status_code=404, detail="Note not found")
        self.repo.delete(note_id)
        return True
