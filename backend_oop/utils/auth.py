from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from utils.jwt_handler import JWTHandler

security = HTTPBearer()

class AuthDependency:
    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        try:
            return JWTHandler.decode_token(credentials.credentials)
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid Token")
