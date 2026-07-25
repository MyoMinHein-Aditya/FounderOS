from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.crm import LeadCreate, LeadStageUpdate
from services.crm_service import CRMService
from repositories.crm import CRMRepository

class CRMController:
    def __init__(self):
        self.router = APIRouter(prefix="/crm", tags=["CRM"])
        self.router.add_api_route("/create", self.create_lead, methods=["POST"])
        self.router.add_api_route("/get_leads/{startup_id}", self.get_leads, methods=["GET"])
        self.router.add_api_route("/{lead_id}/stage", self.update_stage, methods=["PATCH"])
        self.router.add_api_route("/{lead_id}/delete", self.delete_lead, methods=["DELETE"])

    def _get_service(self, db: Session) -> CRMService:
        repo = CRMRepository(db)
        return CRMService(repo, db)

    def create_lead(self, lead: LeadCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.create(current_user["user_id"], lead.startup_id, lead.name, lead.stage, lead.amount)

    def get_leads(self, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_by_startup(current_user["user_id"], startup_id)

    def update_stage(self, lead_id: int, update: LeadStageUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.update_stage(lead_id, current_user["user_id"], update.stage)

    def delete_lead(self, lead_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        service.delete(lead_id, current_user["user_id"])
        return {"message": "Lead deleted"}

crm_controller = CRMController()
router = crm_controller.router
