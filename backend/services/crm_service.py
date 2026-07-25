from sqlalchemy.orm import Session
from models.crm import CRMLead
from fastapi import HTTPException
from repositories.crm import CRMRepository

class CRMService:
    def __init__(self, repo: CRMRepository, db: Session):
        self.repo = repo
        self.db = db

    def create(self, user_id: int, startup_id: int, name: str, stage: str, amount: float) -> CRMLead:
        lead = CRMLead(user_id=user_id, startup_id=startup_id, name=name, stage=stage, amount=amount)
        return self.repo.create(lead)

    def get_by_startup(self, user_id: int, startup_id: int) -> list:
        return self.db.query(CRMLead).filter(CRMLead.user_id == user_id, CRMLead.startup_id == startup_id).order_by(CRMLead.id.desc()).all()

    def update_stage(self, lead_id: int, user_id: int, stage: str) -> CRMLead:
        lead = self.repo.get_by_id(lead_id)
        if not lead or lead.user_id != user_id:
            raise HTTPException(status_code=404, detail="Lead not found")
        lead.stage = stage
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete(self, lead_id: int, user_id: int) -> bool:
        lead = self.repo.get_by_id(lead_id)
        if not lead or lead.user_id != user_id:
            raise HTTPException(status_code=404, detail="Lead not found")
        self.repo.delete(lead_id)
        return True
