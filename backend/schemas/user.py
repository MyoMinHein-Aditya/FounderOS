from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name:str
    email:str
    password:str
    role: Optional[str] = "founder"

class UserResponse(BaseModel):
    id : int
    name : str
    email : str
    role : Optional[str] = None
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email:str
    password:str
    