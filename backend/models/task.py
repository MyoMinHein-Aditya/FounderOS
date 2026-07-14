from sqlalchemy import Column, Integer, String, ForeignKey
from database.base import Base


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    status = Column(String, default="Pending")
    startup_id = Column(Integer, ForeignKey("startups.id"))
    goal_id = Column(Integer, ForeignKey("goals.id"))