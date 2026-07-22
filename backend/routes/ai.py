from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.chat import ChatRequest
from services.ai_service import AIService

router = APIRouter()

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    response = service.process_chat(request.message, current_user)
    return {"response": response}

@router.get("/history")
def get_chat_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = AIService(db)
    return service.get_history(current_user["user_id"])