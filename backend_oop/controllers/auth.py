from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.user import UserCreate, UserResponse, UserLogin
from repositories.user import UserRepository
from services.auth import AuthService
from utils.auth import AuthDependency

class AuthController:
    def __init__(self):
        self.router = APIRouter(prefix="/auth", tags=["Authentication"])
        self.router.add_api_route("/register", self.register, methods=["POST"], response_model=UserResponse)
        self.router.add_api_route("/login", self.login, methods=["POST"])
        self.router.add_api_route("/me", self.me, methods=["GET"], response_model=UserResponse)

    def _get_service(self, db: Session) -> AuthService:
        repo = UserRepository(db)
        return AuthService(repo)

    def register(self, user: UserCreate, db: Session = Depends(get_db)):
        return self._get_service(db).register(user)

    def login(self, user: UserLogin, db: Session = Depends(get_db)):
        return self._get_service(db).login(user)

    def me(self, current_user: dict = Depends(AuthDependency.get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).get_user_by_id(current_user["user_id"])

auth_controller = AuthController()
router = auth_controller.router
