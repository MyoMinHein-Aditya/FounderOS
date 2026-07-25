from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.crm import CRMLead

class CRMRepository(BaseRepository[CRMLead]):
    def __init__(self, db: Session):
        super().__init__(CRMLead, db)
