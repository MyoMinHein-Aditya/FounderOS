import os
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

class JWTHandler:
    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    ALGORITHM = "HS256"

    @classmethod
    def create_access_token(cls, data: dict) -> str:
        if not cls.SECRET_KEY:
            raise RuntimeError("JWT_SECRET_KEY environment variable is missing")
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=7)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    @classmethod
    def decode_token(cls, token: str) -> dict:
        if not cls.SECRET_KEY:
            raise RuntimeError("JWT_SECRET_KEY environment variable is missing")
        return jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
