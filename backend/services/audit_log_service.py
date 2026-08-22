from sqlalchemy.orm import Session
from models.audit_log import AuditLog
from repositories.audit_log import AuditLogRepository

class AuditLogService:
    def __init__(self, repo: AuditLogRepository, db: Session):
        self.repo = repo
        self.db = db

    def log_action(self, user_id: int, action: str, resource_type: str, resource_id: int) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id
        )
        return self.repo.create(log_entry)

    def get_logs_for_user(self, user_id: int):
        return self.repo.get_by_user_id(user_id)
