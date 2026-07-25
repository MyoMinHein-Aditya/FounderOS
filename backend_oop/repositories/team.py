from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models.team import Team

class TeamRepository(BaseRepository[Team]):
    def __init__(self, db: Session):
        super().__init__(Team, db)
