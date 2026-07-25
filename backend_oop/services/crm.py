from typing import List
from repositories.crm import CRMLeadRepository
from schemas.crm import CRMLeadCreate
from models.crm import CRMLead

class CRMLeadService:
    def __init__(self, repo: CRMLeadRepository):
        self.repo = repo

    def create(self, data: CRMLeadCreate) -> CRMLead:
        return self.repo.create(data.model_dump())

    def get_all(self) -> List[CRMLead]:
        return self.repo.get_all()
