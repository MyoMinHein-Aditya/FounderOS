from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.audit_log import AuditLogResponse
from utils.auth import get_current_user
from services.audit_log_service import AuditLogService
from repositories.audit_log import AuditLogRepository
from typing import List

router = APIRouter(prefix="/audit", tags=["Audit Log"])

def _get_audit_log_service(db: Session) -> AuditLogService:
    repo = AuditLogRepository(db)
    return AuditLogService(repo, db)

@router.get("/my_logs", response_model=List[AuditLogResponse])
def get_my_audit_logs(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = _get_audit_log_service(db)
    return service.get_logs_for_user(current_user["user_id"])
