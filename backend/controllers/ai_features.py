from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from services.ai_service import AIService

class AIFeaturesController:
    def __init__(self):
        self.router = APIRouter(prefix="/ai-features", tags=["AI Workspace"])
        self.router.add_api_route("/strategy/{startup_id}", self.generate_strategy, methods=["POST"])
        self.router.add_api_route("/analyst/{startup_id}", self.financial_analysis, methods=["POST"])
        self.router.add_api_route("/meetings/extract", self.extract_minutes, methods=["POST"])
        self.router.add_api_route("/writer/generate", self.write_document, methods=["POST"])

    def _get_service(self, db: Session) -> AIService:
        return AIService(db)

    def generate_strategy(self, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return {"analysis": service.generate_swot(startup_id, current_user["user_id"])}

    def financial_analysis(self, startup_id: int, metrics_data: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return {"analysis": service.financial_analysis(startup_id, current_user["user_id"], metrics_data)}

    def extract_minutes(self, notes_text: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return {"analysis": service.extract_minutes(notes_text)}

    def write_document(self, doc_type: str, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return {"content": service.write_document(doc_type, startup_id, current_user["user_id"])}

ai_features_controller = AIFeaturesController()
router = ai_features_controller.router
