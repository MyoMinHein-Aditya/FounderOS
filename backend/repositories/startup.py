from typing import List
from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.startup import Startup

class StartupRepository(BaseRepository[Startup]):
    def __init__(self, db: Session):
        super().__init__(Startup, db)

    def get_by_owner_id(self, owner_id: int) -> List[Startup]:
        return self.db.query(Startup).filter(Startup.owner_id == owner_id).all()
