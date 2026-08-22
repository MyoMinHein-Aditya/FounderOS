from typing import List
from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.audit_log import AuditLog

class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def get_by_user_id(self, user_id: int) -> List[AuditLog]:
        return self.db.query(AuditLog).filter(AuditLog.user_id == user_id).all()
