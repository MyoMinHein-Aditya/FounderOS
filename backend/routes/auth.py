from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.user import UserCreate, UserResponse, UserLogin
from utils.auth import get_current_user
from services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(user)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(user)

@router.get("/me", response_model=UserResponse)
def me(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.get_user_by_id(current_user["user_id"])