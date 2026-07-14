from sqlalchemy import Column, Integer, String, ForeignKey
from database.base import Base
from sqlalchemy.orm import relationship

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default = "Pending")
    startup_id = Column(Integer, ForeignKey("startups.id"))
    tasks = relationship("Task", backref="goal")