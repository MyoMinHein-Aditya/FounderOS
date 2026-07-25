from sqlalchemy.orm import Session
from models.document import Document

class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    def save(self, user_id: int, startup_id: int, type: str, content: str) -> Document:
        doc = self.db.query(Document).filter(Document.user_id == user_id, Document.startup_id == startup_id, Document.type == type).first()
        if not doc:
            doc = Document(user_id=user_id, startup_id=startup_id, type=type, content=content)
            self.db.add(doc)
        else:
            doc.content = content
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_by_startup(self, user_id: int, startup_id: int, type: str) -> Document:
        doc = self.db.query(Document).filter(Document.user_id == user_id, Document.startup_id == startup_id, Document.type == type).first()
        if not doc:
            return Document(user_id=user_id, startup_id=startup_id, type=type, content="")
        return doc
