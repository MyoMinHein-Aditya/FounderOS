from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer)
    user_id = Column(Integer)
    username = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
