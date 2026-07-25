from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.team import TeamCreate, TeamResponse
from repositories.team import TeamRepository
from services.team import TeamService

class TeamController:
    def __init__(self):
        self.router = APIRouter(prefix="/teams", tags=["Team"])
        self.router.add_api_route("", self.create, methods=["POST"], response_model=TeamResponse)
        self.router.add_api_route("", self.get_all, methods=["GET"], response_model=List[TeamResponse])

    def _get_service(self, db: Session) -> TeamService:
        repo = TeamRepository(db)
        return TeamService(repo)

    def create(self, data: TeamCreate, db: Session = Depends(get_db)):
        return self._get_service(db).create(data)

    def get_all(self, db: Session = Depends(get_db)):
        return self._get_service(db).get_all()

team_controller = TeamController()
router = team_controller.router
