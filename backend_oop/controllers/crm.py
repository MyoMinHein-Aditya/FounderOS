from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.crm import CRMLeadCreate, CRMLeadResponse
from repositories.crm import CRMLeadRepository
from services.crm import CRMLeadService

class CRMLeadController:
    def __init__(self):
        self.router = APIRouter(prefix="/crm_leads", tags=["CRMLead"])
        self.router.add_api_route("", self.create, methods=["POST"], response_model=CRMLeadResponse)
        self.router.add_api_route("", self.get_all, methods=["GET"], response_model=List[CRMLeadResponse])

    def _get_service(self, db: Session) -> CRMLeadService:
        repo = CRMLeadRepository(db)
        return CRMLeadService(repo)

    def create(self, data: CRMLeadCreate, db: Session = Depends(get_db)):
        return self._get_service(db).create(data)

    def get_all(self, db: Session = Depends(get_db)):
        return self._get_service(db).get_all()

crm_controller = CRMLeadController()
router = crm_controller.router
