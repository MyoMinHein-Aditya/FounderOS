from sqlalchemy import Column, Integer, String
from models.base import Base

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
