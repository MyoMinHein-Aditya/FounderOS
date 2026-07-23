from sqlalchemy.orm import Session
from models.notification import Notification

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def push(self, user_id: int, message: str, link: str = None) -> Notification:
        notif = Notification(user_id=user_id, message=message, link=link)
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def get_unread(self, user_id: int) -> list:
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.read == False).order_by(Notification.id.desc()).all()

    def mark_all_read(self, user_id: int) -> bool:
        self.db.query(Notification).filter(Notification.user_id == user_id, Notification.read == False).update({Notification.read: True})
        self.db.commit()
        return True
