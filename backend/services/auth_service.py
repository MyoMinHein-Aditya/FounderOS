from repositories.user import UserRepository
from schemas.user import UserCreate, UserLogin
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token
from fastapi import HTTPException
from models.users import User

class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, data: UserCreate) -> User:
        existing_user = self.repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email Already Registered")
        
        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            role=data.role
        )
        return self.repo.create(user)

    def login(self, data: UserLogin) -> dict:
        db_user = self.repo.get_by_email(data.email)
        if not db_user or not verify_password(data.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid Credentials")
        
        token = create_access_token({"sub": db_user.email, "user_id": db_user.id})
        return {"access_token": token, "token_type": "bearer"}

    def get_user_by_id(self, user_id: int) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
