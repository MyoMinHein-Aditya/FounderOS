from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from schemas.crm import LeadCreate, LeadStageUpdate
from services.crm_service import CRMService

router = APIRouter()

@router.post("/create")
def create_lead(lead: LeadCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CRMService(db)
    return service.create(current_user["user_id"], lead.startup_id, lead.name, lead.stage, lead.amount)

@router.get("/get_leads/{startup_id}")
def get_leads(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CRMService(db)
    return service.get_by_startup(current_user["user_id"], startup_id)

@router.patch("/{lead_id}/stage")
def update_stage(lead_id: int, update: LeadStageUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CRMService(db)
    return service.update_stage(lead_id, current_user["user_id"], update.stage)

@router.delete("/{lead_id}/delete")
def delete_lead(lead_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = CRMService(db)
    service.delete(lead_id, current_user["user_id"])
    return {"message": "Lead deleted"}
