from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer)
    user_id = Column(Integer)
    role = Column(String)  # Admin, Member
    created_at = Column(DateTime, default=datetime.utcnow)
