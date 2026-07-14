from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from database.base import Base

class Startup(Base):
    __tablename__ = "startups"

    id = Column(Integer,primary_key=True,index=True)

    name = Column(String,nullable=False)

    description = Column(String)

    stage = Column(String)

    industry = Column(String)

    owner_id = Column(Integer,ForeignKey("users.id"))
