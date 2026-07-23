from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.note import NoteCreate, NoteUpdate
from services.note_service import NoteService

router = APIRouter()

@router.post("/create")
def create_note(note: NoteCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NoteService(db)
    return service.create(current_user["user_id"], note.startup_id, note.title, note.content, note.tags)

@router.get("/get_notes/{startup_id}")
def get_notes(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NoteService(db)
    return service.get_by_startup(current_user["user_id"], startup_id)

@router.put("/{note_id}/update")
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NoteService(db)
    return service.update(note_id, current_user["user_id"], note.title, note.content, note.tags)

@router.patch("/{note_id}/toggle_pin")
def toggle_pin(note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NoteService(db)
    return service.toggle_pin(note_id, current_user["user_id"])

@router.delete("/{note_id}/delete")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = NoteService(db)
    service.delete(note_id, current_user["user_id"])
    return {"message": "Note deleted"}

@router.post("/{note_id}/summarize")
def summarize_note(note_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    from models.note import Note
    from agents.founder_agent import founder_agent
    from fastapi import HTTPException
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    prompt = f"Summarize this startup note in clean, human-readable text bullet points (do NOT use raw markdown formatting, just plain text bullets):\nTitle: {note.title}\nContent: {note.content}"
    summary = founder_agent.chat(prompt, "No additional context.", [])
    return {"summary": summary}
