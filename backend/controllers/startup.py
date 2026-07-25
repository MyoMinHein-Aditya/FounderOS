from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.startup import StartupCreate
from utils.auth import get_current_user
from services.startup_service import StartupService
from agents.analyst_agent import analyst_agent
from agents.strategy_agent import strategy_agent
from repositories.startup import StartupRepository

class StartupController:
    def __init__(self):
        self.router = APIRouter(prefix="/startup", tags=["Startup"])
        self.router.add_api_route("/create", self.create_startup, methods=["POST"])
        self.router.add_api_route("/get_startups", self.get_startups, methods=["GET"])
        self.router.add_api_route("/{startup_id}/analyze", self.analyze_startup, methods=["GET"])
        self.router.add_api_route("/{startup_id}/strategy", self.strategy_startup, methods=["GET"])

    def _get_service(self, db: Session) -> StartupService:
        repo = StartupRepository(db)
        return StartupService(repo, db)

    def create_startup(self, startup: StartupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        new_startup = service.create(startup, current_user["user_id"])
        return {"message": "Startup Created", "startup_id": new_startup.id}

    def get_startups(self, search: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        return service.get_all_by_owner(current_user["user_id"], search, page, limit)

    def analyze_startup(self, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        data = service.compile_data(startup_id, current_user["user_id"])
        if not data:
            raise HTTPException(status_code=404, detail="Startup not found")
        return {"analysis": analyst_agent.analyze(str(data))}

    def strategy_startup(self, startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
        service = self._get_service(db)
        data = service.compile_data(startup_id, current_user["user_id"])
        if not data:
            raise HTTPException(status_code=404, detail="Startup not found")
        return {"strategy": strategy_agent.analyze(str(data))}

startup_controller = StartupController()
router = startup_controller.router
