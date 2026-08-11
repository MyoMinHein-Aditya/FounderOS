from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import SessionLocal
from utils.auth import get_current_user
import models.users
import models.startup
import models.investment
from pydantic import BaseModel

router = APIRouter(prefix="/investor")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class InvestmentRequest(BaseModel):
    startup_id: int
    amount: float

@router.get("/founders")
def get_founders(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "investor":
        raise HTTPException(status_code=403, detail="Only investors can access this data")

    founders = db.query(models.users.User).filter(models.users.User.role == "founder").all()
    results = []
    
    for founder in founders:
        startup = db.query(models.startup.Startup).filter(models.startup.Startup.owner_id == founder.id).first()
        if startup:
            results.append({
                "founder_id": founder.id,
                "founder_name": founder.name,
                "startup_id": startup.id,
                "startup_name": startup.name,
                "startup_description": startup.description,
                "startup_stage": startup.stage,
                "startup_industry": startup.industry,
                "revenue": startup.revenue,
                "stats": startup.stats
            })
            
    return {"data": results}

@router.post("/invest")
def make_investment(request: InvestmentRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "investor":
        raise HTTPException(status_code=403, detail="Only investors can make investments")
        
    startup = db.query(models.startup.Startup).filter(models.startup.Startup.id == request.startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
        
    new_investment = models.investment.Investment(
        investor_id=current_user.id,
        startup_id=startup.id,
        amount=request.amount
    )
    
    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    
    return {"status": "success", "message": "Investment recorded successfully", "data": {"id": new_investment.id, "amount": new_investment.amount}}
