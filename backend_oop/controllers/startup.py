from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.startup import StartupCreate, StartupResponse
from repositories.startup import StartupRepository
from services.startup import StartupService
from utils.auth import AuthDependency

class StartupController:
    def __init__(self):
        self.router = APIRouter(prefix="/startups", tags=["Startups"])
        self.router.add_api_route("", self.create_startup, methods=["POST"], response_model=StartupResponse)
        self.router.add_api_route("", self.get_startups, methods=["GET"], response_model=List[StartupResponse])

    def _get_service(self, db: Session) -> StartupService:
        repo = StartupRepository(db)
        return StartupService(repo)

    def create_startup(self, data: StartupCreate, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).create_startup(current_user["user_id"], data)

    def get_startups(self, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).get_user_startups(current_user["user_id"])

startup_controller = StartupController()
router = startup_controller.router
