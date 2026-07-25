from typing import Optional
from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.document import Document

class DocumentRepository(BaseRepository[Document]):
    def __init__(self, db: Session):
        super().__init__(Document, db)
