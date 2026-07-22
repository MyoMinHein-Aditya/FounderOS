from sqlalchemy.orm import Session
from models.users import User
from schemas.user import UserCreate, UserLogin
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token
from fastapi import HTTPException

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, data: UserCreate) -> User:
        existing_user = self.db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email Already Registered")
        
        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password)
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def login(self, data: UserLogin) -> dict:
        db_user = self.db.query(User).filter(User.email == data.email).first()
        if not db_user or not verify_password(data.password, db_user.password):
            raise HTTPException(status_code=401, detail="Invalid Credentials")
        
        token = create_access_token({"sub": db_user.email, "user_id": db_user.id})
        return {"access_token": token, "token_type": "bearer"}

    def get_user_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
