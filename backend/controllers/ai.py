from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.chat import ChatRequest
from services.ai_service import AIService

class AIController:
    def __init__(self):
        self.router = APIRouter(prefix="/chat", tags=["AI"])
        self.router.add_api_route("/chat", self.chat, methods=["POST"])
        self.router.add_api_route("/history", self.get_chat_history, methods=["GET"])

    def _get_service(self, db: Session) -> AIService:
        return AIService(db)

    def chat(self, request: ChatRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        response = service.process_chat(request.message, current_user)
        return {"response": response}

    def get_chat_history(self, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_history(current_user["user_id"])

ai_controller = AIController()
router = ai_controller.router
