from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.document import DocumentSave
from services.document_service import DocumentService
from repositories.document import DocumentRepository

class DocumentsController:
    def __init__(self):
        self.router = APIRouter(prefix="/documents", tags=["Documents"])
        self.router.add_api_route("/save", self.save_document, methods=["POST"])
        self.router.add_api_route("/get_document/{startup_id}/{type}", self.get_document, methods=["GET"])

    def _get_service(self, db: Session) -> DocumentService:
        repo = DocumentRepository(db)
        return DocumentService(repo, db)

    def save_document(self, doc: DocumentSave, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.save(current_user["user_id"], doc.startup_id, doc.type, doc.content)

    def get_document(self, startup_id: int, type: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_by_startup(current_user["user_id"], startup_id, type)

documents_controller = DocumentsController()
router = documents_controller.router
