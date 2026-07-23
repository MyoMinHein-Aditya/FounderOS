from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.ai_service import AIService

router = APIRouter()

@router.post("/strategy/{startup_id}")
def generate_strategy(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    return {"analysis": service.generate_swot(startup_id, current_user["user_id"])}

@router.post("/analyst/{startup_id}")
def financial_analysis(startup_id: int, metrics_data: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    return {"analysis": service.financial_analysis(startup_id, current_user["user_id"], metrics_data)}

@router.post("/meetings/extract")
def extract_minutes(notes_text: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    return {"analysis": service.extract_minutes(notes_text)}

@router.post("/writer/generate")
def write_document(doc_type: str, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    return {"content": service.write_document(doc_type, startup_id, current_user["user_id"])}
