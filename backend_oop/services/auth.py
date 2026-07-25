from fastapi import HTTPException
from repositories.user import UserRepository
from schemas.user import UserCreate, UserLogin
from utils.security import SecurityUtil
from utils.jwt_handler import JWTHandler
from models.user import User

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, data: UserCreate) -> User:
        if self.user_repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email Already Registered")
        
        user_data = {
            "name": data.name,
            "email": data.email,
            "password": SecurityUtil.hash_password(data.password)
        }
        return self.user_repo.create(user_data)

    def login(self, data: UserLogin) -> dict:
        user = self.user_repo.get_by_email(data.email)
        if not user or not SecurityUtil.verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid Credentials")
        
        token = JWTHandler.create_access_token({"sub": user.email, "user_id": user.id})
        return {"access_token": token, "token_type": "bearer"}

    def get_user_by_id(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
