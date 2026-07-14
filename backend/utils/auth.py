from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import HTTPException, Depends
from jose import jwt
from utils.jwt_handler import (SECRET_KEY, ALGORITHM)

security = HTTPBearer()

def get_current_user(credentials:HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms = [ALGORITHM]
        )
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid Token")