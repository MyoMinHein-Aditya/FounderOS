from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from datetime import datetime
from database.base import Base

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    investor_id = Column(Integer, ForeignKey("users.id"))
    startup_id = Column(Integer, ForeignKey("startups.id"))
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
