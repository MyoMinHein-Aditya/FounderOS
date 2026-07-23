from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.startup import StartupCreate
from utils.auth import get_current_user
from services.startup_service import StartupService
from agents.analyst_agent import analyst_agent
from agents.strategy_agent import strategy_agent

router = APIRouter()

@router.post("/create")
def create_startup(startup: StartupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = StartupService(db)
    new_startup = service.create(startup, current_user["user_id"])
    return {"message": "Startup Created", "startup_id": new_startup.id}

@router.get("/get_startups")
def get_startups(search: str = None, page: int = 1, limit: int = 10, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = StartupService(db)
    return service.get_all_by_owner(current_user["user_id"], search, page, limit)

@router.get("/{startup_id}/analyze")
def analyze_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = StartupService(db)
    data = service.compile_data(startup_id, current_user["user_id"])
    if not data:
        raise HTTPException(status_code=404, detail="Startup not found")
    return {"analysis": analyst_agent.analyze(str(data))}

@router.get("/{startup_id}/strategy")
def strategy_startup(startup_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    service = StartupService(db)
    data = service.compile_data(startup_id, current_user["user_id"])
    if not data:
        raise HTTPException(status_code=404, detail="Startup not found")
    return {"strategy": strategy_agent.analyze(str(data))}