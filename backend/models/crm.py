from sqlalchemy import Column, Integer, String, Float, DateTime
from database.base import Base
from datetime import datetime

class CRMLead(Base):
    __tablename__ = "crm_leads"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    startup_id = Column(Integer)
    name = Column(String)
    stage = Column(String)  # Lead, Contacted, Term Sheet, Closed
    amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
