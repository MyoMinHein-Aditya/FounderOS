from sqlalchemy import Column, Integer, String
from models.base import Base

class CRMLead(Base):
    __tablename__ = "crm_leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
