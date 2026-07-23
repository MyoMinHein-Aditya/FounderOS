from pydantic import BaseModel

class TeamCreate(BaseModel):
    name: str

class MemberAdd(BaseModel):
    email: str
    role: str = "Member"
