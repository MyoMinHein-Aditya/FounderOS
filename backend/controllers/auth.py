from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from schemas.user import UserCreate, UserResponse, UserLogin
from repositories.user import UserRepository
from services.auth_service import AuthService
from utils.auth import get_current_user

class AuthController:
    def __init__(self):
        self.router = APIRouter(prefix="/auth", tags=["Authentication"])
        self.router.add_api_route("/register", self.register, methods=["POST"], response_model=UserResponse)
        self.router.add_api_route("/login", self.login, methods=["POST"])
        self.router.add_api_route("/me", self.me, methods=["GET"], response_model=UserResponse)
        self.router.add_api_route("/workspace/{workspace_id}", self.switch_workspace, methods=["POST"])

    def _get_service(self, db: Session) -> AuthService:
        repo = UserRepository(db)
        return AuthService(repo)

    def register(self, user: UserCreate, db: Session = Depends(get_db)):
        return self._get_service(db).register(user)

    def login(self, user: UserLogin, db: Session = Depends(get_db)):
        return self._get_service(db).login(user)

    def me(self, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
        return self._get_service(db).get_user_by_id(current_user["user_id"])

    def switch_workspace(self, workspace_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
        user = self._get_service(db).get_user_by_id(current_user["user_id"])
        user.current_workspace_id = workspace_id
        db.commit()
        return {"message": f"Switched to workspace {workspace_id}"}

auth_controller = AuthController()
router = auth_controller.router
