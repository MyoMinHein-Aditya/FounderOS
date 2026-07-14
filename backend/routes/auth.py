from fastapi import APIRouter
from fastapi import Depends
from fastapi import  HTTPException
from sqlalchemy.orm import Session
from database.dependencies import get_db
from models.users import User
from schemas.user import UserCreate, UserResponse, UserLogin
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token
from utils.auth import get_current_user

router = APIRouter()

@router.post("/register",response_model=UserResponse)
def register(
    user:UserCreate,
    db : Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if(existing_user):
        raise HTTPException(status_code = 400, detail="Email Already Registered")
    
    new_user = User(
        name = user.name,
        email = user.email,
        password = hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user:UserLogin,db:Session=Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail = "Invalid Credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail = "Invalid Credentials")
    
    token = create_access_token({"sub": db_user.email,"user_id": db_user.id})
    return {
        "access_token":token,
        "token_type":"bearer"
    }

@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user