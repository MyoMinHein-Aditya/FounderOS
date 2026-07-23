from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.document import DocumentSave
from services.document_service import DocumentService

router = APIRouter()

@router.post("/save")
def save_document(doc: DocumentSave, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = DocumentService(db)
    return service.save(current_user["user_id"], doc.startup_id, doc.type, doc.content)

@router.get("/get_document/{startup_id}/{type}")
def get_document(startup_id: int, type: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = DocumentService(db)
    return service.get_by_startup(current_user["user_id"], startup_id, type)
