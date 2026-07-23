from sqlalchemy.orm import Session
from models.note import Note
from fastapi import HTTPException

class NoteService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, startup_id: int, title: str, content: str, tags: str) -> Note:
        note = Note(user_id=user_id, startup_id=startup_id, title=title, content=content, tags=tags)
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def get_by_startup(self, user_id: int, startup_id: int) -> list:
        return self.db.query(Note).filter(Note.user_id == user_id, Note.startup_id == startup_id).order_by(Note.is_pinned.desc(), Note.id.desc()).all()

    def update(self, note_id: int, user_id: int, title: str, content: str, tags: str) -> Note:
        note = self.db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        note.title = title
        note.content = content
        note.tags = tags
        self.db.commit()
        self.db.refresh(note)
        return note

    def toggle_pin(self, note_id: int, user_id: int) -> Note:
        note = self.db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        note.is_pinned = not note.is_pinned
        self.db.commit()
        self.db.refresh(note)
        return note

    def delete(self, note_id: int, user_id: int) -> bool:
        note = self.db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        self.db.delete(note)
        self.db.commit()
        return True
