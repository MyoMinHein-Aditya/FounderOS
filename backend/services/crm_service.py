from sqlalchemy.orm import Session
from models.crm import CRMLead
from fastapi import HTTPException

class CRMService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, startup_id: int, name: str, stage: str, amount: float) -> CRMLead:
        lead = CRMLead(user_id=user_id, startup_id=startup_id, name=name, stage=stage, amount=amount)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_by_startup(self, user_id: int, startup_id: int) -> list:
        return self.db.query(CRMLead).filter(CRMLead.user_id == user_id, CRMLead.startup_id == startup_id).order_by(CRMLead.id.desc()).all()

    def update_stage(self, lead_id: int, user_id: int, stage: str) -> CRMLead:
        lead = self.db.query(CRMLead).filter(CRMLead.id == lead_id, CRMLead.user_id == user_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        lead.stage = stage
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete(self, lead_id: int, user_id: int) -> bool:
        lead = self.db.query(CRMLead).filter(CRMLead.id == lead_id, CRMLead.user_id == user_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        self.db.delete(lead)
        self.db.commit()
        return True
